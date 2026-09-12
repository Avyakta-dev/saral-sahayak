import { useEffect, useRef, useState } from 'react';
import type { ClipboardEvent, DragEvent, FormEvent, KeyboardEvent } from 'react';
import {
  ArrowUp,
  ArrowUpRight,
  Camera,
  Check,
  ChevronDown,
  CircleAlert,
  FileText,
  Globe2,
  ImagePlus,
  Info,
  LoaderCircle,
  LockKeyhole,
  MessageCircle,
  Paperclip,
  PenLine,
  Plus,
  Square,
  X,
} from 'lucide-react';
import { AnswerCard } from './components/AnswerCard';
import type { AnalyzeResponse, Language } from './lib/contracts';
import { validateInput } from './lib/contracts';
import { analyzeRemark, fetchCapabilities } from './lib/api';
import {
  probeBackendStatus,
  unavailableFailureMessage,
  type BackendStatus,
} from './lib/backendStatus';
import { loadDemoResponse } from './lib/demo';
import { getWalkthrough, walkthroughRemark } from './lib/walkthrough';
import { IMAGE_ACCEPT, readImage, readTextAttachment, releaseImage } from './lib/attachments';
import type { ImageAttachment } from './lib/attachments';

type Turn = {
  id: number;
  text: string;
  image: ImageAttachment | null;
  language: Language;
  sample: boolean;
  response: AnalyzeResponse | null;
  /** Transport / availability failure for a live turn (not a schema AnalyzeResponse). */
  failure?: string | null;
};

function WelcomeVisual() {
  return (
    <div className="welcome-visual" aria-hidden="true">
      <svg viewBox="0 0 280 138" fill="none">
        <ellipse cx="142" cy="121" rx="93" ry="9" fill="#E8EADB" />
        <g transform="rotate(-12 94 66)">
          <rect x="45" y="25" width="92" height="93" rx="13" fill="#F3E6CC" stroke="#D9C7A4" />
          <rect x="57" y="37" width="68" height="43" rx="6" fill="#FFFAEF" />
          <circle cx="107" cy="48" r="5" fill="#DCA868" />
          <path
            d="m62 74 17-20 15 15 9-10 17 15"
            stroke="#B89465"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M61 93h49M61 101h32" stroke="#BDAB88" strokeWidth="3" strokeLinecap="round" />
        </g>
        <g transform="rotate(10 180 65)">
          <rect x="132" y="13" width="99" height="105" rx="13" fill="#FCFDF7" stroke="#CBD4BE" />
          <rect x="145" y="27" width="30" height="8" rx="4" fill="#DBE6CB" />
          <path
            d="M145 48h69M145 58h55M145 68h62"
            stroke="#CCD6C0"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect x="145" y="81" width="68" height="22" rx="5" fill="#EDF3E5" />
          <path
            d="m153 92 4 4 7-9"
            stroke="#467843"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M174 92h28" stroke="#92AF80" strokeWidth="3" strokeLinecap="round" />
        </g>
        <rect x="109" y="84" width="53" height="43" rx="14" fill="#166534" />
        <path
          d="M124 97h22v13h-13l-6 5v-5h-3V97Z"
          stroke="white"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M129 102h12M129 106h8" stroke="#DDEDD3" strokeWidth="1.7" strokeLinecap="round" />
        <path
          d="M240 41v10m-5-5h10M30 76v8m-4-4h8"
          stroke="#AFBA9B"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default function App() {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [attachment, setAttachment] = useState<ImageAttachment | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [readingFile, setReadingFile] = useState(false);
  const [pending, setPending] = useState(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    kind: 'checking',
    label: 'Checking analysis backend…',
  });
  const [dragging, setDragging] = useState(false);
  const [zoomImage, setZoomImage] = useState<ImageAttachment | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const textInput = useRef<HTMLInputElement>(null);
  const attachMenu = useRef<HTMLDetailsElement>(null);
  const infoDialog = useRef<HTMLDialogElement>(null);
  const imageDialog = useRef<HTMLDialogElement>(null);
  const threadEnd = useRef<HTMLDivElement>(null);
  const request = useRef<AbortController | null>(null);
  const fileVersion = useRef(0);
  const turnId = useRef(0);
  const retainedImages = useRef(new Set<ImageAttachment>());
  const currentAttachment = useRef<ImageAttachment | null>(null);
  const dragDepth = useRef(0);
  const count = Array.from(text).length;
  const hasConversation = turns.length > 0;

  useEffect(
    () => () => {
      request.current?.abort();
      fileVersion.current += 1;
      retainedImages.current.forEach(releaseImage);
      retainedImages.current.clear();
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const status = await probeBackendStatus(controller.signal);
        if (!controller.signal.aborted) setBackendStatus(status);
      } catch (cause) {
        if (controller.signal.aborted || (cause instanceof Error && cause.name === 'AbortError'))
          return;
        if (!controller.signal.aborted) {
          setBackendStatus({
            kind: 'unreachable',
            label: 'Analysis backend unreachable',
            detail: 'Could not complete the readiness probe.',
          });
        }
      }
    })();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!textarea.current) return;
    textarea.current.style.height = 'auto';
    textarea.current.style.height = `${Math.min(160, Math.max(70, textarea.current.scrollHeight))}px`;
  }, [text, hasConversation]);

  useEffect(() => {
    if (hasConversation) threadEnd.current?.scrollIntoView({ block: 'end', behavior: 'instant' });
  }, [turns, pending, hasConversation]);

  useEffect(() => {
    if (zoomImage) imageDialog.current?.showModal();
  }, [zoomImage]);

  useEffect(() => {
    const closeMenu = (event: PointerEvent) => {
      if (attachMenu.current && !attachMenu.current.contains(event.target as Node))
        attachMenu.current.open = false;
    };
    document.addEventListener('pointerdown', closeMenu);
    return () => document.removeEventListener('pointerdown', closeMenu);
  }, []);

  function forgetImage(image: ImageAttachment) {
    if (retainedImages.current.delete(image)) releaseImage(image);
  }

  function updateAttachment(image: ImageAttachment | null) {
    currentAttachment.current = image;
    setAttachment(image);
  }

  function removeAttachment() {
    fileVersion.current += 1;
    setReadingFile(false);
    if (currentAttachment.current) forgetImage(currentAttachment.current);
    updateAttachment(null);
    setNotice('Image removed.');
    textarea.current?.focus();
  }

  function closeMenu() {
    if (attachMenu.current) attachMenu.current.open = false;
  }

  async function addFile(file: File) {
    closeMenu();
    const version = ++fileVersion.current;
    setError('');
    setNotice('');
    setReadingFile(true);
    try {
      if (file.name.toLowerCase().endsWith('.txt')) {
        const imported = await readTextAttachment(file);
        if (version !== fileVersion.current) return;
        const combined = text.trim() ? `${text}\n\n${imported}` : imported;
        const validation = validateInput(combined, language);
        if (validation) throw new Error(validation);
        setText(combined);
        setNotice(`Text added from ${file.name}.`);
      } else {
        const image = await readImage(file);
        if (version !== fileVersion.current) {
          releaseImage(image);
          return;
        }
        if (currentAttachment.current) forgetImage(currentAttachment.current);
        retainedImages.current.add(image);
        updateAttachment(image);
        setNotice('Image added locally. Text extraction is not connected yet.');
      }
      textarea.current?.focus();
    } catch (cause) {
      if (version === fileVersion.current)
        setError(
          cause instanceof Error
            ? cause.message
            : 'This file could not be opened. Try a PNG, JPG, WebP or plain text file.',
        );
    } finally {
      if (version === fileVersion.current) setReadingFile(false);
    }
  }

  function chooseFiles(files: FileList | null) {
    if (!files?.length) return;
    if (files.length > 1) {
      setError('Add one file at a time. You can replace an image before sending.');
      return;
    }
    void addFile(files[0]);
  }

  function paste(event: ClipboardEvent<HTMLTextAreaElement>) {
    if (event.clipboardData.files.length) {
      event.preventDefault();
      chooseFiles(event.clipboardData.files);
    }
  }

  function drop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    if (!pending) chooseFiles(event.dataTransfer.files);
  }

  function trimThread(previous: Turn[], next: Turn) {
    const all = [...previous, next];
    const removed = all.slice(0, Math.max(0, all.length - 6));
    removed.forEach((turn) => {
      if (turn.image) forgetImage(turn.image);
    });
    return all.slice(-6);
  }

  function cancelRequest(notice = 'Request cancelled.') {
    request.current?.abort();
    request.current = null;
    setPending(false);
    setTurns((previous) =>
      previous.filter((turn) => turn.response !== null || Boolean(turn.failure)),
    );
    if (notice) setNotice(notice);
  }

  function newChat() {
    cancelRequest('');
    fileVersion.current += 1;
    setReadingFile(false);
    retainedImages.current.forEach(releaseImage);
    retainedImages.current.clear();
    updateAttachment(null);
    setTurns([]);
    setText('');
    setError('');
    setNotice('');
    setZoomImage(null);
    imageDialog.current?.close();
    closeMenu();
  }

  function editTurn(turn: Turn) {
    cancelRequest('');
    setText(turn.text);
    if (currentAttachment.current && currentAttachment.current !== turn.image)
      forgetImage(currentAttachment.current);
    updateAttachment(turn.image);
    setTurns((previous) => previous.filter((item) => item.id !== turn.id));
    setNotice('Edit your message below.');
    setError('');
    requestAnimationFrame(() => textarea.current?.focus());
  }

  function send(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (pending || readingFile) return;
    const validation =
      text.trim() || count > 8000
        ? validateInput(text, language)
        : attachment
          ? null
          : 'Add a remark or an image to get started.';
    if (validation) {
      setError(validation);
      textarea.current?.focus();
      return;
    }

    const trimmed = text.trim();
    const image = attachment;
    const selectedLanguage = language;

    // Image-only: OCR is not connected; do not auto-call analyze or invent text.
    if (!trimmed && image) {
      const next: Turn = {
        id: ++turnId.current,
        text: '',
        image,
        sample: false,
        response: null,
        failure:
          'Got the image. Reading it is the next piece. OCR and claim analysis from images are not available yet; nothing was uploaded or extracted.',
        language: selectedLanguage,
      };
      setTurns((previous) => trimThread(previous, next));
      updateAttachment(null);
      setText('');
      setError('');
      setNotice('');
      closeMenu();
      return;
    }

    const controller = new AbortController();
    request.current = controller;
    const id = ++turnId.current;
    setPending(true);
    setError('');
    setNotice('');
    const next: Turn = {
      id,
      text: trimmed,
      image,
      sample: false,
      response: null,
      failure: null,
      language: selectedLanguage,
    };
    setTurns((previous) => trimThread(previous, next));
    updateAttachment(null);
    setText('');
    closeMenu();

    void (async () => {
      try {
        try {
          const capabilities = await fetchCapabilities(controller.signal);
          if (!capabilities.analysis_available) {
            if (request.current !== controller || controller.signal.aborted) return;
            setBackendStatus({
              kind: 'not_ready',
              label: 'Backend reachable — analysis not ready',
              detail: unavailableFailureMessage(capabilities),
            });
            setTurns((previous) =>
              previous.map((turn) =>
                turn.id === id
                  ? {
                      ...turn,
                      failure: unavailableFailureMessage(capabilities),
                    }
                  : turn,
              ),
            );
            return;
          }
          setBackendStatus({
            kind: 'ready',
            label: 'Analysis available (config + structure only)',
            detail:
              'Not a policy, connectivity, or language-quality certificate. Synthetic inputs only.',
          });
        } catch (cause) {
          if (controller.signal.aborted || (cause instanceof Error && cause.name === 'AbortError'))
            return;
          // Fall through to analyze; a missing capabilities route still allows a direct analyze attempt.
        }

        const response = await analyzeRemark({
          text: trimmed,
          language: selectedLanguage,
          signal: controller.signal,
        });
        if (request.current !== controller || controller.signal.aborted) return;
        setTurns((previous) =>
          previous.map((turn) => (turn.id === id ? { ...turn, response, failure: null } : turn)),
        );
      } catch (cause) {
        if (controller.signal.aborted || (cause instanceof Error && cause.name === 'AbortError'))
          return;
        const message =
          cause instanceof Error && cause.message
            ? cause.message
            : 'The analysis service could not be reached.';
        setTurns((previous) =>
          previous.map((turn) => (turn.id === id ? { ...turn, failure: message } : turn)),
        );
      } finally {
        if (request.current === controller) {
          request.current = null;
          setPending(false);
        }
      }
    })();
  }

  function composerKey(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  }

  async function openExample() {
    if (pending || readingFile) return;
    const controller = new AbortController();
    request.current = controller;
    const id = ++turnId.current;
    const selectedLanguage = language;
    setPending(true);
    setError('');
    setNotice('');
    const next: Turn = {
      id,
      text: walkthroughRemark(language),
      image: null,
      sample: true,
      response: null,
      language,
    };
    setTurns((previous) => trimThread(previous, next));
    try {
      await loadDemoResponse('success', selectedLanguage, controller.signal);
      if (request.current !== controller || controller.signal.aborted) return;
      const response = getWalkthrough(selectedLanguage);
      setTurns((previous) =>
        previous.map((turn) => (turn.id === id ? { ...turn, response } : turn)),
      );
    } catch {
      if (!controller.signal.aborted) {
        setTurns((previous) => previous.filter((turn) => turn.id !== id));
        setError('The sample could not be opened. Please try again.');
      }
    } finally {
      if (request.current === controller) {
        request.current = null;
        setPending(false);
      }
    }
  }

  function changeLanguage(value: Language) {
    if (pending) cancelRequest('Request cancelled.');
    setLanguage(value);
    setNotice(hasConversation ? 'Language updated for new replies.' : '');
  }

  const composer = (
    <div className="composer-dock">
      <form
        className={`composer${dragging ? ' drag-active' : ''}`}
        onSubmit={send}
        noValidate
        onDragEnter={(event) => {
          event.preventDefault();
          dragDepth.current += 1;
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault();
          dragDepth.current -= 1;
          if (dragDepth.current <= 0) setDragging(false);
        }}
        onDrop={drop}
        aria-label="Message composer"
      >
        {dragging && (
          <div className="drop-overlay">
            <ImagePlus size={28} aria-hidden="true" />
            <strong>Drop your screenshot here</strong>
            <span>PNG, JPG or WebP · up to 10 MB</span>
          </div>
        )}
        {attachment && (
          <div className="attachment-preview">
            <button
              type="button"
              className="attachment-thumb"
              aria-label={`Enlarge ${attachment.name}`}
              onClick={() => setZoomImage(attachment)}
            >
              <img src={attachment.url} alt="Attached screenshot preview" />
            </button>
            <div>
              <strong>{attachment.name}</strong>
              <span>{(attachment.file.size / 1024).toFixed(0)} KB · local preview</span>
              <small>OCR isn’t connected yet</small>
            </div>
            <button
              className="icon-button"
              type="button"
              onClick={removeAttachment}
              aria-label="Remove attached image"
            >
              <X size={17} aria-hidden="true" />
            </button>
          </div>
        )}
        <label className="sr-only" htmlFor="message-input">
          Your message
        </label>
        <textarea
          ref={textarea}
          id="message-input"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setError('');
          }}
          onPaste={paste}
          onKeyDown={composerKey}
          placeholder={
            attachment
              ? 'Add the rejection wording or a note about this image…'
              : 'Paste your rejection remark, or add a screenshot…'
          }
          rows={2}
          spellCheck={false}
          autoComplete="off"
          readOnly={pending || readingFile}
          aria-invalid={error ? true : undefined}
          aria-describedby={`preview-limit${error ? ' composer-error' : ''}`}
          dir="auto"
        />
        <div className="composer-tools">
          <div className="input-tools">
            <details
              ref={attachMenu}
              className="attachment-menu"
              onKeyDown={(event) => {
                if (event.key === 'Escape') closeMenu();
              }}
            >
              <summary aria-label="Add a file">
                <Paperclip size={20} aria-hidden="true" />
                <span>Attach</span>
                <ChevronDown size={12} aria-hidden="true" />
              </summary>
              <div className="attachment-options">
                <button
                  type="button"
                  disabled={pending || readingFile}
                  onClick={() => {
                    closeMenu();
                    fileInput.current?.click();
                  }}
                >
                  <ImagePlus size={19} aria-hidden="true" />
                  <span>
                    Upload an image<small>PNG, JPG, WebP · 10 MB</small>
                  </span>
                </button>
                <button
                  type="button"
                  disabled={pending || readingFile}
                  onClick={() => {
                    closeMenu();
                    cameraInput.current?.click();
                  }}
                >
                  <Camera size={19} aria-hidden="true" />
                  <span>
                    Take a photo<small>Camera on supported devices</small>
                  </span>
                </button>
                <button
                  type="button"
                  disabled={pending || readingFile}
                  onClick={() => {
                    closeMenu();
                    textInput.current?.click();
                  }}
                >
                  <FileText size={19} aria-hidden="true" />
                  <span>
                    Add a text file<small>Plain text .txt · 8,000 characters</small>
                  </span>
                </button>
              </div>
            </details>
            <button
              className="icon-button camera-shortcut"
              type="button"
              disabled={pending || readingFile}
              onClick={() => cameraInput.current?.click()}
              aria-label="Take a photo"
              title="Camera on supported phones; file picker on desktop"
            >
              <Camera size={19} aria-hidden="true" />
            </button>
            <span className="composer-formats">Text & images</span>
          </div>
          <div className="send-tools">
            {readingFile ? (
              <span className="file-loading" role="status">
                <LoaderCircle className="spin" size={15} aria-hidden="true" /> Opening file
              </span>
            ) : count > 7000 ? (
              <span className={count > 8000 ? 'count invalid' : 'count'}>
                {count.toLocaleString('en-IN')} / 8,000
              </span>
            ) : (
              <span className="keyboard-hint">Shift + Enter for a new line</span>
            )}
            {pending ? (
              <button
                className="send-button stop-button"
                type="button"
                onClick={() => cancelRequest('Request cancelled.')}
                aria-label="Stop request"
              >
                <Square size={17} aria-hidden="true" />
              </button>
            ) : (
              <button
                className="send-button"
                type="submit"
                disabled={readingFile || (!text.trim() && !attachment)}
                aria-label="Send message"
              >
                <ArrowUp size={21} strokeWidth={2.5} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </form>
      {error && (
        <p className="composer-error" id="composer-error" role="alert">
          <CircleAlert size={15} aria-hidden="true" />
          {error}
        </p>
      )}
      <p className="composer-notice" role="status">
        {notice}
      </p>
      <p
        className={`preview-limit backend-status backend-status-${backendStatus.kind}`}
        id="preview-limit"
        role="status"
        title={backendStatus.detail ?? backendStatus.label}
      >
        <LockKeyhole size={12} aria-hidden="true" /> {backendStatus.label}. OCR isn’t connected.{' '}
        <button type="button" onClick={() => infoDialog.current?.showModal()}>
          Details
        </button>
      </p>
    </div>
  );

  return (
    <div className="chat-app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className={hasConversation ? 'app-header has-conversation' : 'app-header'}>
        <a className="wordmark" href="#main">
          Saral<span> Sahayak</span>
          <i aria-hidden="true">.</i>
        </a>
        <span className="header-context">Your EPFO companion</span>
        <div className="header-actions">
          {hasConversation && (
            <button type="button" className="new-chat" onClick={newChat} aria-label="New chat">
              <Plus size={17} aria-hidden="true" />
              <span>New chat</span>
            </button>
          )}
          <div className="language-select">
            <Globe2 size={16} aria-hidden="true" />
            <label className="sr-only" htmlFor="language">
              Output language
            </label>
            <select
              id="language"
              value={language}
              onChange={(event) => changeLanguage(event.target.value as Language)}
              title="Language for new replies"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>
            <ChevronDown size={12} aria-hidden="true" />
          </div>
          <button
            className="preview-badge"
            type="button"
            onClick={() => infoDialog.current?.showModal()}
          >
            <span aria-hidden="true" />
            Preview
          </button>
        </div>
      </header>
      <main
        className={hasConversation ? 'chat-main conversation-mode' : 'chat-main welcome-mode'}
        id="main"
        tabIndex={-1}
      >
        {!hasConversation ? (
          <div className="welcome-layout">
            <section className="welcome" aria-labelledby="welcome-title">
              <WelcomeVisual />
              <p className="eyebrow">Less confusion. A clearer next step.</p>
              <h1 id="welcome-title">
                Let’s make sense
                <br /> of your claim.
              </h1>
              <p className="welcome-caption">Paste a remark. Add a screenshot. Start here.</p>
            </section>
            {composer}
            <div className="starter-actions">
              <button
                className="starter-card"
                type="button"
                onClick={() => void openExample()}
                disabled={pending || readingFile}
              >
                <span className="starter-illustration sample-illustration">
                  <MessageCircle size={23} aria-hidden="true" />
                  <Check size={12} className="mini-check" aria-hidden="true" />
                </span>
                <span>
                  <strong>Show me an example</strong>
                  <small>A quick, visual walkthrough</small>
                </span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </button>
              <button
                className="starter-card"
                type="button"
                disabled={readingFile}
                onClick={() => fileInput.current?.click()}
              >
                <span className="starter-illustration image-illustration">
                  <ImagePlus size={23} aria-hidden="true" />
                </span>
                <span>
                  <strong>Add a screenshot</strong>
                  <small>Or drag & drop it here</small>
                </span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="welcome-footer">
              <span>English & हिन्दी</span>
              <span aria-hidden="true">·</span>
              <span>No account needed</span>
              <span aria-hidden="true">·</span>
              <span>You choose when to send</span>
            </div>
          </div>
        ) : (
          <>
            <h1 className="sr-only">Your conversation</h1>
            <section className="conversation" aria-label="Conversation">
              <div className="thread">
                {turns.map((turn) => (
                  <article className="turn" key={turn.id}>
                    <div className="user-message">
                      {turn.sample && (
                        <span className="sample-message-label">Illustrative example</span>
                      )}
                      {turn.image && (
                        <button
                          className="message-image"
                          type="button"
                          onClick={() => setZoomImage(turn.image)}
                          aria-label={`Enlarge ${turn.image.name}`}
                        >
                          <img src={turn.image.url} alt="Your attached image" />
                          <span>
                            <ImagePlus size={13} aria-hidden="true" />
                            {turn.image.name}
                          </span>
                        </button>
                      )}
                      {turn.text && (
                        <p dir="auto" lang={turn.sample ? turn.language : undefined}>
                          {turn.text}
                        </p>
                      )}
                      <button
                        className="edit-message"
                        type="button"
                        onClick={() => editTurn(turn)}
                        aria-label="Edit this message"
                      >
                        <PenLine size={13} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="assistant-message">
                      <span className="assistant-avatar" aria-hidden="true">
                        <MessageCircle size={18} />
                      </span>
                      <div className="assistant-content">
                        {turn.sample ? (
                          turn.response ? (
                            <AnswerCard
                              mode="sample"
                              response={turn.response}
                              onEdit={() => editTurn(turn)}
                            />
                          ) : (
                            <div className="opening-sample" role="status">
                              <LoaderCircle className="spin" size={17} aria-hidden="true" />
                              Opening the sample walkthrough…
                            </div>
                          )
                        ) : turn.response ? (
                          <AnswerCard
                            mode="live"
                            response={turn.response}
                            onEdit={() => editTurn(turn)}
                          />
                        ) : turn.failure ? (
                          <div className="unavailable-reply" role="status">
                            <span className="reply-kicker">
                              {turn.image && !turn.text ? 'Image attached' : 'Live analysis'}
                            </span>
                            <h2>
                              {turn.image && !turn.text
                                ? 'Got the image. Reading it is the next piece.'
                                : 'Your message is here. Analysis isn’t available yet.'}
                            </h2>
                            <p>{turn.failure}</p>
                            <div className="reply-actions">
                              <button
                                className="light-button"
                                type="button"
                                disabled={pending || readingFile}
                                onClick={() => void openExample()}
                              >
                                <MessageCircle size={16} aria-hidden="true" /> See an example{' '}
                                <ArrowUpRight size={14} aria-hidden="true" />
                              </button>
                              <button
                                className="text-button"
                                type="button"
                                onClick={() => editTurn(turn)}
                              >
                                <PenLine size={14} aria-hidden="true" />
                                {turn.image && !turn.text ? 'Add or edit wording' : 'Edit message'}
                              </button>
                            </div>
                            <details className="connection-details">
                              <summary>Why can’t it answer yet?</summary>
                              <p>
                                Live analyze calls the backend only when you submit text. It never
                                auto-submits a claim, never substitutes a canned sample for your
                                remark, and never sends ANALYSIS_ACCESS_TOKEN or LLM keys from the
                                browser. Images stay local until OCR exists. If the backend is up
                                but not ready, check model configuration, corpus structure,
                                CORS_ORIGINS for this exact page origin (127.0.0.1 vs localhost),
                                and VITE_API_BASE_URL.
                              </p>
                            </details>
                          </div>
                        ) : (
                          <div className="opening-sample" role="status">
                            <LoaderCircle className="spin" size={17} aria-hidden="true" />
                            Analyzing with grounded evidence…
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
                <div ref={threadEnd} />
              </div>
            </section>
            <div className="conversation-composer">{composer}</div>
          </>
        )}
      </main>
      <input
        ref={fileInput}
        className="sr-only"
        type="file"
        accept={IMAGE_ACCEPT}
        tabIndex={-1}
        aria-label="Choose image file"
        onChange={(event) => {
          chooseFiles(event.target.files);
          event.target.value = '';
        }}
      />
      <input
        ref={cameraInput}
        className="sr-only"
        type="file"
        accept={IMAGE_ACCEPT}
        capture="environment"
        tabIndex={-1}
        aria-label="Capture photo"
        onChange={(event) => {
          chooseFiles(event.target.files);
          event.target.value = '';
        }}
      />
      <input
        ref={textInput}
        className="sr-only"
        type="file"
        accept=".txt,text/plain"
        tabIndex={-1}
        aria-label="Choose text file"
        onChange={(event) => {
          chooseFiles(event.target.files);
          event.target.value = '';
        }}
      />
      <dialog className="info-dialog" ref={infoDialog} aria-labelledby="preview-info-title">
        <button
          className="dialog-close icon-button"
          type="button"
          onClick={() => infoDialog.current?.close()}
          aria-label="Close preview details"
        >
          <X size={20} aria-hidden="true" />
        </button>
        <span className="dialog-icon">
          <Info size={25} aria-hidden="true" />
        </span>
        <h2 id="preview-info-title">What works in this preview</h2>
        <ul className="capability-list">
          <li>
            <Check size={17} aria-hidden="true" />
            <span>Type, paste, or import a text file</span>
          </li>
          <li>
            <Check size={17} aria-hidden="true" />
            <span>Add, paste, photograph or preview an image</span>
          </li>
          <li>
            <Check size={17} aria-hidden="true" />
            <span>Explore a clearly labelled sample answer</span>
          </li>
        </ul>
        <div className="connection-note">
          <strong>How live analyze works</strong>
          <p>
            With a running backend and VITE_API_BASE_URL (or same-origin), submitting text calls{' '}
            <code>/api/v1/analyze</code>. The status line reports capabilities readiness for judges.
            Image text extraction, voice, PDF reading and document downloads are still unavailable.
            Sample answers remain illustrative—not advice or a usable claim draft. Nothing is
            auto-submitted.
          </p>
        </div>
        <p className="dialog-privacy">
          <LockKeyhole size={15} aria-hidden="true" />
          Use fictional or redacted material. LLM keys and ANALYSIS_ACCESS_TOKEN stay server-side
          only. Camera availability depends on your device.
        </p>
        <small>Not an official EPFO service or legal advice.</small>
      </dialog>
      <dialog
        className="image-dialog"
        ref={imageDialog}
        aria-label="Image preview"
        onClose={() => setZoomImage(null)}
      >
        <button
          className="dialog-close icon-button"
          type="button"
          onClick={() => imageDialog.current?.close()}
          aria-label="Close image preview"
        >
          <X size={20} aria-hidden="true" />
        </button>
        {zoomImage && (
          <>
            <img src={zoomImage.url} alt={`Full preview of ${zoomImage.name}`} />
            <p>
              {zoomImage.name}
              <span>Local preview · no text has been extracted</span>
            </p>
          </>
        )}
      </dialog>
    </div>
  );
}

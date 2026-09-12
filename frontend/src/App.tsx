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
import { useLocale, locales, nativeNames, type UiLocale, type Message } from './lib/i18n';
import type { AnalyzeResponse, Language, AnalysisActivity } from './lib/contracts';
import { ActivityPanel } from './components/ActivityPanel';
import {
  imageInputAvailable,
  validateInput,
  type Capabilities,
  type OutputLanguage,
} from './lib/contracts';
import {
  analyzeImageStream,
  analyzeTextStream,
  createImageUpload,
  getCapabilities,
  uploadImage,
  ApiError,
} from './lib/api';

const live = import.meta.env.VITE_ENABLE_ANALYSIS === 'true';
import { loadDemoResponse } from './lib/demo';
import { getWalkthrough, walkthroughRemark } from './lib/walkthrough';
import { IMAGE_ACCEPT, readImage, readTextAttachment, releaseImage } from './lib/attachments';
import type { ImageAttachment } from './lib/attachments';

/**
 * Upload one reviewed image to private storage, then analyze by opaque key.
 * The image is never an addition to text: the backend takes exactly one input.
 */
async function analyzeReviewedImage(
  image: ImageAttachment,
  language: OutputLanguage,
  signal: AbortSignal,
  onActivity: (activity: AnalysisActivity) => void,
): Promise<AnalyzeResponse> {
  const ticket = await createImageUpload(language, image.file.type, signal);
  await uploadImage(ticket, image.file, signal);
  return analyzeImageStream(ticket.object_key, language, signal, onActivity);
}

type Turn = {
  id: number;
  text: string;
  image: ImageAttachment | null;
  language: OutputLanguage;
  sample: boolean;
  failure?: string;
  activity?: AnalysisActivity[];
  response: AnalyzeResponse | null;
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
  const { locale, setLocale, t, message } = useLocale();
  const [text, setText] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [outputLanguage, setOutputLanguage] = useState<OutputLanguage>('en');
  const [capabilities, setCapabilities] = useState<Capabilities | null>(null);
  const [capabilityError, setCapabilityError] = useState('');
  const consentDialog = useRef<HTMLDialogElement>(null);
  const pendingLiveId = useRef<number | null>(null);
  const [consent, setConsent] = useState<{
    text: string;
    language: OutputLanguage;
    image: ImageAttachment | null;
  } | null>(null);
  const [attachment, setAttachment] = useState<ImageAttachment | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState<string | Message>('');
  const [readingFile, setReadingFile] = useState(false);
  const [pending, setPending] = useState(false);
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
    if (!live) return;
    const controller = new AbortController();
    void getCapabilities(controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setCapabilities(value);
      })
      .catch((cause) => {
        if (!controller.signal.aborted)
          setCapabilityError(
            cause instanceof ApiError ? cause.message : 'Backend capabilities are unavailable.',
          );
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (consent) consentDialog.current?.showModal();
    else consentDialog.current?.close();
  }, [consent]);

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
    setConsent(null);
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
    setConsent(null);
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
        setNotice({ key: 'textAdded', params: { name: file.name } });
      } else {
        const image = await readImage(file);
        if (version !== fileVersion.current) {
          releaseImage(image);
          return;
        }
        if (currentAttachment.current) forgetImage(currentAttachment.current);
        retainedImages.current.add(image);
        updateAttachment(image);
        setNotice(
          imageInputAvailable(capabilities)
            ? 'Image added locally. It is uploaded only if you approve analysis.'
            : 'Image added locally. Image analysis is not enabled on this backend.',
        );
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

  function cancelSample() {
    request.current?.abort();
    request.current = null;
    const id = pendingLiveId.current;
    pendingLiveId.current = null;
    setConsent(null);
    setPending(false);
    setTurns((previous) =>
      previous
        .filter((turn) => turn.response !== null || !turn.sample)
        .map((turn) =>
          turn.id === id
            ? {
                ...turn,
                failure:
                  'Analysis cancelled. No result will be displayed. The backend may already have received this text.',
              }
            : turn,
        ),
    );
    setNotice(
      id === null ? 'Sample cancelled.' : 'Analysis cancelled. Edit the message to try again.',
    );
  }

  function newChat() {
    cancelSample();
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
    cancelSample();
    setText(turn.text);
    if (live && !turn.sample) setOutputLanguage(turn.language);
    if (currentAttachment.current && currentAttachment.current !== turn.image)
      forgetImage(currentAttachment.current);
    updateAttachment(turn.image);
    setTurns((previous) => previous.filter((item) => item.id !== turn.id));
    setNotice('Edit your message below.');
    setError('');
    requestAnimationFrame(() => textarea.current?.focus());
  }

  async function confirmAnalysis() {
    if (
      !consent ||
      pending ||
      readingFile ||
      attachment !== consent.image ||
      request.current ||
      consent.text !== text.trim() ||
      consent.language !== outputLanguage ||
      !capabilities?.analysis_available ||
      !capabilities.languages.some((entry) => entry.code === outputLanguage)
    )
      return;
    const reviewed = consent;
    setConsent(null);
    const controller = new AbortController();
    request.current = controller;
    const id = ++turnId.current;
    pendingLiveId.current = id;
    setPending(true);
    setError('');
    setNotice('');
    setTurns((previous) =>
      trimThread(previous, {
        id,
        text: reviewed.text,
        language: reviewed.language,
        image: reviewed.image,
        sample: false,
        response: null,
      }),
    );
    setText('');
    try {
      const onActivity = (activity: AnalysisActivity) => {
        if (request.current !== controller || controller.signal.aborted) return;
        setTurns((previous) =>
          previous.map((turn) =>
            turn.id === id
              ? { ...turn, activity: [...(turn.activity ?? []), activity].slice(-128) }
              : turn,
          ),
        );
      };
      const response = reviewed.image
        ? await analyzeReviewedImage(
            reviewed.image,
            reviewed.language,
            controller.signal,
            onActivity,
          )
        : await analyzeTextStream(
            reviewed.text,
            reviewed.language,
            controller.signal,
            onActivity,
          );
      if (request.current !== controller || controller.signal.aborted) return;
      setTurns((previous) =>
        previous.map((turn) => (turn.id === id ? { ...turn, response } : turn)),
      );
    } catch (cause) {
      if (request.current !== controller || controller.signal.aborted) return;
      const failure =
        cause instanceof ApiError ? cause.message : 'Analysis could not be completed safely.';
      setTurns((previous) =>
        previous.map((turn) => (turn.id === id ? { ...turn, failure } : turn)),
      );
    } finally {
      if (request.current === controller) {
        request.current = null;
        pendingLiveId.current = null;
        setPending(false);
      }
    }
  }

  function send(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (pending || readingFile) return;
    if (live) {
      setConsent(null);
      const validation = attachment
        ? !imageInputAvailable(capabilities)
          ? 'Image analysis is not enabled on this backend. Remove the image and paste only reviewed, redacted text.'
          : text.trim()
            ? 'Send either the image or your text, not both. Clear the text box to analyze the image, or remove the image.'
            : null
        : validateInput(text, outputLanguage);
      if (validation) {
        setError(validation);
        textarea.current?.focus();
        return;
      }
      if (
        !capabilities?.analysis_available ||
        !capabilities.languages.some((entry) => entry.code === outputLanguage)
      ) {
        setError(
          capabilityError ||
            'Analysis is unavailable. Check backend configuration and knowledge readiness, then reload.',
        );
        return;
      }
      setError('');
      closeMenu();
      setConsent({ text: text.trim(), language: outputLanguage, image: attachment });
      return;
    }
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
    const next: Turn = {
      id: ++turnId.current,
      text: text.trim(),
      image: attachment,
      sample: false,
      response: null,
      language,
    };
    setTurns((previous) => trimThread(previous, next));
    updateAttachment(null);
    setText('');
    setError('');
    setNotice('');
    closeMenu();
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
    setConsent(null);
    if (pending) cancelSample();
    setLanguage(value);
    setNotice(hasConversation ? 'Language updated for new replies.' : '');
  }

  const composer = (
    <div className="composer-dock">
      {live && (
        <div className="live-controls">
          <label htmlFor="output-language">{t('analysisLanguage')}</label>
          <select
            id="output-language"
            value={outputLanguage}
            disabled={!capabilities}
            onChange={(event) => {
              cancelSample();
              setOutputLanguage(event.target.value as OutputLanguage);
              setNotice({ key: 'outputUpdated' });
            }}
          >
            {!capabilities && <option value="en">{t('loadingLanguages')}</option>}
            {capabilities?.languages.map((entry) => (
              <option key={entry.code} value={entry.code} lang={entry.code}>
                {entry.native_name}
              </option>
            ))}
          </select>
          <details className="live-privacy-details" open={!hasConversation}>
            <summary>{t('privacyDetails')}</summary>
            <p role="status">
              {(capabilityError ? message(capabilityError) : '') ||
                (!capabilities
                  ? t('checkingCapabilities')
                  : capabilities.analysis_available
                    ? t('available')
                    : t('unavailable'))}
            </p>
            <p>{t('privacyReminder')}</p>
          </details>
        </div>
      )}
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
        aria-label={t('composer')}
      >
        {dragging && (
          <div className="drop-overlay">
            <ImagePlus size={28} aria-hidden="true" />
            <strong>{t('dropImage')}</strong>
            <span>{t('imageFormats')}</span>
          </div>
        )}
        {attachment && (
          <div className="attachment-preview">
            <button
              type="button"
              className="attachment-thumb"
              aria-label={t('enlarge', { name: attachment.name })}
              onClick={() => setZoomImage(attachment)}
            >
              <img src={attachment.url} alt={t('attachedPreview')} />
            </button>
            <div>
              <strong>{attachment.name}</strong>
              <span>
                {t('imageSize', {
                  size: new Intl.NumberFormat(locale).format(
                    Math.round(attachment.file.size / 1024),
                  ),
                })}
              </span>
              <small>{t('ocrUnavailable')}</small>
            </div>
            <button
              className="icon-button"
              type="button"
              onClick={removeAttachment}
              aria-label={t('removeImage')}
            >
              <X size={17} aria-hidden="true" />
            </button>
          </div>
        )}
        <label className="sr-only" htmlFor="message-input">
          {t('yourMessage')}
        </label>
        <textarea
          ref={textarea}
          id="message-input"
          lang=""
          value={text}
          onChange={(event) => {
            setConsent(null);
            setText(event.target.value);
            setError('');
          }}
          onPaste={paste}
          onKeyDown={composerKey}
          placeholder={attachment ? t('imagePlaceholder') : t('textPlaceholder')}
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
              <summary aria-label={t('addFile')}>
                <Paperclip size={20} aria-hidden="true" />
                <span>{t('attach')}</span>
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
                    {t('uploadImage')}
                    <small>{t('imageFormatsShort')}</small>
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
                    {t('photo')}
                    <small>{t('cameraDevices')}</small>
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
                    {t('textFile')}
                    <small>{t('textFileFormats')}</small>
                  </span>
                </button>
              </div>
            </details>
            <button
              className="icon-button camera-shortcut"
              type="button"
              disabled={pending || readingFile}
              onClick={() => cameraInput.current?.click()}
              aria-label={t('photo')}
              title={t('cameraTitle')}
            >
              <Camera size={19} aria-hidden="true" />
            </button>
            <span className="composer-formats">{t('textImages')}</span>
          </div>
          <div className="send-tools">
            {readingFile ? (
              <span className="file-loading" role="status">
                <LoaderCircle className="spin" size={15} aria-hidden="true" />
                {t('openingFile')}
              </span>
            ) : count > 7000 ? (
              <span className={count > 8000 ? 'count invalid' : 'count'}>
                {t('charCount', {
                  count: count.toLocaleString(locale === 'en' ? 'en-IN' : locale),
                })}
              </span>
            ) : (
              <span className="keyboard-hint">{t('newline')}</span>
            )}
            {pending ? (
              <button
                className="send-button stop-button"
                type="button"
                onClick={cancelSample}
                aria-label={pendingLiveId.current !== null ? t('stopAnalysis') : t('stopSample')}
              >
                <Square size={17} aria-hidden="true" />
              </button>
            ) : (
              <button
                className={live ? 'send-button analyze-button' : 'send-button'}
                type="submit"
                disabled={readingFile || (!text.trim() && !attachment)}
                aria-label={live ? t('reviewAnalysis') : t('send')}
              >
                {live ? t('review') : <ArrowUp size={21} strokeWidth={2.5} aria-hidden="true" />}
              </button>
            )}
          </div>
        </div>
      </form>
      {error && (
        <p className="composer-error" id="composer-error" role="alert">
          <CircleAlert size={15} aria-hidden="true" />
          {message(error)}
        </p>
      )}
      <p className="composer-notice" role="status">
        {message(notice)}
      </p>
      <p className="preview-limit" id="preview-limit">
        <LockKeyhole size={12} aria-hidden="true" /> {live ? t('liveLimit') : t('previewLimit')}{' '}
        <button type="button" onClick={() => infoDialog.current?.showModal()}>
          {t('details')}
        </button>
      </p>
    </div>
  );

  return (
    <div className="chat-app" lang={locale}>
      <a className="skip-link" href="#main">
        {t('skip')}
      </a>
      <header className={hasConversation ? 'app-header has-conversation' : 'app-header'}>
        <a className="wordmark" href="#main" lang="en">
          Saral<span> Sahayak</span>
          <i aria-hidden="true">.</i>
        </a>
        <span className="header-context">{t('companion')}</span>
        <div className="header-actions">
          <div className="language-select ui-language-select">
            <Globe2 size={16} aria-hidden="true" />
            <label className="sr-only" htmlFor="ui-language">
              {t('uiLanguage')}
            </label>
            <select
              id="ui-language"
              value={locale}
              title={t('uiLanguage')}
              onChange={(event) => {
                setConsent(null);
                setLocale(event.target.value as UiLocale);
              }}
            >
              {locales.map((code) => (
                <option key={code} value={code} lang={code}>
                  {nativeNames[code]}
                </option>
              ))}
            </select>
          </div>
          {hasConversation && (
            <button type="button" className="new-chat" onClick={newChat} aria-label={t('newChat')}>
              <Plus size={17} aria-hidden="true" />
              <span>{t('newChat')}</span>
            </button>
          )}
          <div className="language-select">
            <Globe2 size={16} aria-hidden="true" />
            <label className="sr-only" htmlFor="language">
              {t('sampleLanguage')}
            </label>
            <select
              id="language"
              value={language}
              onChange={(event) => changeLanguage(event.target.value as Language)}
              title={t('sampleLanguageTitle')}
            >
              <option value="en" lang="en">
                English
              </option>
              <option value="hi" lang="hi">
                हिन्दी
              </option>
            </select>
            <ChevronDown size={12} aria-hidden="true" />
          </div>
          <button
            className="preview-badge"
            type="button"
            onClick={() => infoDialog.current?.showModal()}
          >
            <span aria-hidden="true" />
            {live ? t('liveBadge') : t('previewBadge')}
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
              <p className="eyebrow">{t('eyebrow')}</p>
              <h1 id="welcome-title">{t('welcomeTitle')}</h1>
              <p className="welcome-caption">{live ? t('welcomeLive') : t('welcomePreview')}</p>
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
                  <strong>{t('example')}</strong>
                  <small>{t('exampleCaption')}</small>
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
                  <strong>{t('addScreenshot')}</strong>
                  <small>{t('dropCaption')}</small>
                </span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="welcome-footer">
              <span>{live ? t('languagesFooter') : t('sampleLanguagesFooter')}</span>
              <span aria-hidden="true">·</span>
              <span>{t('noAccount')}</span>
              <span aria-hidden="true">·</span>
              <span>{live ? t('approvedOnly') : t('nothingSent')}</span>
            </div>
          </div>
        ) : (
          <>
            <h1 className="sr-only">{t('conversationTitle')}</h1>
            <section className="conversation" aria-label={t('conversation')}>
              <div className="thread">
                {turns.map((turn) => (
                  <article className="turn" key={turn.id}>
                    <div className="user-message">
                      {turn.sample && (
                        <span className="sample-message-label">{t('illustrative')}</span>
                      )}
                      {turn.image && (
                        <button
                          className="message-image"
                          type="button"
                          onClick={() => setZoomImage(turn.image)}
                          aria-label={t('enlarge', { name: turn.image.name })}
                        >
                          <img src={turn.image.url} alt={t('yourImage')} />
                          <span>
                            <ImagePlus size={13} aria-hidden="true" />
                            {turn.image.name}
                          </span>
                        </button>
                      )}
                      {turn.text && (
                        <p dir="auto" lang={turn.sample ? turn.language : ''}>
                          {turn.text}
                        </p>
                      )}
                      <button
                        className="edit-message"
                        type="button"
                        onClick={() => editTurn(turn)}
                        aria-label={t('editThis')}
                      >
                        <PenLine size={13} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="assistant-message">
                      <span className="assistant-avatar" aria-hidden="true">
                        <MessageCircle size={18} />
                      </span>
                      <div className="assistant-content">
                        {live && !turn.sample && (
                          <ActivityPanel
                            activity={turn.activity ?? []}
                            working={!turn.response && !turn.failure}
                          />
                        )}
                        {turn.response ? (
                          <AnswerCard
                            response={turn.response}
                            onEdit={() => editTurn(turn)}
                            sample={turn.sample}
                          />
                        ) : live && !turn.sample ? (
                          <div
                            className="unavailable-reply"
                            role={turn.failure ? 'alert' : 'status'}
                          >
                            <h2>{turn.failure ? t('analysisFailedTitle') : t('analyzing')}</h2>
                            <p>{(turn.failure ? message(turn.failure) : '') || t('waiting')}</p>
                            <button
                              className="text-button"
                              type="button"
                              onClick={() => editTurn(turn)}
                            >
                              {t('editRemark')}
                            </button>
                          </div>
                        ) : turn.sample ? (
                          turn.response ? (
                            <AnswerCard response={turn.response} onEdit={() => editTurn(turn)} />
                          ) : (
                            <div className="opening-sample" role="status">
                              <LoaderCircle className="spin" size={17} aria-hidden="true" />
                              {t('openingSample')}
                            </div>
                          )
                        ) : (
                          <div className="unavailable-reply" role="status">
                            <span className="reply-kicker">
                              {turn.image ? t('imageAttached') : t('messageReady')}
                            </span>
                            <h2>{turn.image ? t('imageNext') : t('assistantDisconnected')}</h2>
                            <p>{turn.image ? t('imageUnavailable') : t('previewUnavailable')}</p>
                            <div className="reply-actions">
                              <button
                                className="light-button"
                                type="button"
                                disabled={pending || readingFile}
                                onClick={() => void openExample()}
                              >
                                <MessageCircle size={16} aria-hidden="true" /> {t('seeExample')}{' '}
                                <ArrowUpRight size={14} aria-hidden="true" />
                              </button>
                              <button
                                className="text-button"
                                type="button"
                                onClick={() => editTurn(turn)}
                              >
                                <PenLine size={14} aria-hidden="true" />
                                {turn.image ? t('editWording') : t('editMessage')}
                              </button>
                            </div>
                            <details className="connection-details">
                              <summary>{t('whyUnavailable')}</summary>
                              <p>{t('connectionExplanation')}</p>
                            </details>
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
        aria-label={t('chooseImage')}
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
        aria-label={t('capturePhoto')}
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
        aria-label={t('chooseText')}
        onChange={(event) => {
          chooseFiles(event.target.files);
          event.target.value = '';
        }}
      />
      {live && (
        <dialog
          className="info-dialog consent-dialog"
          ref={consentDialog}
          aria-labelledby="consent-title"
          onCancel={() => setConsent(null)}
          onClose={() => setConsent(null)}
        >
          <h2 id="consent-title">{t('consentTitle')}</h2>
          <p>{t('consentDestination')}</p>
          <p>{t('consentPrivacy')}</p>
          <p>{t('consentLanguage', { language: consent ? nativeNames[consent.language] : '' })}</p>
          <pre className="consent-text" dir="auto" lang="">
            {consent?.text}
          </pre>
          <div className="reply-actions">
            <button
              type="button"
              className="light-button"
              autoFocus
              onClick={() => {
                consentDialog.current?.close();
                setConsent(null);
                requestAnimationFrame(() => textarea.current?.focus());
              }}
            >
              {t('backEdit')}
            </button>
            <button type="button" className="light-button" onClick={() => void confirmAnalysis()}>
              {t('analyzeReviewed')}
            </button>
          </div>
          <small>{t('consentScope')}</small>
        </dialog>
      )}
      <dialog className="info-dialog" ref={infoDialog} aria-labelledby="preview-info-title">
        <button
          className="dialog-close icon-button"
          type="button"
          onClick={() => infoDialog.current?.close()}
          aria-label={t('closeDetails')}
        >
          <X size={20} aria-hidden="true" />
        </button>
        <span className="dialog-icon">
          <Info size={25} aria-hidden="true" />
        </span>
        <h2 id="preview-info-title">{live ? t('aboutLive') : t('aboutPreview')}</h2>
        <ul className="capability-list">
          <li>
            <Check size={17} aria-hidden="true" />
            <span>{t('capabilityText')}</span>
          </li>
          <li>
            <Check size={17} aria-hidden="true" />
            <span>{t('capabilityImage')}</span>
          </li>
          <li>
            <Check size={17} aria-hidden="true" />
            <span>{t('capabilityExample')}</span>
          </li>
        </ul>
        <div className="connection-note">
          <strong>{live ? t('optIn') : t('disconnected')}</strong>
          <p>{live ? t('liveInfo') : t('previewInfo')}</p>
        </div>
        <p className="dialog-privacy">
          <LockKeyhole size={15} aria-hidden="true" />
          {live ? t('livePrivacy') : t('previewPrivacy')}
        </p>
        <small>{t('disclaimer')}</small>
        <small>{t('uiReview')}</small>
      </dialog>
      <dialog
        className="image-dialog"
        ref={imageDialog}
        aria-label={t('imagePreview')}
        onClose={() => setZoomImage(null)}
      >
        <button
          className="dialog-close icon-button"
          type="button"
          onClick={() => imageDialog.current?.close()}
          aria-label={t('closeImage')}
        >
          <X size={20} aria-hidden="true" />
        </button>
        {zoomImage && (
          <>
            <img src={zoomImage.url} alt={t('fullImage', { name: zoomImage.name })} />
            <p>
              {zoomImage.name}
              <span>{t('localImage')}</span>
            </p>
          </>
        )}
      </dialog>
    </div>
  );
}

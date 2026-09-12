import { useEffect, useMemo, useRef, useState } from 'react';
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
import { demoScenarios, loadDemoResponse } from './lib/demo';
import type { DemoScenario } from './lib/demo';
import { capabilitiesSchema, previewCapabilities, selectEnabledLanguage } from './lib/capabilities';
import type { Capabilities } from './lib/capabilities';
import { getWalkthrough, walkthroughRemark } from './lib/walkthrough';
import { IMAGE_ACCEPT, readImage, readTextAttachment, releaseImage } from './lib/attachments';
import type { ImageAttachment } from './lib/attachments';
import { ApiError, getConfiguredApiClient, isRetryableCode } from './lib/api';
import type { ApiClient } from './lib/api';
import { statusFromCapabilities, type BackendStatus } from './lib/backendStatus';
import { canRetryAnalysis, MAX_ANALYSIS_ATTEMPTS } from './lib/analysisRetry';

type ConnectionState = 'loading' | 'ready' | 'unavailable' | 'error';
type Failure = { code: string; retryable: boolean };

// Never display transport bodies, configuration values or arbitrary exception messages.
function failureMessage(code: string): string {
  switch (code) {
    case 'invalid_configuration':
      return 'The analysis service configuration is invalid. Ask the site operator to check it.';
    case 'access_denied':
      return 'Analysis access was denied. Ask the site operator to configure the trusted gateway. Do not enter access tokens or provider keys in this UI.';
    case 'analysis_capacity':
      return 'The analysis service is at capacity. Try later; this request will not be retried.';
    case 'request_timeout':
    case 'analysis_timeout':
    case 'timeout':
      return 'The service took too long to respond. Your text is still here.';
    case 'cancelled':
    case 'aborted':
      return 'The request was cancelled. Your text is still here.';
    case 'invalid_request':
    case 'request_too_large':
      return 'The service could not accept this text. Edit or shorten it before sending again.';
    case 'language_disabled':
      return 'This language is no longer enabled. Refresh the connection and choose an enabled language.';
    case 'model_not_configured':
    case 'knowledge_unavailable':
      return 'Analysis is unavailable until the service configuration or knowledge is ready.';
    case 'budget_exhausted':
      return 'The analysis budget was exhausted. Edit the remark with a shorter, focused question.';
    case 'invalid_response':
    case 'response_too_large':
      return 'The service returned an unreadable response. No guidance has been substituted.';
    default:
      return 'The analysis service could not complete the request. Your text is still here.';
  }
}

function transportFailure(cause: unknown): Failure {
  return cause instanceof ApiError
    ? { code: cause.code, retryable: cause.retryable && isRetryableCode(cause.code) }
    : { code: 'unknown', retryable: false };
}

type Turn = {
  id: number;
  text: string;
  image: ImageAttachment | null;
  language: Language;
  sample: boolean;
  response: AnalyzeResponse | null;
  api?: boolean;
  failure?: Failure;
  retries?: number;
  qualityVerified?: boolean;
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

export default function App({
  capabilities: suppliedCapabilities = previewCapabilities,
  apiClient,
}: { capabilities?: Capabilities; apiClient?: ApiClient | null } = {}) {
  const offlineCapabilities = useMemo(
    () => capabilitiesSchema.parse(suppliedCapabilities),
    [suppliedCapabilities],
  );
  const configuration = useMemo(() => {
    try {
      return {
        client: apiClient === undefined ? getConfiguredApiClient() : apiClient,
        invalid: false,
      };
    } catch {
      return { client: null, invalid: true };
    }
  }, [apiClient]);
  const [mode, setMode] = useState<'api' | 'preview'>(() =>
    configuration.client || configuration.invalid ? 'api' : 'preview',
  );
  const [liveCapabilities, setLiveCapabilities] = useState<Capabilities | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('loading');
  const [connectionFailure, setConnectionFailure] = useState<Failure | null>(null);
  const [refreshes, setRefreshes] = useState(0);
  const metadataRequest = useRef<AbortController | null>(null);
  const refreshCount = useRef(0);
  const activeTurn = useRef<number | null>(null);
  const capabilities = mode === 'api' ? liveCapabilities : offlineCapabilities;
  const [clarification, setClarification] = useState<{
    questions: string[];
    language: Language;
  } | null>(null);
  const [text, setText] = useState('');
  const [language, setLanguage] = useState<Language>(() => offlineCapabilities.default_language);
  const [attachment, setAttachment] = useState<ImageAttachment | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
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
  const previousCapabilities = useRef(capabilities);
  const previousMode = useRef(mode);
  const fileVersion = useRef(0);
  const turnId = useRef(0);
  const retainedImages = useRef(new Set<ImageAttachment>());
  const currentAttachment = useRef<ImageAttachment | null>(null);
  const dragDepth = useRef(0);
  const count = Array.from(text).length;
  const hasConversation = turns.length > 0;
  const apiReady =
    mode === 'api' &&
    !!configuration.client &&
    connectionState === 'ready' &&
    capabilities?.analysis_available === true &&
    capabilities.languages.some((item) => item.code === language);
  const apiInputValid = validateInput(text, language) === null;

  // One discovery on connection setup. Mode switches never trigger automatic discovery/retries.
  useEffect(() => {
    refreshCount.current = 0;
    setRefreshes(0);
    cancelWork();
    setLiveCapabilities(null);
    setConnectionFailure(null);
    if (configuration.client || configuration.invalid) {
      setMode('api');
      if (configuration.invalid) {
        setConnectionState('error');
        setConnectionFailure({ code: 'invalid_configuration', retryable: false });
      } else {
        void discoverCapabilities();
      }
    } else {
      setMode('preview');
      setConnectionState('unavailable');
    }
    return () => {
      request.current?.abort();
      request.current = null;
      metadataRequest.current?.abort();
      metadataRequest.current = null;
    };
  }, [configuration]);

  useEffect(
    () => () => {
      request.current?.abort();
      metadataRequest.current?.abort();
      fileVersion.current += 1;
      retainedImages.current.forEach(releaseImage);
      retainedImages.current.clear();
    },
    [],
  );

  useEffect(() => {
    const changed = previousCapabilities.current !== capabilities;
    previousCapabilities.current = capabilities;
    const switched = previousMode.current !== mode;
    previousMode.current = mode;
    if (switched) return; // Explicit mode actions already cancel and select a valid language.
    const enabled = capabilities ? selectEnabledLanguage(capabilities, language) : language;
    if (!changed && enabled === language) return;
    const hadPending = request.current !== null;
    cancelWork();
    if (enabled !== language) {
      setLanguage(enabled);
      setNotice(
        mode === 'api'
          ? 'That language is not enabled by the service. The default is selected.'
          : 'That language is not enabled in this capabilities example. The default is selected.',
      );
    } else if (hadPending) {
      setNotice(
        mode === 'api'
          ? 'Capabilities changed; the pending analysis was cancelled.'
          : 'Capabilities changed; the pending example was cancelled.',
      );
    }
  }, [capabilities, language]);

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

  function cancelWork() {
    fileVersion.current += 1;
    setReadingFile(false);
    request.current?.abort();
    request.current = null;
    const id = activeTurn.current;
    activeTurn.current = null;
    setPending(false);
    if (id !== null) setTurns((previous) => previous.filter((turn) => turn.id !== id));
  }

  function cancelMetadata() {
    if (metadataRequest.current) {
      metadataRequest.current.abort();
      metadataRequest.current = null;
      setLiveCapabilities(null);
      setConnectionState('unavailable');
    }
  }

  function cancelSample() {
    cancelWork();
    setNotice(
      mode === 'api'
        ? 'Analysis cancelled. Your text is still here; edit it or analyze again.'
        : 'Sample cancelled.',
    );
    textarea.current?.focus();
  }

  async function discoverCapabilities() {
    const client = configuration.client;
    if (!client) return;
    cancelWork();
    cancelMetadata();
    const controller = new AbortController();
    metadataRequest.current = controller;
    setConnectionState('loading');
    setConnectionFailure(null);
    setLiveCapabilities(null);
    try {
      const result = await client.getCapabilities(controller.signal);
      if (metadataRequest.current !== controller || controller.signal.aborted) return;
      const parsed = capabilitiesSchema.safeParse(result);
      if (!parsed.success) {
        setConnectionState('error');
        setConnectionFailure({ code: 'invalid_response', retryable: false });
        return;
      }
      setLiveCapabilities(parsed.data);
      setConnectionState(parsed.data.analysis_available ? 'ready' : 'unavailable');
    } catch (cause) {
      if (metadataRequest.current !== controller || controller.signal.aborted) return;
      setConnectionState('error');
      setConnectionFailure(transportFailure(cause));
    } finally {
      if (metadataRequest.current === controller) metadataRequest.current = null;
    }
  }

  function refreshConnection() {
    if (!configuration.client || refreshCount.current >= 2 || metadataRequest.current) return;
    refreshCount.current += 1;
    setRefreshes(refreshCount.current);
    void discoverCapabilities();
  }

  function useExamples() {
    cancelWork();
    cancelMetadata();
    setLiveCapabilities(null);
    setMode('preview');
    setLanguage(selectEnabledLanguage(offlineCapabilities, language));
    setError('');
    setNotice('Example mode. Nothing is sent; your input is preserved.');
    infoDialog.current?.close();
  }

  function useApi() {
    cancelWork();
    cancelMetadata();
    setMode('api');
    setLiveCapabilities(null);
    setError('');
    setNotice('API mode. Review your text before choosing Analyze text.');
    if (configuration.invalid) {
      setConnectionState('error');
      setConnectionFailure({ code: 'invalid_configuration', retryable: false });
    } else {
      setConnectionState('unavailable');
      refreshConnection();
    }
    infoDialog.current?.close();
  }

  function newChat() {
    cancelWork();
    cancelMetadata();
    setClarification(null);
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
    cancelWork();
    setClarification(
      turn.api && turn.response?.status === 'needs_clarification'
        ? { questions: turn.response.questions, language: turn.language }
        : null,
    );
    setText(turn.text);
    if (currentAttachment.current && currentAttachment.current !== turn.image)
      forgetImage(currentAttachment.current);
    updateAttachment(turn.image);
    setTurns((previous) => previous.filter((item) => item.id !== turn.id));
    setNotice('Edit your message below.');
    setError('');
    requestAnimationFrame(() => textarea.current?.focus());
  }

  async function analyzeTurn(turn: Turn) {
    const client = configuration.client;
    if (!client || !apiReady || request.current || readingFile) return;
    if (!capabilities?.languages.some((item) => item.code === turn.language)) return;
    const controller = new AbortController();
    request.current = controller;
    activeTurn.current = turn.id;
    setPending(true);
    setError('');
    setNotice('');
    setClarification(null);
    setText(turn.text);
    const next = { ...turn, response: null, failure: undefined };
    setTurns((previous) =>
      previous.some((item) => item.id === turn.id)
        ? previous.map((item) => (item.id === turn.id ? next : item))
        : trimThread(previous, next),
    );
    closeMenu();
    try {
      // Only editable text and the enabled output language cross the API boundary.
      const response = await client.analyze(
        { text: turn.text, language: turn.language },
        controller.signal,
      );
      if (request.current !== controller || controller.signal.aborted) return;
      setTurns((previous) =>
        previous.map((item) => (item.id === turn.id ? { ...item, response } : item)),
      );
      if (response.status === 'error' && response.error?.code === 'access_denied') {
        setConnectionState('unavailable');
        setConnectionFailure({ code: 'access_denied', retryable: false });
      }
      if (response.status === 'success')
        setText((current) => (current === turn.text ? '' : current));
    } catch (cause) {
      if (request.current !== controller || controller.signal.aborted) return;
      const failure = transportFailure(cause);
      if (failure.code === 'access_denied') {
        setConnectionState('unavailable');
        setConnectionFailure(failure);
      }
      setTurns((previous) =>
        previous.map((item) => (item.id === turn.id ? { ...item, failure } : item)),
      );
    } finally {
      if (request.current === controller) {
        request.current = null;
        activeTurn.current = null;
        setPending(false);
      }
    }
  }

  function canRetry(turn: Turn) {
    return (
      turn.failure?.retryable === true ||
      (turn.response?.status === 'error' && isRetryableCode(turn.response.error?.code ?? ''))
    );
  }

  function retryTurn(turn: Turn) {
    if (!canRetry(turn) || !canRetryAnalysis(1 + (turn.retries ?? 0)) || turn.language !== language)
      return;
    void analyzeTurn({ ...turn, retries: (turn.retries ?? 0) + 1 });
  }

  function send(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (pending || request.current || readingFile) return;
    if (mode === 'api') {
      if (!apiReady) return;
      if (!apiInputValid) {
        setError(
          attachment && !text.trim()
            ? 'Paste the rejection wording. Images stay local; no text has been extracted.'
            : (validateInput(text, language) ?? 'Enter a rejection remark.'),
        );
        return;
      }
      void analyzeTurn({
        id: ++turnId.current,
        text,
        image: null,
        language,
        sample: false,
        api: true,
        response: null,
        retries: 0,
        qualityVerified:
          capabilities?.languages.find((item) => item.code === language)?.quality_verified ?? false,
      });
      return;
    }
    setClarification(null);
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

  async function openExample(scenario: DemoScenario = 'success') {
    if (readingFile) return;
    useExamples();
    const controller = new AbortController();
    request.current = controller;
    const id = ++turnId.current;
    activeTurn.current = id;
    const selectedLanguage = selectEnabledLanguage(offlineCapabilities, language);
    setPending(true);
    setError('');
    setNotice('');
    const next: Turn = {
      id,
      text: walkthroughRemark(selectedLanguage, scenario),
      image: null,
      sample: true,
      response: null,
      language: selectedLanguage,
    };
    setTurns((previous) => trimThread(previous, next));
    try {
      await loadDemoResponse(scenario, selectedLanguage, controller.signal);
      if (request.current !== controller || controller.signal.aborted) return;
      const response = getWalkthrough(selectedLanguage, scenario);
      setNotice('Example reply loaded. This is not live analysis.');
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
        activeTurn.current = null;
        setPending(false);
      }
    }
  }

  function changeLanguage(value: Language) {
    if (!capabilities) return;
    cancelWork();
    cancelMetadata();
    setLanguage(selectEnabledLanguage(capabilities, value));
    setNotice(hasConversation ? 'Language updated for new replies.' : '');
  }

  const connectionMessage = connectionFailure
    ? failureMessage(connectionFailure.code)
    : connectionState === 'loading'
      ? 'Checking service capabilities… No claim text is sent.'
      : connectionState === 'ready'
        ? 'Text analysis is configured. Review your text before sending.'
        : 'Text analysis is unavailable. Refresh the connection or use examples.';

  const backendStatus: BackendStatus =
    connectionFailure?.code === 'access_denied'
      ? {
          kind: 'not_ready',
          label: 'Analysis gateway not ready',
          detail: failureMessage('access_denied'),
        }
      : connectionState === 'loading'
        ? { kind: 'checking', label: 'Checking analysis backend…' }
        : liveCapabilities
          ? statusFromCapabilities(liveCapabilities)
          : {
              kind: 'unreachable',
              label: 'Analysis backend unreachable',
              detail: connectionMessage,
            };

  const composer = (
    <div className="composer-dock">
      {mode === 'api' && (
        <div className="api-connection" data-state={connectionState}>
          <aside className="demo-readiness" aria-label="Analysis readiness">
            <p className={`backend-status backend-status-${backendStatus.kind}`} role="status">
              {backendStatus.label}
            </p>
            {backendStatus.detail && backendStatus.detail !== connectionMessage && (
              <p>{backendStatus.detail}</p>
            )}
            <p>
              Availability is configuration and structure metadata, not authorization, verified
              model connectivity, policy accuracy or language quality.
            </p>
          </aside>
          <p role="status">{connectionMessage}</p>
          <div className="api-connection-actions">
            <button
              type="button"
              className="text-button"
              onClick={refreshConnection}
              disabled={!configuration.client || connectionState === 'loading' || refreshes >= 2}
            >
              Refresh connection
            </button>
            <button type="button" className="text-button" onClick={useExamples}>
              Use examples
            </button>
          </div>
          {refreshes >= 2 && (
            <small>Connection refresh limit reached (2). Reload to start a new connection.</small>
          )}
        </div>
      )}
      {clarification && (
        <aside className="clarification-context" aria-label="Clarification context">
          <strong>Add these details to your original remark</strong>
          <ul lang={clarification.language}>
            {clarification.questions.map((question, index) => (
              <li key={index}>{question}</li>
            ))}
          </ul>
        </aside>
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
              <small>
                {mode === 'api'
                  ? 'Image stays local. Paste its wording; only typed text is sent.'
                  : 'OCR isn’t connected yet'}
              </small>
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
                onClick={cancelSample}
                aria-label={mode === 'api' ? 'Cancel analysis' : 'Stop opening sample'}
              >
                <Square size={17} aria-hidden="true" />
              </button>
            ) : (
              <button
                className={`send-button${mode === 'api' ? ' analyze-button' : ''}`}
                type="submit"
                disabled={
                  readingFile ||
                  (mode === 'api' ? !apiReady || !apiInputValid : !text.trim() && !attachment)
                }
                aria-label={mode === 'api' ? 'Analyze text' : 'Send message'}
              >
                {mode === 'api' ? (
                  'Analyze text'
                ) : (
                  <ArrowUp size={21} strokeWidth={2.5} aria-hidden="true" />
                )}
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
      <p className={`preview-limit${mode === 'api' ? ' api-privacy-note' : ''}`} id="preview-limit">
        <LockKeyhole size={12} aria-hidden="true" />{' '}
        {mode === 'api'
          ? 'Analyze text sends your text to the configured analysis service. Omit personal IDs (Aadhaar, PAN, UAN, bank or claim numbers). Images are not sent or read.'
          : 'Local preview. Analysis & image reading aren’t connected.'}{' '}
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
              value={capabilities ? language : ''}
              disabled={!capabilities || (mode === 'api' && connectionState !== 'ready')}
              onChange={(event) => changeLanguage(event.target.value as Language)}
              title={
                mode === 'api'
                  ? 'Enabled languages reported by the service; quality flags are metadata only'
                  : 'Enabled languages from the offline capabilities example; sample quality is unreviewed'
              }
            >
              {!capabilities && <option value="">Languages unavailable</option>}
              {capabilities?.languages.map((item) => (
                <option
                  key={item.code}
                  value={item.code}
                  aria-label={`${item.name} (${item.native_name})`}
                >
                  {item.native_name}
                </option>
              ))}
            </select>
            <ChevronDown size={12} aria-hidden="true" />
          </div>
          <button
            className="preview-badge"
            type="button"
            onClick={() => infoDialog.current?.showModal()}
          >
            <span aria-hidden="true" />
            {mode === 'api' ? 'API' : 'Preview'}
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
              <p className="source-hint">
                Grounded EPFO guidance with Markdown evidence and original source URLs. Ask for
                clarification or abstain when evidence is insufficient.
              </p>
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
              <span>
                {mode === 'api'
                  ? `${capabilities?.languages.length ?? 0} enabled languages · quality flags are metadata`
                  : `${offlineCapabilities.languages.length} example languages · quality unreviewed`}
              </span>
              <span aria-hidden="true">·</span>
              <span>{mode === 'api' ? 'Server-controlled access' : 'No account needed'}</span>
              <span aria-hidden="true">·</span>
              <span>{mode === 'api' ? 'Text sent only on Analyze' : 'Nothing is sent'}</span>
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
                        {turn.response ? (
                          <AnswerCard
                            response={turn.response}
                            onEdit={() => editTurn(turn)}
                            mode={turn.sample ? 'sample' : 'live'}
                            qualityVerified={turn.qualityVerified ?? false}
                          />
                        ) : turn.failure ? (
                          <div className="api-transport-error" role="alert">
                            <h2>Could not reach an answer</h2>
                            <p>{failureMessage(turn.failure.code)}</p>
                            <button
                              className="text-button"
                              type="button"
                              onClick={() => editTurn(turn)}
                            >
                              Edit remark
                            </button>
                          </div>
                        ) : turn.api || turn.sample ? (
                          <div
                            className={turn.api ? 'api-waiting' : 'opening-sample'}
                            role="status"
                          >
                            <LoaderCircle className="spin" size={17} aria-hidden="true" />
                            {turn.api
                              ? 'Waiting for the analysis service…'
                              : 'Opening the sample walkthrough…'}
                          </div>
                        ) : (
                          <div className="unavailable-reply" role="status">
                            <span className="reply-kicker">
                              {turn.image ? 'Image attached' : 'Message ready'}
                            </span>
                            <h2>
                              {turn.image
                                ? 'Got the image. Reading it is the next piece.'
                                : 'Your message is here. The assistant isn’t connected yet.'}
                            </h2>
                            <p>
                              {turn.image
                                ? 'You can preview or replace this image. OCR and claim analysis are not available yet; no text has been extracted.'
                                : 'This preview can’t analyze your claim or answer follow-up questions yet. Your message stays on this device.'}
                            </p>
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
                                {turn.image ? 'Add or edit wording' : 'Edit message'}
                              </button>
                            </div>
                            <details className="connection-details">
                              <summary>Why can’t it answer yet?</summary>
                              <p>
                                This web preview is not connected to an analysis service. Images are
                                selected locally, not uploaded. It never substitutes a canned answer
                                for your own claim.
                              </p>
                            </details>
                          </div>
                        )}
                        {turn.api && (turn.failure || turn.response?.status === 'error') && (
                          <div className="api-retry-actions">
                            {canRetry(turn) ? (
                              <>
                                <p>
                                  Retry resends the same text to the analysis service. Up to{' '}
                                  {MAX_ANALYSIS_ATTEMPTS - 1} manual retries per message.
                                </p>
                                <button
                                  type="button"
                                  className="light-button"
                                  onClick={() => retryTurn(turn)}
                                  disabled={
                                    !apiReady ||
                                    pending ||
                                    readingFile ||
                                    turn.language !== language ||
                                    !canRetryAnalysis(1 + (turn.retries ?? 0))
                                  }
                                >
                                  Retry analysis
                                </button>
                                {!canRetryAnalysis(1 + (turn.retries ?? 0)) && (
                                  <p>Retry limit reached. Edit the remark or try later.</p>
                                )}
                              </>
                            ) : (
                              <p>
                                {failureMessage(
                                  turn.failure?.code ?? turn.response?.error?.code ?? '',
                                )}{' '}
                                No automatic retry.
                              </p>
                            )}
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
        <h2 id="preview-info-title">
          {mode === 'api' ? 'About API analysis' : 'What works in this preview'}
        </h2>
        <div className="mode-actions">
          <button type="button" className="light-button" onClick={useExamples}>
            Use examples
          </button>
          <button
            type="button"
            className="light-button"
            onClick={useApi}
            disabled={mode === 'api' || (!configuration.client && !configuration.invalid)}
          >
            Use API
          </button>
        </div>
        {mode === 'api' && (
          <p>
            Availability reports configuration and knowledge structure only—not verified sources,
            model connectivity or translation quality.
          </p>
        )}
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
        <section className="sample-gallery" aria-labelledby="sample-gallery-title">
          <h3 id="sample-gallery-title">Explore sample replies</h3>
          <p>These examples never analyze your own message.</p>
          <div className="sample-gallery-options">
            {demoScenarios.map((item) => (
              <button
                key={item.value}
                type="button"
                disabled={pending || readingFile}
                onClick={() => void openExample(item.value)}
                title={item.description}
              >
                {item.value === 'error' || item.value === 'unsupported' ? (
                  <CircleAlert size={17} aria-hidden="true" />
                ) : (
                  <MessageCircle size={17} aria-hidden="true" />
                )}
                {item.label}
              </button>
            ))}
          </div>
        </section>
        <details className="capabilities-details">
          <summary>
            {mode === 'api' ? 'Service language capabilities' : 'Example language capabilities'}
          </summary>
          <p>
            {mode === 'api'
              ? 'Languages come only from the service capabilities response. Quality flags are reported metadata, not an independent review.'
              : 'The language selector uses this validated offline response, not a live service check. Sample translations have not been independently reviewed.'}
          </p>
          <ul>
            {capabilities?.languages.map((item) => (
              <li key={item.code}>
                <span>
                  {item.name} · <span lang={item.code}>{item.native_name}</span>
                </span>
                <small>
                  {item.quality_verified
                    ? mode === 'api'
                      ? 'Service quality flag: true'
                      : 'Fixture quality flag: true'
                    : 'Quality not verified'}
                </small>
              </li>
            ))}
          </ul>
          <p>
            {mode === 'api' ? 'Service analysis availability: ' : 'Fixture analysis availability: '}
            {capabilities?.analysis_available ? 'configured' : 'unavailable'}. Availability
            describes configuration and structural checks, not verified connectivity, accurate
            guidance or fluent output.
          </p>
        </details>
        <div className="connection-note">
          <strong>{mode === 'api' ? 'Text only' : 'Not connected yet'}</strong>
          <p>
            {mode === 'api'
              ? 'Image extraction, voice and PDF reading are not connected. Images are local previews only.'
              : 'Live analysis, image text extraction, voice, PDF reading and document downloads. Sample answers are illustrative—not advice or a usable claim draft.'}
          </p>
          {mode === 'api' && (
            <p>
              {capabilities?.downloads_available
                ? 'The service reports downloads available, but no download endpoint is configured in this UI.'
                : 'Document downloads are unavailable.'}
            </p>
          )}
        </div>
        <p className="dialog-privacy">
          <LockKeyhole size={15} aria-hidden="true" />
          {mode === 'api'
            ? 'Use fictional or redacted text without personal IDs. Analyze sends only your text and language to the configured service. Images stay local. This UI keeps no saved chat history.'
            : 'Use fictional or redacted material. In example mode, images and text stay in memory, clear on reload, and are never sent to a server. Camera availability depends on your device.'}
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

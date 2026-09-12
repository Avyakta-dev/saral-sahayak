import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import {
  Check,
  ChevronDown,
  Copy,
  Download,
  FileText,
  Info,
  ListChecks,
  MessageCircle,
  Pencil,
  RefreshCw,
} from 'lucide-react';
import type { AnalyzeResponse } from '../lib/contracts';
import {
  downloadDraftText,
  draftDownloadFilename,
  formatDraftExportText,
} from '../lib/draftExport';
import { Evidence } from './Evidence';

type AnswerMode = 'live' | 'sample';

type AnswerCardProps = {
  response: AnalyzeResponse;
  onEdit: () => void;
  mode?: AnswerMode;
  /** Live error envelopes only — bounded user-initiated retry from the parent. */
  onRetry?: () => void;
  retryLabel?: string;
  /**
   * When capabilities.downloads_available is true, offer a local draft .txt download.
   * Remains false/hidden while the backend reports downloads unavailable (no fake control).
   */
  downloadsAvailable?: boolean;
};

const sampleLabels = {
  banner: 'Sample only · not real claim advice',
  title: 'Your sample answer',
  edit: 'Edit remark',
  tabs: ['Overview', 'Next steps', 'Draft'],
  tablist: 'Explore the sample answer',
  documents: 'Document preview',
  noDocuments: 'No document information was supplied.',
  noActions: 'No steps were supplied.',
  noDraft: 'No draft was supplied.',
  progress: (done: number, total: number) => `${done} of ${total} checked`,
  tracking: 'Temporary checklist · not saved or verified by any service.',
  draftNotice: 'Sample request — not for submission',
  missing: 'Unfilled placeholders',
  copy: 'Copy sample',
  copying: 'Copying…',
  copied: 'Sample copied, including its disclosures.',
  copyError: 'Could not copy. Select and copy the sample and its disclosures manually.',
  download: 'Download sample',
  downloading: 'Preparing…',
  downloaded: 'Sample downloaded, including its disclosures.',
  downloadError: 'Could not download. Use Copy sample instead.',
  disclosure: 'About this sample',
  disclosureNote:
    'Fictional preview, not a live analysis. Evidence is imaginary and unverified. Original fixture notes below are not a current service check.',
  clarificationTitle: 'One more detail',
  clarification: 'Please clarify the remark before continuing.',
  unsupportedTitle: 'Not enough evidence',
  unsupported: 'We cannot support an answer to this remark. Try editing it with more context.',
  errorTitle: 'Could not prepare an answer',
  error: 'Please edit the remark and try again.',
};

const liveLabels = {
  banner: 'Grounded analysis · educational, not legal advice',
  title: 'Your grounded answer',
  edit: 'Edit remark',
  tabs: ['Overview', 'Next steps', 'Draft'],
  tablist: 'Explore the grounded answer',
  documents: 'Required documents',
  noDocuments: 'No document information was supplied.',
  noActions: 'No steps were supplied.',
  noDraft: 'No draft was supplied.',
  progress: (done: number, total: number) => `${done} of ${total} checked`,
  tracking: 'Temporary checklist · not saved or verified by any service.',
  draftNotice: 'Draft from cited evidence — review before any use',
  missing: 'Unfilled placeholders',
  copy: 'Copy draft',
  copying: 'Copying…',
  copied: 'Draft copied, including disclosures.',
  copyError: 'Could not copy. Select and copy the draft and its disclosures manually.',
  download: 'Download draft',
  downloading: 'Preparing…',
  downloaded: 'Draft downloaded, including disclosures.',
  downloadError: 'Could not download. Use Copy draft instead.',
  disclosure: 'About this answer',
  disclosureNote:
    'Educational guidance only — not legal advice, an official EPFO decision, or a guarantee of claim outcome. Citations show Markdown paths and source URLs for you to verify.',
  clarificationTitle: 'One more detail',
  clarification: 'Please clarify the remark before continuing.',
  unsupportedTitle: 'Not enough evidence',
  unsupported: 'We cannot support an answer to this remark. Try editing it with more context.',
  errorTitle: 'Could not prepare an answer',
  error: 'Please edit the remark and try again.',
};

const notChatbotBullets = [
  'Cites EPFO Markdown paths and original source URLs from the evidence ledger.',
  'Abstains or asks for clarification when evidence is thin.',
  'Checklists and drafts come from cited blocks, not free-form chat.',
];

function labelsFor(mode: AnswerMode) {
  return mode === 'live' ? liveLabels : sampleLabels;
}

function highlightPlaceholders(text: string) {
  return text.split(/(\[[^\]\n]+\])/g).map((part, index) =>
    part.startsWith('[') && part.endsWith(']') ? (
      <mark className="draft-placeholder" key={index}>
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

function AnswerTabs({
  response,
  mode,
  downloadsAvailable = false,
}: {
  response: AnalyzeResponse;
  mode: AnswerMode;
  downloadsAvailable?: boolean;
}) {
  const text = labelsFor(mode);
  const id = useId();
  const [selected, setSelected] = useState(0);
  const [checked, setChecked] = useState<Set<number>>(() => new Set());
  const [copyState, setCopyState] = useState<'idle' | 'pending' | 'copied' | 'error'>('idle');
  const [downloadState, setDownloadState] = useState<'idle' | 'pending' | 'done' | 'error'>('idle');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const copyOperation = useRef(0);
  const downloadOperation = useRef(0);
  const icons = [MessageCircle, ListChecks, FileText];
  const showDownload = downloadsAvailable && Boolean(response.draft);

  useEffect(() => {
    setSelected(0);
    setChecked(new Set());
    setCopyState('idle');
    setDownloadState('idle');
    // Clipboard/download completion must not update a replacement answer or an unmounted card.
    return () => {
      copyOperation.current += 1;
      downloadOperation.current += 1;
    };
  }, [response, mode, downloadsAvailable]);

  function navigateTabs(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
        next = (index + 1) % text.tabs.length;
        break;
      case 'ArrowLeft':
        next = (index + text.tabs.length - 1) % text.tabs.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = text.tabs.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    setSelected(next);
    tabRefs.current[next]?.focus();
  }

  function exportBody() {
    if (!response.draft) return '';
    return formatDraftExportText(
      response.draft,
      {
        banner: text.banner,
        draftNotice: text.draftNotice,
        missing: text.missing,
        disclosure: text.disclosure,
        disclosureNote: text.disclosureNote,
      },
      response.warnings,
    );
  }

  async function copyDraft() {
    if (!response.draft || copyState === 'pending') return;
    const operation = ++copyOperation.current;
    setCopyState('pending');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(exportBody());
      if (copyOperation.current === operation) setCopyState('copied');
    } catch {
      if (copyOperation.current === operation) setCopyState('error');
    }
  }

  function downloadDraft() {
    if (!response.draft || !showDownload || downloadState === 'pending') return;
    const operation = ++downloadOperation.current;
    setDownloadState('pending');
    try {
      downloadDraftText(draftDownloadFilename(response.language), exportBody());
      if (downloadOperation.current === operation) setDownloadState('done');
    } catch {
      if (downloadOperation.current === operation) setDownloadState('error');
    }
  }

  return (
    <>
      <div className="answer-tabs" role="tablist" aria-label={text.tablist} lang="en">
        {text.tabs.map((tab, index) => {
          const Icon = icons[index];
          return (
            <button
              type="button"
              className={`answer-tab${selected === index ? ' is-active' : ''}`}
              role="tab"
              id={`${id}-tab-${index}`}
              aria-controls={`${id}-panel-${index}`}
              aria-selected={selected === index}
              tabIndex={selected === index ? 0 : -1}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              onClick={() => setSelected(index)}
              onKeyDown={(event) => navigateTabs(event, index)}
              key={tab}
            >
              <Icon size={16} aria-hidden="true" />
              {tab}
            </button>
          );
        })}
      </div>

      <section
        className="answer-panel"
        role="tabpanel"
        id={`${id}-panel-0`}
        aria-labelledby={`${id}-tab-0`}
        hidden={selected !== 0}
        tabIndex={0}
      >
        <div className="answer-explanation">
          {response.explanation.map((claim, index) => (
            <div className="answer-claim" key={index}>
              <p>{claim.text}</p>
              <Evidence ids={claim.citation_ids} citations={response.citations} mode={mode} />
            </div>
          ))}
        </div>
        <div className="answer-documents">
          <h3 lang="en">{text.documents}</h3>
          {response.required_documents.length ? (
            response.required_documents.map((document, index) => (
              <div className="document-tile" key={index}>
                <FileText className="document-tile-icon" size={24} aria-hidden="true" />
                <div>
                  <p>{document.text}</p>
                  <Evidence
                    ids={document.citation_ids}
                    citations={response.citations}
                    mode={mode}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="answer-empty" lang="en">
              {text.noDocuments}
            </p>
          )}
        </div>
      </section>

      <section
        className="answer-panel"
        role="tabpanel"
        id={`${id}-panel-1`}
        aria-labelledby={`${id}-tab-1`}
        hidden={selected !== 1}
        tabIndex={0}
      >
        {response.actions.length ? (
          <>
            <div className="steps-progress" lang="en">
              <span className="steps-progress-label" id={`${id}-progress`} aria-live="polite">
                {text.progress(checked.size, response.actions.length)}
              </span>
              <progress
                value={checked.size}
                max={response.actions.length}
                aria-labelledby={`${id}-progress`}
              />
            </div>
            <p className="steps-note" lang="en">
              {text.tracking}
            </p>
            <ol className="steps-list">
              {response.actions.map((action, index) => (
                <li className={`step-item${checked.has(index) ? ' is-complete' : ''}`} key={index}>
                  <input
                    id={`${id}-step-${index}`}
                    type="checkbox"
                    checked={checked.has(index)}
                    onChange={() =>
                      setChecked((previous) => {
                        const next = new Set(previous);
                        if (next.has(index)) next.delete(index);
                        else next.add(index);
                        return next;
                      })
                    }
                  />
                  <div className="step-content">
                    <label htmlFor={`${id}-step-${index}`}>{action.text}</label>
                    <Evidence
                      ids={action.citation_ids}
                      citations={response.citations}
                      mode={mode}
                    />
                  </div>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <p className="answer-empty" lang="en">
            {text.noActions}
          </p>
        )}
      </section>

      <section
        className="answer-panel"
        role="tabpanel"
        id={`${id}-panel-2`}
        aria-labelledby={`${id}-tab-2`}
        hidden={selected !== 2}
        tabIndex={0}
      >
        {response.draft ? (
          <>
            <div className="draft-toolbar" lang="en">
              <span>{text.draftNotice}</span>
              <div className="draft-toolbar-actions">
                <button type="button" onClick={copyDraft} disabled={copyState === 'pending'}>
                  {copyState === 'copied' ? (
                    <Check size={16} aria-hidden="true" />
                  ) : (
                    <Copy size={16} aria-hidden="true" />
                  )}
                  {copyState === 'pending' ? text.copying : text.copy}
                </button>
                {showDownload ? (
                  <button
                    type="button"
                    onClick={downloadDraft}
                    disabled={downloadState === 'pending'}
                  >
                    {downloadState === 'done' ? (
                      <Check size={16} aria-hidden="true" />
                    ) : (
                      <Download size={16} aria-hidden="true" />
                    )}
                    {downloadState === 'pending' ? text.downloading : text.download}
                  </button>
                ) : null}
              </div>
            </div>
            <article className="draft-paper" aria-labelledby={`${id}-draft-title`}>
              <h3 id={`${id}-draft-title`}>{response.draft.title}</h3>
              {response.draft.blocks.map((block, index) => (
                <div className="draft-block" key={index}>
                  <p>{highlightPlaceholders(block.text)}</p>
                  <Evidence ids={block.citation_ids} citations={response.citations} mode={mode} />
                </div>
              ))}
            </article>
            {response.draft.missing_fields.length > 0 && (
              <p className="draft-missing" lang="en">
                {text.missing}:{' '}
                <span lang={response.language}>{response.draft.missing_fields.join(', ')}</span>
              </p>
            )}
            <p className="copy-feedback" role="status" aria-live="polite" lang="en">
              {copyState === 'copied'
                ? text.copied
                : copyState === 'error'
                  ? text.copyError
                  : downloadState === 'done'
                    ? text.downloaded
                    : downloadState === 'error'
                      ? text.downloadError
                      : ''}
            </p>
          </>
        ) : (
          <p className="answer-empty" lang="en">
            {text.noDraft}
          </p>
        )}
      </section>
    </>
  );
}

export function AnswerCard({
  response,
  onEdit,
  mode = 'sample',
  onRetry,
  retryLabel = 'Try again',
  downloadsAvailable = false,
}: AnswerCardProps) {
  const text = labelsFor(mode);
  const id = useId();
  const title =
    response.status === 'success'
      ? text.title
      : response.status === 'needs_clarification'
        ? text.clarificationTitle
        : response.status === 'unsupported'
          ? text.unsupportedTitle
          : text.errorTitle;
  const showRetry = Boolean(onRetry) && response.status === 'error' && mode === 'live';

  return (
    <section className="answer-card" lang={response.language} aria-labelledby={`${id}-title`}>
      <p className="sample-banner" lang="en">
        <Info size={15} aria-hidden="true" /> {text.banner}
      </p>
      <header className="answer-header" lang="en">
        <span className="answer-icon">
          <MessageCircle size={22} aria-hidden="true" />
        </span>
        <h2 className="answer-title" id={`${id}-title`}>
          {title}
        </h2>
        <button className="answer-edit" type="button" onClick={onEdit}>
          <Pencil size={15} aria-hidden="true" /> {text.edit}
        </button>
      </header>
      {response.status === 'success' ? (
        <AnswerTabs response={response} mode={mode} downloadsAvailable={downloadsAvailable} />
      ) : (
        <div className="answer-message">
          <p
            lang={response.status === 'error' && response.error?.message ? response.language : 'en'}
          >
            {response.status === 'needs_clarification'
              ? text.clarification
              : response.status === 'unsupported'
                ? text.unsupported
                : response.error?.message || text.error}
          </p>
          {response.status === 'error' && response.error?.code ? (
            <p className="answer-error-code" lang="en">
              Error code: <code>{response.error.code}</code>
            </p>
          ) : null}
          {response.status === 'needs_clarification' && (
            <ul className="answer-questions">
              {response.questions.map((question, index) => (
                <li key={index}>{question}</li>
              ))}
            </ul>
          )}
          {(response.status === 'unsupported' || response.status === 'error') &&
            response.warnings.length > 0 && (
              <ul className="answer-state-warnings">
                {response.warnings.map((warning, index) => (
                  <li
                    key={index}
                    lang={
                      mode === 'live' ? response.language : /[ऀ-ॿ]/u.test(warning) ? 'hi' : 'en'
                    }
                  >
                    {warning}
                  </li>
                ))}
              </ul>
            )}
          {showRetry ? (
            <div className="reply-actions answer-retry-actions">
              <button className="light-button" type="button" onClick={onRetry}>
                <RefreshCw size={16} aria-hidden="true" /> {retryLabel}
              </button>
            </div>
          ) : null}
        </div>
      )}
      <details className="answer-disclosure">
        <summary lang="en">
          {text.disclosure} <ChevronDown size={15} aria-hidden="true" />
        </summary>
        <p lang="en">{text.disclosureNote}</p>
        {mode === 'live' && (
          <div className="not-chatbot-note" lang="en">
            <strong>Not a general chatbot</strong>
            <ul>
              {notChatbotBullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {response.warnings.length > 0 && (
          <ul>
            {response.warnings.map((warning, index) => (
              // Demo warnings mix preserved English notes with prewritten Hindi translations.
              <li
                key={index}
                lang={
                  mode === 'live'
                    ? response.language
                    : /[\u0900-\u097f]/u.test(warning)
                      ? 'hi'
                      : 'en'
                }
              >
                {warning}
              </li>
            ))}
          </ul>
        )}
      </details>
    </section>
  );
}

export default AnswerCard;

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
} from 'lucide-react';
import type { AnalyzeResponse, Language } from '../lib/contracts';
import { downloadDraftText, draftDownloadFilename } from '../lib/draftExport';
import { useLocale } from '../lib/i18n';
import { Evidence } from './Evidence';

type AnswerCardProps = {
  response: AnalyzeResponse;
  onEdit: () => void;
  mode?: 'live' | 'sample';
  isSample?: boolean;
  sample?: boolean;
  qualityVerified?: boolean;
  /** The parent owns the manual retry budget. */
  onRetry?: () => void;
  retryLabel?: string;
  /**
   * When capabilities.downloads_available is true, offer a local draft .txt download.
   * Hidden while the backend reports downloads unavailable (no fake control).
   */
  downloadsAvailable?: boolean;
};

// Interface language is English; response content keeps its requested output language.
const labels = {
  sample: 'Sample only · not real claim advice',
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

function englishAnswerLabels(isSample: boolean) {
  if (isSample) return labels;
  return {
    ...labels,
    sample: 'Grounded analysis · educational, not legal advice',
    title: 'Your grounded answer',
    tablist: 'Explore the grounded answer',
    documents: 'Required documents',
    draftNotice: 'Draft from cited evidence — review before any use',
    copy: 'Copy draft',
    copied: 'Draft copied with citations and limitations.',
    copyError: 'Could not copy. Select and copy the draft and its citations manually.',
    download: 'Download draft',
    downloaded: 'Draft downloaded, including disclosures.',
    downloadError: 'Could not download. Use Copy draft instead.',
    disclosure: 'About this answer',
    disclosureNote:
      'Educational guidance only — not legal advice, an official EPFO decision, or a guarantee of claim outcome. Citations show Markdown paths and source URLs for you to verify.',
  };
}

function sampleTextLanguage(text: string): Language {
  if (/[\u0900-\u097f]/u.test(text)) return 'hi';
  if (/[\u0c80-\u0cff]/u.test(text)) return 'kn';
  if (/[\u0b80-\u0bff]/u.test(text)) return 'ta';
  if (/[\u0c00-\u0c7f]/u.test(text)) return 'te';
  if (/[\u0d00-\u0d7f]/u.test(text)) return 'ml';
  return 'en';
}

function useAnswerLabels(sample: boolean) {
  const { t, locale } = useLocale();
  if (locale === 'en')
    return {
      locale,
      text: {
        ...englishAnswerLabels(sample),
        missingList: (fields: string) => t('missingList', { fields }),
      },
    };
  return {
    locale,
    text: {
      ...englishAnswerLabels(sample),
      sample: t(sample ? 'sampleBanner' : 'liveBanner'),
      title: t(sample ? 'sampleTitle' : 'liveTitle'),
      edit: t('editRemark'),
      tabs: [t('overview'), t('nextSteps'), t('draft')],
      tablist: t(sample ? 'sampleTabs' : 'liveTabs'),
      documents: t(sample ? 'documentPreview' : 'documents'),
      noDocuments: t('noDocuments'),
      noActions: t('noActions'),
      noDraft: t('noDraft'),
      progress: (done: number, total: number) => t('checked', { done, total }),
      tracking: t('checklistNote'),
      draftNotice: t(sample ? 'sampleDraftNotice' : 'liveDraftNotice'),
      missing: t('missing'),
      missingList: (fields: string) => t('missingList', { fields }),
      copy: t(sample ? 'copySample' : 'copyDraft'),
      copying: t('copying'),
      copied: t(sample ? 'sampleCopied' : 'draftCopied'),
      copyError: t(sample ? 'sampleCopyError' : 'draftCopyError'),
      disclosure: t(sample ? 'sampleDisclosure' : 'liveDisclosure'),
      disclosureNote: t(sample ? 'sampleDisclosureNote' : 'liveDisclosureNote'),
      clarificationTitle: t('clarificationTitle'),
      clarification: t('clarification'),
      unsupportedTitle: t('unsupportedTitle'),
      unsupported: t('unsupported'),
      errorTitle: t('errorTitle'),
      error: t('editRetry'),
    },
  };
}

const canonicalFields = new Set(['claimant_name', 'claim_id', 'claim_type']);
function highlightPlaceholders(text: string, sample: boolean) {
  return text.split(/(\[[^\]\n]+\])/g).map((part, index) =>
    part.startsWith('[') && part.endsWith(']') ? (
      <mark
        className="draft-placeholder"
        key={index}
        lang={!sample && canonicalFields.has(part.slice(1, -1)) ? 'en' : undefined}
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

function ResponseTabs({
  response,
  isSample,
  downloadsAvailable = false,
}: {
  response: AnalyzeResponse;
  isSample: boolean;
  downloadsAvailable?: boolean;
}) {
  const { text, locale } = useAnswerLabels(isSample);
  const id = useId();
  const [selected, setSelected] = useState(0);
  const [checked, setChecked] = useState<Set<number>>(() => new Set());
  const [copyState, setCopyState] = useState<'idle' | 'pending' | 'copied' | 'error'>('idle');
  const [downloadState, setDownloadState] = useState<'idle' | 'pending' | 'done' | 'error'>('idle');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const copyOperation = useRef(0);
  const downloadOperation = useRef(0);
  const showDownload = downloadsAvailable && Boolean(response.draft);
  const icons = [MessageCircle, ListChecks, FileText];

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
  }, [response, isSample, downloadsAvailable]);

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
    const draftCitationIds = new Set(response.draft.blocks.flatMap((block) => block.citation_ids));
    const sourceNotes = response.citations
      .filter((citation) => draftCitationIds.has(citation.id))
      .flatMap((citation) => [
        `Source ${citation.id} (${isSample ? 'synthetic, unverified' : 'supplied by the analysis service; not independently verified'})`,
        citation.path,
        `Record ID: ${citation.record_id ?? 'supporting document'}`,
        `Heading: ${citation.heading}`,
        `Lines: ${citation.start_line}–${citation.end_line}${citation.start_column != null && citation.end_column != null ? `; zero-based columns: ${citation.start_column}–${citation.end_column}` : ''}`,
        ...citation.source_urls,
      ]);
    return [
      text.sample,
      text.draftNotice,
      response.draft.title,
      ...response.draft.blocks.map((block) => block.text),
      ...(response.draft.missing_fields.length
        ? [text.missingList(response.draft.missing_fields.join(', '))]
        : []),
      ...sourceNotes,
      text.disclosure,
      text.disclosureNote,
      ...response.warnings,
    ].join('\n\n');
  }

  async function copySample() {
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
      <div className="answer-tabs" role="tablist" aria-label={text.tablist} lang={locale}>
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
              key={index}
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
              <Evidence
                ids={claim.citation_ids}
                citations={response.citations}
                isSample={isSample}
              />
            </div>
          ))}
        </div>
        <div className="answer-documents">
          <h3 lang={locale}>{text.documents}</h3>
          {response.required_documents.length ? (
            response.required_documents.map((document, index) => (
              <div className="document-tile" key={index}>
                <FileText className="document-tile-icon" size={24} aria-hidden="true" />
                <div>
                  <p>{document.text}</p>
                  <Evidence
                    ids={document.citation_ids}
                    citations={response.citations}
                    isSample={isSample}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="answer-empty" lang={locale}>
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
            <div className="steps-progress" lang={locale}>
              <span className="steps-progress-label" id={`${id}-progress`} aria-live="polite">
                {text.progress(checked.size, response.actions.length)}
              </span>
              <progress
                value={checked.size}
                max={response.actions.length}
                aria-labelledby={`${id}-progress`}
              />
            </div>
            <p className="steps-note" lang={locale}>
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
                      isSample={isSample}
                    />
                  </div>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <p className="answer-empty" lang={locale}>
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
            <div className="draft-toolbar" lang={locale}>
              <span>{text.draftNotice}</span>
              <div className="draft-toolbar-actions">
                <button type="button" onClick={copySample} disabled={copyState === 'pending'}>
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
                  <p>{highlightPlaceholders(block.text, isSample)}</p>
                  <Evidence
                    ids={block.citation_ids}
                    citations={response.citations}
                    isSample={isSample}
                  />
                </div>
              ))}
            </article>
            {response.draft.missing_fields.length > 0 && (
              <p className="draft-missing" lang={locale}>
                {text.missing}:{' '}
                <span lang={response.language}>
                  {isSample
                    ? response.draft.missing_fields.join(', ')
                    : response.draft.missing_fields.map((field, index) => (
                        <span
                          key={field}
                          lang={!isSample && canonicalFields.has(field) ? 'en' : undefined}
                        >
                          {index > 0 ? ', ' : ''}
                          {field}
                        </span>
                      ))}
                </span>
              </p>
            )}
            <p className="copy-feedback" role="status" aria-live="polite" lang={locale}>
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
          <p className="answer-empty" lang={locale}>
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
  mode,
  isSample: legacySample,
  sample = legacySample ?? true,
  qualityVerified = false,
  onRetry,
  retryLabel = 'Try again',
  downloadsAvailable = false,
}: AnswerCardProps) {
  const isSample = mode === undefined ? sample : mode === 'sample';
  const { text, locale } = useAnswerLabels(isSample);
  const id = useId();
  const title =
    response.status === 'success'
      ? text.title
      : response.status === 'needs_clarification'
        ? text.clarificationTitle
        : response.status === 'unsupported'
          ? text.unsupportedTitle
          : text.errorTitle;

  return (
    <section className="answer-card" lang={response.language} aria-labelledby={`${id}-title`}>
      <p className={isSample ? 'sample-banner' : 'sample-banner service-banner'} lang="en">
        <Info size={15} aria-hidden="true" /> {text.sample}
      </p>
      <header className="answer-header" lang={locale}>
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
      <p className="sample-quality-note" lang="en">
        {isSample
          ? 'Sample language quality has not been independently reviewed.'
          : qualityVerified
            ? 'The service reports reviewed language quality; this does not guarantee this answer.'
            : 'Output language quality has not been independently verified.'}
      </p>
      {response.status === 'success' && response.classification && (
        <aside className="answer-uncertainty" aria-label="Classification uncertainty" lang="en">
          <span>
            Classification confidence: <strong>{response.classification.confidence}</strong>
          </span>
          <p lang={response.language}>{response.classification.rationale}</p>
          <small lang="en">
            {isSample
              ? 'A sample label, not policy certainty or source verification.'
              : 'Classification confidence is not source verification or a guarantee of the outcome.'}
          </small>
        </aside>
      )}
      {response.status === 'success' ? (
        <ResponseTabs
          response={response}
          isSample={isSample}
          downloadsAvailable={downloadsAvailable}
        />
      ) : (
        <div className="answer-message">
          <p
            lang={
              response.status === 'unsupported' && response.warnings[0]
                ? sampleTextLanguage(response.warnings[0])
                : response.status === 'error' && response.error?.message
                  ? response.language
                  : 'en'
            }
          >
            {response.status === 'needs_clarification'
              ? text.clarification
              : response.status === 'unsupported'
                ? response.warnings[0] || text.unsupported
                : response.error?.message || text.error}
          </p>
          {!isSample && response.status === 'error' && response.error?.code && (
            <p className="answer-error-code" lang="en">
              Error code: <code>{response.error.code}</code>
            </p>
          )}
          {!isSample && response.status === 'error' && onRetry && (
            <div className="reply-actions answer-retry-actions">
              <button className="light-button" type="button" onClick={onRetry}>
                {retryLabel}
              </button>
            </div>
          )}
          {response.status === 'needs_clarification' && (
            <ul className="answer-questions">
              {response.questions.map((question, index) => (
                <li key={index}>{question}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      <details className="answer-disclosure" open={!isSample && response.warnings.length > 0}>
        <summary lang="en">
          {text.disclosure} <ChevronDown size={15} aria-hidden="true" />
        </summary>
        <p lang="en">{text.disclosureNote}</p>
        {!isSample && (
          <div className="not-chatbot-note" lang="en">
            <strong>Not a general chatbot</strong>
            <ul>
              <li>Cites EPFO Markdown paths and original source URLs from the evidence ledger.</li>
              <li>Abstains or asks for clarification when evidence is thin.</li>
              <li>Checklists and drafts come from cited blocks, not free-form chat.</li>
            </ul>
          </div>
        )}
        {response.warnings.length > 0 && (
          <ul>
            {response.warnings.map((warning, index) => (
              <li key={index} lang={sampleTextLanguage(warning)}>
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

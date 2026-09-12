import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import {
  Check,
  ChevronDown,
  Copy,
  FileText,
  Info,
  ListChecks,
  MessageCircle,
  Pencil,
} from 'lucide-react';
import type { AnalyzeResponse } from '../lib/contracts';
import { Evidence } from './Evidence';
import { useLocale } from '../lib/i18n';

type AnswerCardProps = {
  response: AnalyzeResponse;
  onEdit: () => void;
  sample?: boolean;
  mode?: 'live' | 'sample';
};

function useAnswerLabels(sample: boolean) {
  const { t, locale } = useLocale();
  return {
    locale,
    text: {
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

function SampleTabs({ response, sample }: { response: AnalyzeResponse; sample: boolean }) {
  const { text, locale } = useAnswerLabels(sample);
  const id = useId();
  const [selected, setSelected] = useState(0);
  const [checked, setChecked] = useState<Set<number>>(() => new Set());
  const [copyState, setCopyState] = useState<'idle' | 'pending' | 'copied' | 'error'>('idle');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const copyOperation = useRef(0);
  const icons = [MessageCircle, ListChecks, FileText];

  useEffect(() => {
    setSelected(0);
    setChecked(new Set());
    setCopyState('idle');
    // A clipboard completion must not update a replacement answer or an unmounted card.
    return () => {
      copyOperation.current += 1;
    };
  }, [response, sample]);

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

  async function copySample() {
    if (!response.draft || copyState === 'pending') return;
    const operation = ++copyOperation.current;
    setCopyState('pending');
    const copiedText = [
      text.sample,
      text.draftNotice,
      response.draft.title,
      ...response.draft.blocks.map((block) => block.text),
      ...(response.draft.missing_fields.length
        ? [text.missingList(response.draft.missing_fields.join(', '))]
        : []),
      text.disclosure,
      text.disclosureNote,
      ...response.warnings,
    ].join('\n\n');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(copiedText);
      if (copyOperation.current === operation) setCopyState('copied');
    } catch {
      if (copyOperation.current === operation) setCopyState('error');
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
              <Evidence ids={claim.citation_ids} citations={response.citations} sample={sample} />
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
                    sample={sample}
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
                      sample={sample}
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
              <button type="button" onClick={copySample} disabled={copyState === 'pending'}>
                {copyState === 'copied' ? (
                  <Check size={16} aria-hidden="true" />
                ) : (
                  <Copy size={16} aria-hidden="true" />
                )}
                {copyState === 'pending' ? text.copying : text.copy}
              </button>
            </div>
            <article className="draft-paper" aria-labelledby={`${id}-draft-title`}>
              <h3 id={`${id}-draft-title`}>{response.draft.title}</h3>
              {response.draft.blocks.map((block, index) => (
                <div className="draft-block" key={index}>
                  <p>{highlightPlaceholders(block.text, sample)}</p>
                  <Evidence
                    ids={block.citation_ids}
                    citations={response.citations}
                    sample={sample}
                  />
                </div>
              ))}
            </article>
            {response.draft.missing_fields.length > 0 && (
              <p className="draft-missing" lang={locale}>
                {text.missing}:{' '}
                <span lang={response.language}>
                  {sample
                    ? response.draft.missing_fields.join(', ')
                    : response.draft.missing_fields.map((field, index) => (
                        <span
                          key={field}
                          lang={!sample && canonicalFields.has(field) ? 'en' : undefined}
                        >
                          {index > 0 ? ', ' : ''}
                          {field}
                        </span>
                      ))}
                </span>
              </p>
            )}
            <p className="copy-feedback" role="status" aria-live="polite" lang={locale}>
              {copyState === 'copied' ? text.copied : copyState === 'error' ? text.copyError : ''}
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

export function AnswerCard({ response, onEdit, mode, sample = mode !== 'live' }: AnswerCardProps) {
  const { text, locale } = useAnswerLabels(sample);
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
      <p className="sample-banner" lang={locale}>
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
      {response.status === 'success' ? (
        <SampleTabs response={response} sample={sample} />
      ) : (
        <div className="answer-message">
          <p
            lang={
              response.status === 'error' && sample && response.error?.message
                ? response.language
                : locale
            }
          >
            {response.status === 'needs_clarification'
              ? text.clarification
              : response.status === 'unsupported'
                ? text.unsupported
                : (sample ? response.error?.message : null) || text.error}
          </p>
          {response.status === 'needs_clarification' && (
            <ul className="answer-questions">
              {response.questions.map((question, index) => (
                <li key={index}>{question}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      <details className="answer-disclosure" open={!sample}>
        <summary lang={locale}>
          {text.disclosure} <ChevronDown size={15} aria-hidden="true" />
        </summary>
        <p lang={locale}>{text.disclosureNote}</p>
        {!sample && (
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
              // Demo warnings mix preserved English notes with prewritten Hindi translations.
              <li
                key={index}
                lang={sample ? (/[\u0900-\u097f]/u.test(warning) ? 'hi' : 'en') : response.language}
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

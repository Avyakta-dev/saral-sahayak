import { BookOpen, ChevronDown, ExternalLink } from 'lucide-react';
import type { Citation } from '../lib/contracts';
import { safeSourceUrl } from '../lib/contracts';
import { useLocale } from '../lib/i18n';

type EvidenceProps = {
  ids: string[];
  citations: Citation[];
  sample?: boolean;
  mode?: 'live' | 'sample';
};

export function Evidence({ ids, citations, mode, sample = mode !== 'live' }: EvidenceProps) {
  const { locale, t } = useLocale();
  if (!ids.length) return null;
  const evidence = ids.map((id) => citations.find((citation) => citation.id === id));

  return (
    <details className="evidence" lang={locale}>
      <summary>
        <BookOpen size={14} aria-hidden="true" />
        <span>{t(ids.length > 1 ? 'sources' : 'source')}</span>
        <span className="source-count">{ids.length}</span>
        <ChevronDown className="disclosure-chevron" size={14} aria-hidden="true" />
      </summary>
      <div className="evidence-body">
        <p className="evidence-notice">{sample ? t('sampleEvidence') : t('liveEvidence')}</p>
        {evidence.map((citation, index) =>
          citation ? (
            <dl className="citation" key={citation.id}>
              <div>
                <dt>{t('markdownPath')}</dt>
                <dd className="citation-path" lang="en">
                  {citation.path}
                </dd>
              </div>
              <div>
                <dt>{t('recordId')}</dt>
                <dd>{citation.record_id ?? t('supportingDocument')}</dd>
              </div>
              <div>
                <dt>{t('exactHeading')}</dt>
                <dd lang="">{citation.heading}</dd>
              </div>
              <div>
                <dt>{t('lines')}</dt>
                <dd>
                  {citation.start_line}–{citation.end_line}
                </dd>
              </div>
              {citation.start_column != null && citation.end_column != null && (
                <div>
                  <dt>{t('columns')}</dt>
                  <dd>
                    {citation.start_column}–{citation.end_column}
                  </dd>
                </div>
              )}
              <div>
                <dt>{t('sourceUrls')}</dt>
                <dd>
                  {citation.source_urls.length === 0 &&
                    (sample ? t('noSampleUrl') : t('noLiveUrl'))}
                  {citation.source_urls.map((url) => {
                    const safe = safeSourceUrl(url);
                    const imaginary = safe && new URL(safe).hostname.endsWith('.invalid');
                    return safe && !imaginary ? (
                      <a
                        key={url}
                        href={safe}
                        target="_blank"
                        rel="noopener noreferrer"
                        referrerPolicy="no-referrer"
                      >
                        {url}
                        <ExternalLink size={12} aria-hidden="true" />
                        <span className="sr-only">{t('newTab')}</span>
                      </a>
                    ) : (
                      <span className="source-url" key={url}>
                        {url}
                        <small>{imaginary ? t('illustrativeUrl') : t('unsafeUrl')}</small>
                      </span>
                    );
                  })}
                </dd>
              </div>
            </dl>
          ) : (
            <p key={ids[index]} role="alert">
              {t('missingEvidence')}
            </p>
          ),
        )}
      </div>
    </details>
  );
}

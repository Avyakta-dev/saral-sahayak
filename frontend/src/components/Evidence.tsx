import { BookOpen, ChevronDown, ExternalLink } from 'lucide-react';
import type { Citation } from '../lib/contracts';
import { safeSourceUrl } from '../lib/contracts';

type EvidenceProps = {
  ids: string[];
  citations: Citation[];
};

export function Evidence({ ids, citations }: EvidenceProps) {
  if (!ids.length) return null;
  const evidence = ids.map((id) => citations.find((citation) => citation.id === id));

  return (
    <details className="evidence" lang="en">
      <summary>
        <BookOpen size={14} aria-hidden="true" />
        <span>Source{ids.length > 1 ? 's' : ''}</span>
        <span className="source-count">{ids.length}</span>
        <ChevronDown className="disclosure-chevron" size={14} aria-hidden="true" />
      </summary>
      <div className="evidence-body">
        <p className="evidence-notice">
          Synthetic evidence only. These locations have not been read or verified.
        </p>
        {evidence.map((citation, index) =>
          citation ? (
            <dl className="citation" key={citation.id}>
              <div>
                <dt>Markdown path</dt>
                <dd className="citation-path">{citation.path}</dd>
              </div>
              <div>
                <dt>Record ID</dt>
                <dd>{citation.record_id ?? 'Supporting document (no record ID)'}</dd>
              </div>
              <div>
                <dt>Exact heading</dt>
                <dd>{citation.heading}</dd>
              </div>
              <div>
                <dt>Lines</dt>
                <dd>
                  {citation.start_line}–{citation.end_line}
                </dd>
              </div>
              <div>
                <dt>Original source URLs</dt>
                <dd>
                  {citation.source_urls.length === 0 &&
                    'No source URL supplied. Evidence cannot be verified from this preview.'}
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
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : (
                      <span className="source-url" key={url}>
                        {url}
                        <small>
                          {imaginary
                            ? 'Illustrative URL — not a live source'
                            : 'Unavailable link — unsafe URL rejected'}
                        </small>
                      </span>
                    );
                  })}
                </dd>
              </div>
            </dl>
          ) : (
            <p key={ids[index]} role="alert">
              Source details are unavailable. This claim cannot be verified.
            </p>
          ),
        )}
      </div>
    </details>
  );
}

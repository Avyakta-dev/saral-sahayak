import { BookOpen, LoaderCircle } from 'lucide-react';
import type { AnalysisActivity } from '../lib/contracts';
import { useLocale, LocalizedText } from '../lib/i18n';
import type { MessageKey } from '../lib/i18n/en';

const phaseKeys: Record<AnalysisActivity['phase'], MessageKey> = {
  thinking: 'activityThinking',
  searching: 'activitySearching',
  reading: 'activityReading',
  validating: 'activityValidating',
};
export function ActivityPanel({
  activity,
  working,
}: {
  activity: AnalysisActivity[];
  working: boolean;
}) {
  const { locale, t } = useLocale();
  const latest = activity.at(-1);
  return (
    <section className="activity-panel" aria-label={t('activityRegion')} lang={locale}>
      <p className="activity-status" role="status" aria-live="polite">
        {working ? (
          <LoaderCircle className="spin" size={16} aria-hidden="true" />
        ) : (
          <BookOpen size={16} aria-hidden="true" />
        )}
        {working ? (latest ? t(phaseKeys[latest.phase]) : t('activityWaiting')) : t('activityLog')}
      </p>
      {activity.length > 0 && (
        <details open={working}>
          <summary>{t('activityEvents', { count: activity.length })}</summary>
          <ol className="activity-history">
            {activity.map((event, index) => (
              <li key={index}>
                <strong>
                  {event.turn
                    ? t('activityTurn', { phase: t(phaseKeys[event.phase]), turn: event.turn })
                    : t(phaseKeys[event.phase])}
                </strong>
                {event.path && (
                  <>
                    <code lang="en">{event.path}</code>
                    <span>
                      <LocalizedText
                        id="activityLines"
                        values={{
                          heading: event.heading ? (
                            <span lang="">{event.heading}</span>
                          ) : (
                            t('noHeading')
                          ),
                          start: event.start_line,
                          end: event.end_line,
                        }}
                      />
                    </span>
                  </>
                )}
              </li>
            ))}
          </ol>
        </details>
      )}
      <p className="activity-caveat">{t('activityCaveat')}</p>
    </section>
  );
}

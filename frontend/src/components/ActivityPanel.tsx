import { useEffect, useRef, useState } from 'react';
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

const AGENTS: { role: MessageKey; work: MessageKey }[] = [
  { role: 'agentExtractor', work: 'agentExtractorWork' },
  { role: 'agentClassifier', work: 'agentClassifierWork' },
  { role: 'agentExplainer', work: 'agentExplainerWork' },
  { role: 'agentFix', work: 'agentFixWork' },
  { role: 'agentDraft', work: 'agentDraftWork' },
  { role: 'agentOrchestrator', work: 'agentOrchestratorWork' },
];

const HOLD_MS = [0, 1600, 3400, 5400, 7600, 10000];

function floorFromActivity(activity: AnalysisActivity[]) {
  const latest = activity.at(-1);
  if (!latest) return 0;
  if (latest.phase === 'thinking') return 0;
  if (latest.phase === 'searching') return 1;
  if (latest.phase === 'reading') {
    const reads = activity.filter((item) => item.phase === 'reading').length;
    return reads > 1 ? 3 : 2;
  }
  return 4;
}

export function ActivityPanel({
  activity,
  working,
}: {
  activity: AnalysisActivity[];
  working: boolean;
}) {
  const { locale, t } = useLocale();
  const latest = activity.at(-1);
  const [active, setActive] = useState(0);
  const started = useRef<number | null>(null);
  useEffect(() => {
    if (!working) {
      started.current = null;
      setActive(AGENTS.length);
      return;
    }
    if (started.current == null) {
      started.current = Date.now();
      setActive(0);
    }
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - (started.current ?? Date.now());
      let timed = 0;
      for (let index = HOLD_MS.length - 1; index >= 0; index -= 1) {
        if (elapsed >= HOLD_MS[index]) {
          timed = index;
          break;
        }
      }
      const floor = Math.max(timed, floorFromActivity(activity));
      setActive((previous) => Math.min(AGENTS.length - 1, Math.max(previous, floor)));
    }, 250);
    return () => window.clearInterval(timer);
  }, [working, activity]);
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
      <div className="agent-pipeline" aria-label={t('agentsTitle')}>
        <p className="agent-pipeline-title">{t('agentsTitle')}</p>
        <ol>
          {AGENTS.map((agent, index) => {
            const state = !working && active >= AGENTS.length
              ? 'done'
              : index < active
                ? 'done'
                : index === active
                  ? 'active'
                  : 'queued';
            return (
              <li key={agent.role} className={`agent-step agent-${state}`}>
                <span className="agent-mark" aria-hidden="true">
                  {state === 'done' ? '✓' : index + 1}
                </span>
                <span>
                  <strong>{t(agent.role)}</strong>
                  <em>{t(agent.work)}</em>
                </span>
                <small>
                  {state === 'active' ? t('agentActive') : state === 'done' ? t('agentDone') : t('agentQueued')}
                </small>
              </li>
            );
          })}
        </ol>
      </div>
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

/** Max analyze attempts per live turn (initial submit + user-initiated retries). */
export const MAX_ANALYSIS_ATTEMPTS = 3;

/** Remaining user-initiated retries after `attempts` completed analyze tries. */
export function retriesRemaining(attempts: number): number {
  if (!Number.isFinite(attempts) || attempts < 0) return MAX_ANALYSIS_ATTEMPTS;
  return Math.max(0, MAX_ANALYSIS_ATTEMPTS - Math.floor(attempts));
}

export function canRetryAnalysis(attempts: number): boolean {
  return retriesRemaining(attempts) > 0;
}

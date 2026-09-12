import { describe, expect, it } from 'vitest';
import { MAX_ANALYSIS_ATTEMPTS, canRetryAnalysis, retriesRemaining } from './analysisRetry';

describe('analysisRetry bounds', () => {
  it('allows the initial attempt plus bounded user retries', () => {
    expect(MAX_ANALYSIS_ATTEMPTS).toBe(3);
    expect(canRetryAnalysis(0)).toBe(true);
    expect(retriesRemaining(0)).toBe(3);
    expect(canRetryAnalysis(1)).toBe(true);
    expect(retriesRemaining(1)).toBe(2);
    expect(canRetryAnalysis(2)).toBe(true);
    expect(retriesRemaining(2)).toBe(1);
    expect(canRetryAnalysis(3)).toBe(false);
    expect(retriesRemaining(3)).toBe(0);
    expect(canRetryAnalysis(99)).toBe(false);
  });

  it('treats invalid attempt counts as fully available', () => {
    expect(retriesRemaining(-1)).toBe(MAX_ANALYSIS_ATTEMPTS);
    expect(canRetryAnalysis(Number.NaN)).toBe(true);
  });
});

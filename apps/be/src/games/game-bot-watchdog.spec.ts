import { AI_VS_AI_DELAYS_MS } from './common/ai-vs-ai';
import { STALE_THRESHOLD_MS } from './game-bot-watchdog';

/**
 * Pins the invariant documented on STALE_THRESHOLD_MS: the watchdog must
 * never consider a session stale while a scheduled AI-vs-AI move could
 * still legitimately be pending, or it would double-fire bot moves.
 */
describe('GameBotWatchdog constants', () => {
  it('stale threshold exceeds the longest configured AI-vs-AI pause', () => {
    const longestPause = Math.max(...AI_VS_AI_DELAYS_MS);
    expect(STALE_THRESHOLD_MS).toBeGreaterThan(longestPause);
  });

  it('keeps stuck-turn recovery bounded (~2× the longest pause)', () => {
    const longestPause = Math.max(...AI_VS_AI_DELAYS_MS);
    expect(STALE_THRESHOLD_MS).toBeLessThanOrEqual(longestPause * 3);
  });
});

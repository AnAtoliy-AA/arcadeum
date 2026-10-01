import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SoloActiveTimer } from '../soloActiveTimer';

describe('SoloActiveTimer', () => {
  let timer: SoloActiveTimer;

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    timer = new SoloActiveTimer();
  });

  afterEach(() => {
    timer.stop();
    vi.useRealTimers();
    localStorage.clear();
  });

  it('accumulates only while the session is running', () => {
    const startedAt = Date.now();
    timer.start(startedAt);

    vi.advanceTimersByTime(5_000);
    expect(timer.getActiveMs()).toBe(5_000);

    timer.stop();
    vi.advanceTimersByTime(60_000);
    expect(timer.getActiveMs()).toBe(5_000);
    expect(timer.getActiveMsFor(startedAt)).toBeNull();
  });

  it('does not count paused time', () => {
    timer.start(Date.now());

    vi.advanceTimersByTime(4_000);
    timer.setPaused(true);
    vi.advanceTimersByTime(30_000);
    expect(timer.getActiveMs()).toBe(4_000);

    timer.setPaused(false);
    vi.advanceTimersByTime(6_000);
    expect(timer.getActiveMs()).toBe(10_000);
  });

  it('does not count time while a blocking overlay is open', () => {
    timer.start(Date.now());

    vi.advanceTimersByTime(3_000);
    timer.setBlocked(true);
    vi.advanceTimersByTime(20_000);
    expect(timer.getActiveMs()).toBe(3_000);

    timer.setBlocked(false);
    vi.advanceTimersByTime(2_000);
    expect(timer.getActiveMs()).toBe(5_000);
  });

  it('does not count time while the tab is hidden', () => {
    timer.start(Date.now());

    vi.advanceTimersByTime(2_000);
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    document.dispatchEvent(new Event('visibilitychange'));
    vi.advanceTimersByTime(15_000);
    expect(timer.getActiveMs()).toBe(2_000);

    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    document.dispatchEvent(new Event('visibilitychange'));
    vi.advanceTimersByTime(1_000);
    expect(timer.getActiveMs()).toBe(3_000);
  });

  it('returns null for a session that is not the running one', () => {
    timer.start(Date.now());
    expect(timer.getActiveMsFor(Date.now() - 1)).toBeNull();
  });

  it('excludes time spent away from the page on resume', () => {
    const startedAt = Date.now();
    timer.start(startedAt);
    vi.advanceTimersByTime(8_000);
    timer.stop();

    // Simulates reopening the page much later with the same session.
    vi.advanceTimersByTime(600_000);
    const resumed = new SoloActiveTimer();
    resumed.start(startedAt);

    expect(resumed.getActiveMs()).toBe(8_000);
    resumed.stop();
  });

  it('treats a session created long ago as not yet played', () => {
    const startedAt = Date.now() - 120_000;
    timer.start(startedAt);
    expect(timer.getActiveMs()).toBe(0);

    vi.advanceTimersByTime(5_000);
    expect(timer.getActiveMs()).toBe(5_000);
  });

  it('restores accumulated time when a session is restarted quickly', () => {
    const startedAt = Date.now();
    timer.start(startedAt);
    vi.advanceTimersByTime(7_000);
    timer.stop();

    vi.advanceTimersByTime(2_000);
    const resumed = new SoloActiveTimer();
    resumed.start(startedAt);

    expect(resumed.getActiveMs()).toBe(9_000);
    resumed.stop();
  });
});

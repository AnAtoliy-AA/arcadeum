import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRecordGameResult } from './useRecordGameResult';
import { useLocalStatsStore } from '../store/statsStore';

describe('useRecordGameResult', () => {
  beforeEach(() => {
    useLocalStatsStore.getState().resetStats();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('records a won result', () => {
    renderHook(() => useRecordGameResult('won', 'tic_tac_toe_v1', 'session-1'));

    const overview = useLocalStatsStore.getState().getOverview();
    expect(overview.totalGames).toBe(1);
    expect(overview.wins).toBe(1);
  });

  it('records a lost result', () => {
    renderHook(() => useRecordGameResult('lost', 'cascade_v1', 'session-1'));

    const overview = useLocalStatsStore.getState().getOverview();
    expect(overview.totalGames).toBe(1);
    expect(overview.losses).toBe(1);
  });

  it('records a draw result', () => {
    renderHook(() =>
      useRecordGameResult('draw', 'tic_tac_toe_v1', 'session-1'),
    );

    const overview = useLocalStatsStore.getState().getOverview();
    expect(overview.totalGames).toBe(1);
    expect(overview.draws).toBe(1);
  });

  it('does not record when result is null', () => {
    renderHook(() => useRecordGameResult(null, 'tic_tac_toe_v1', 'session-1'));

    const overview = useLocalStatsStore.getState().getOverview();
    expect(overview.totalGames).toBe(0);
  });

  it('does not record when sessionId is null', () => {
    renderHook(() => useRecordGameResult('won', 'tic_tac_toe_v1', null));

    const overview = useLocalStatsStore.getState().getOverview();
    expect(overview.totalGames).toBe(0);
  });

  it('deduplicates by sessionId', () => {
    const { rerender } = renderHook(
      ({ result, sessionId }) =>
        useRecordGameResult(result, 'tic_tac_toe_v1', sessionId),
      { initialProps: { result: 'won' as const, sessionId: 'session-1' } },
    );

    // Re-render with same session — should NOT record again
    rerender({ result: 'won', sessionId: 'session-1' });

    const overview = useLocalStatsStore.getState().getOverview();
    expect(overview.totalGames).toBe(1);
  });

  it('records separately for different sessionIds', () => {
    const { rerender } = renderHook(
      ({ result, sessionId }) =>
        useRecordGameResult(result, 'tic_tac_toe_v1', sessionId),
      { initialProps: { result: 'won' as const, sessionId: 'session-1' } },
    );

    rerender({ result: 'lost', sessionId: 'session-2' });

    const overview = useLocalStatsStore.getState().getOverview();
    expect(overview.totalGames).toBe(2);
    expect(overview.wins).toBe(1);
    expect(overview.losses).toBe(1);
  });
});

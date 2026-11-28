import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { resolveHistoryStep, useMoveHistoryView } from './useMoveHistoryView';
import { isHistoryHotkeyBlocked } from './useHistoryHotkeys';
import type { ChessMove } from '../types';

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
const AFTER_E4 = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR';
const AFTER_E5 = 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR';

const move = (from: string, to: string): ChessMove =>
  ({
    from: { file: from[0], rank: Number(from[1]) },
    to: { file: to[0], rank: Number(to[1]) },
    notation: `${to}`,
  }) as unknown as ChessMove;

const snapshot = {
  moveHistory: [move('e2', 'e4'), move('e7', 'e5')],
  positionHistory: [START, AFTER_E4, AFTER_E5],
};

describe('resolveHistoryStep', () => {
  it('returns live (null) when there are no moves', () => {
    expect(resolveHistoryStep(null, 0, 'prev')).toBeNull();
  });

  it('steps back from live to the previous move', () => {
    expect(resolveHistoryStep(null, 3, 'prev')).toBe(1);
  });

  it('goes to the start position on first and clamps prev there', () => {
    expect(resolveHistoryStep(1, 3, 'first')).toBe(-1);
    expect(resolveHistoryStep(-1, 3, 'prev')).toBe(-1);
  });

  it('returns to live when stepping onto the latest move', () => {
    expect(resolveHistoryStep(1, 3, 'next')).toBeNull();
    expect(resolveHistoryStep(0, 3, 'last')).toBeNull();
  });
});

describe('useMoveHistoryView', () => {
  it('starts live and shows earlier positions when stepping back', () => {
    const { result } = renderHook(() => useMoveHistoryView(snapshot));
    expect(result.current.isViewingHistory).toBe(false);

    act(() => result.current.step('prev'));
    expect(result.current.viewIndex).toBe(0);
    expect(result.current.viewedBoard?.[4]?.[4]).toEqual({
      type: 'pawn',
      color: 'white',
    });
    expect(result.current.viewedLastMove).toEqual({
      from: { file: 'e', rank: 2 },
      to: { file: 'e', rank: 4 },
    });

    act(() => result.current.step('first'));
    expect(result.current.viewIndex).toBe(-1);
    expect(result.current.viewedLastMove).toBeNull();

    act(() => result.current.goLive());
    expect(result.current.isViewingHistory).toBe(false);
  });

  it('treats selecting the latest move as live', () => {
    const { result } = renderHook(() => useMoveHistoryView(snapshot));
    act(() => result.current.select(1));
    expect(result.current.isViewingHistory).toBe(false);
    act(() => result.current.select(0));
    expect(result.current.viewIndex).toBe(0);
  });

  it('ignores a corrupt position instead of crashing', () => {
    const broken = { ...snapshot, positionHistory: [START, 'bad', AFTER_E5] };
    const { result } = renderHook(() => useMoveHistoryView(broken));
    act(() => result.current.select(0));
    expect(result.current.isViewingHistory).toBe(false);
    expect(result.current.viewedBoard).toBeNull();
  });
});

describe('isHistoryHotkeyBlocked', () => {
  it('blocks keys typed into inputs and inside the board grid', () => {
    const input = document.createElement('input');
    expect(isHistoryHotkeyBlocked(input)).toBe(true);
    const grid = document.createElement('div');
    grid.setAttribute('role', 'grid');
    const cell = document.createElement('div');
    grid.appendChild(cell);
    expect(isHistoryHotkeyBlocked(cell)).toBe(true);
  });

  it('allows keys on regular page elements', () => {
    expect(isHistoryHotkeyBlocked(document.body)).toBe(false);
    expect(isHistoryHotkeyBlocked(null)).toBe(false);
  });
});

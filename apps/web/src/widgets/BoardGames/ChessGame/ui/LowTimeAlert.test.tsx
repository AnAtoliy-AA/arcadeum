import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LowTimeAlert, crossedLowTimeThreshold } from './LowTimeAlert';
import type { PlayerClock } from '../types';

const playSound = vi.fn();
vi.mock('../hooks/useChessSounds', () => ({
  useChessSounds: () => ({ playSound }),
}));

const t = ((key: string, params?: Record<string, string | number>) =>
  `${key}:${params?.seconds ?? ''}`) as never;

describe('crossedLowTimeThreshold', () => {
  it('reports the threshold crossed', () => {
    expect(crossedLowTimeThreshold(31, 30)).toBe(30);
    expect(crossedLowTimeThreshold(10.5, 9.9)).toBe(10);
  });

  it('reports the most urgent threshold when several are crossed at once', () => {
    expect(crossedLowTimeThreshold(40, 8)).toBe(10);
  });

  it('ignores ticks that cross nothing or reach zero', () => {
    expect(crossedLowTimeThreshold(29, 28)).toBeNull();
    expect(crossedLowTimeThreshold(5, 0)).toBeNull();
  });
});

describe('LowTimeAlert', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    playSound.mockClear();
  });
  afterEach(() => vi.useRealTimers());

  const clocks = (white: number): Record<'white' | 'black', PlayerClock> => ({
    // White's turn started when black last moved (now).
    white: { remainingSeconds: white, lastMoveTimestamp: 1 },
    black: { remainingSeconds: 300, lastMoveTimestamp: Date.now() },
  });

  it('warns once when my running clock drops below 10 seconds', async () => {
    render(
      <LowTimeAlert
        myColor="white"
        clocks={clocks(11)}
        currentTurnColor="white"
        isGameOver={false}
        gameCreatedAt={1}
        t={t}
      />,
    );
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    expect(playSound).toHaveBeenCalledWith('lowTime');
    expect(playSound).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status').textContent).toBe(
      'games.chess_v1.clock.lowTime:10',
    );
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    expect(playSound).toHaveBeenCalledTimes(1);
  });

  it('stays silent for spectators and while the opponent is thinking', async () => {
    const { rerender } = render(
      <LowTimeAlert
        myColor={null}
        clocks={clocks(11)}
        currentTurnColor="white"
        isGameOver={false}
        gameCreatedAt={1}
        t={t}
      />,
    );
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    rerender(
      <LowTimeAlert
        myColor="black"
        clocks={clocks(11)}
        currentTurnColor="white"
        isGameOver={false}
        gameCreatedAt={1}
        t={t}
      />,
    );
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    expect(playSound).not.toHaveBeenCalled();
  });
});

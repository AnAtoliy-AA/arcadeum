import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IdleScene, secondsLeft } from '../ui/IdleScene';
import { testT } from './testT';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: testT }),
}));
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

describe('secondsLeft', () => {
  it('rounds up and never goes negative', () => {
    expect(secondsLeft(10_000, 0)).toBe(10);
    expect(secondsLeft(10_000, 9_001)).toBe(1);
    expect(secondsLeft(10_000, 12_000)).toBe(0);
  });
});

describe('IdleScene', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('shows last result, next game preview, countdown and QR', () => {
    render(
      <IdleScene
        nextGameId="chess_v1"
        lastGameId="checkers_v1"
        result="Bot 2 wins"
        seconds={12}
        debug={false}
      />,
    );
    expect(screen.getByTestId('idle-last')).toHaveTextContent('Checkers');
    expect(screen.getByTestId('idle-result')).toHaveTextContent('Bot 2 wins');
    expect(screen.getByTestId('idle-next-title')).toHaveTextContent('Chess');
    expect(screen.getByTestId('idle-countdown')).toHaveTextContent('12s');
    expect(screen.getByTestId('idle-qr')).toHaveAttribute(
      'data-qr-url',
      'https://arcadeum.games',
    );
    expect(screen.getByTestId('idle-bot-badge')).toHaveTextContent(
      'Bot vs Bot',
    );
    expect(screen.getByTestId('idle-cta')).toHaveTextContent(
      'Play at arcadeum.games',
    );
  });

  it('counts down and stops at zero', () => {
    render(
      <IdleScene
        nextGameId="go_v1"
        lastGameId={null}
        result=""
        seconds={3}
        debug={false}
      />,
    );
    expect(screen.getByTestId('idle-countdown')).toHaveTextContent('3s');
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByTestId('idle-countdown')).toHaveTextContent('1s');
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(screen.getByTestId('idle-countdown')).toHaveTextContent('0s');
  });

  it('copes with no last game and no next game', () => {
    render(
      <IdleScene
        nextGameId={null}
        lastGameId={null}
        result=""
        seconds={5}
        debug={false}
      />,
    );
    expect(screen.getByTestId('idle-last')).toHaveTextContent(
      'Warming up the arena',
    );
    expect(screen.getByTestId('idle-next-title')).toHaveTextContent(
      'Coming up',
    );
  });

  it('shows diagnostics only in debug mode', () => {
    const { unmount } = render(
      <IdleScene
        nextGameId="go_v1"
        lastGameId={null}
        result=""
        seconds={5}
        debug={false}
      />,
    );
    expect(screen.queryByTestId('stream-debug')).toBeNull();
    unmount();
    render(
      <IdleScene
        nextGameId="go_v1"
        lastGameId={null}
        result=""
        seconds={5}
        debug
      />,
    );
    expect(screen.getByTestId('stream-debug')).toHaveTextContent('next=go_v1');
  });
});

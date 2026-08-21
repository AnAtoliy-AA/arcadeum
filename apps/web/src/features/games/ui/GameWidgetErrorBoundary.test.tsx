import type { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameWidgetErrorBoundary } from './GameWidgetErrorBoundary';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      key === 'games.widgetError.title'
        ? 'Something went wrong'
        : key === 'games.widgetError.retry'
          ? 'Try again'
          : 'This game hit an unexpected error. Try again to keep playing.',
  }),
}));

function Bomber(): ReactNode {
  throw new Error('boom');
}

function renderBomber() {
  return render(
    <GameWidgetErrorBoundary>
      <Bomber />
    </GameWidgetErrorBoundary>,
  );
}

describe('GameWidgetErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <GameWidgetErrorBoundary>
        <div>all good</div>
      </GameWidgetErrorBoundary>,
    );
    expect(screen.getByText('all good')).toBeInTheDocument();
  });

  it('catches a render error and shows the fallback', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderBomber();
    expect(screen.getByTestId('game-widget-error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('recovers when the retry button is clicked', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    let shouldThrow = true;
    function ToggleBomber() {
      if (shouldThrow) throw new Error('boom');
      return <div>recovered</div>;
    }
    render(
      <GameWidgetErrorBoundary>
        <ToggleBomber />
      </GameWidgetErrorBoundary>,
    );
    expect(screen.getByTestId('game-widget-error')).toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByText('recovered')).toBeInTheDocument();
    expect(screen.queryByTestId('game-widget-error')).not.toBeInTheDocument();
    spy.mockRestore();
  });

  it('resets when resetKey changes', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    function KeyBomber(): ReactNode {
      throw new Error('boom');
    }
    const { rerender } = render(
      <GameWidgetErrorBoundary resetKey="a">
        <KeyBomber />
      </GameWidgetErrorBoundary>,
    );
    expect(screen.getByTestId('game-widget-error')).toBeInTheDocument();

    function Fine() {
      return <div>key recovered</div>;
    }
    rerender(
      <GameWidgetErrorBoundary resetKey="b">
        <Fine />
      </GameWidgetErrorBoundary>,
    );
    expect(screen.getByText('key recovered')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('supports a custom fallback', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <GameWidgetErrorBoundary fallback={<div>custom fallback</div>}>
        <Bomber />
      </GameWidgetErrorBoundary>,
    );
    expect(screen.getByText('custom fallback')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('invokes onError with the thrown error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onError = vi.fn();
    render(
      <GameWidgetErrorBoundary onError={onError}>
        <Bomber />
      </GameWidgetErrorBoundary>,
    );
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    spy.mockRestore();
  });
});

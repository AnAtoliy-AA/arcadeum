import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../../../../shared/config/tamagui.config';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { HandRail } from './HandRail';

function renderRail(
  props: Partial<React.ComponentProps<typeof HandRail>> = {},
) {
  const merged: React.ComponentProps<typeof HandRail> = {
    handCount: 5,
    defuseCount: 1,
    combo: { kind: 'none', label: 'Select cards' },
    canPlay: false,
    canDraw: true,
    canNope: false,
    onPlay: vi.fn(),
    onDraw: vi.fn(),
    onNope: vi.fn(),
    ...props,
  };
  return {
    ...render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <HandRail {...merged} />
      </TamaguiProvider>,
    ),
    props: merged,
  };
}

describe('HandRail', () => {
  it('renders hand count and defuse pill', () => {
    renderRail({ handCount: 7, defuseCount: 2 });
    expect(screen.getByTestId('hand-rail-count')).toHaveTextContent('7');
    expect(screen.getByTestId('hand-rail-defuses')).toHaveTextContent('2');
  });

  it('exposes combo kind on the Play button via data attribute', () => {
    renderRail({
      combo: { kind: 'pair', label: 'Play 2× Strike · steal' },
    });
    expect(screen.getByTestId('hand-rail-play')).toHaveAttribute(
      'data-combo-kind',
      'pair',
    );
    expect(screen.getByTestId('hand-rail-play')).toHaveTextContent(
      'Play 2× Strike · steal',
    );
  });

  it('disables the Play button when canPlay is false', () => {
    const onPlay = vi.fn();
    renderRail({ canPlay: false, onPlay });
    fireEvent.click(screen.getByTestId('hand-rail-play'));
    expect(onPlay).not.toHaveBeenCalled();
  });

  it('fires onPlay when the Play button is clicked', () => {
    const onPlay = vi.fn();
    renderRail({ canPlay: true, onPlay });
    fireEvent.click(screen.getByTestId('hand-rail-play'));
    expect(onPlay).toHaveBeenCalledTimes(1);
  });

  it('fires onDraw when the Draw button is clicked', () => {
    const onDraw = vi.fn();
    renderRail({ canDraw: true, onDraw });
    fireEvent.click(screen.getByTestId('hand-rail-draw'));
    expect(onDraw).toHaveBeenCalledTimes(1);
  });

  it('hides the Nope button by default', () => {
    renderRail();
    expect(screen.queryByTestId('hand-rail-nope')).not.toBeInTheDocument();
  });

  it('shows and wires the Nope button when canNope is true', () => {
    const onNope = vi.fn();
    renderRail({ canNope: true, onNope });
    fireEvent.click(screen.getByTestId('hand-rail-nope'));
    expect(onNope).toHaveBeenCalledTimes(1);
  });

  it('hides the chrome menu by default (no callbacks provided)', () => {
    renderRail();
    expect(screen.queryByTestId('hand-rail-menu')).not.toBeInTheDocument();
  });

  it('renders Rules + Fullscreen buttons when both callbacks are provided', () => {
    const onOpenRules = vi.fn();
    const onToggleFullscreen = vi.fn();
    renderRail({ onOpenRules, onToggleFullscreen });
    fireEvent.click(screen.getByTestId('hand-rail-rules'));
    expect(onOpenRules).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByTestId('hand-rail-fullscreen'));
    expect(onToggleFullscreen).toHaveBeenCalledTimes(1);
  });

  it('renders only the Rules button when fullscreen callback is omitted', () => {
    renderRail({ onOpenRules: vi.fn() });
    expect(screen.getByTestId('hand-rail-rules')).toBeInTheDocument();
    expect(
      screen.queryByTestId('hand-rail-fullscreen'),
    ).not.toBeInTheDocument();
  });

  it('exposes the right aria-label on the fullscreen button by state', () => {
    const { rerender } = renderRail({
      onToggleFullscreen: vi.fn(),
      isFullscreen: false,
    });
    expect(screen.getByTestId('hand-rail-fullscreen')).toHaveAttribute(
      'aria-label',
      'games.table.controlPanel.enterFullscreen',
    );
    rerender(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <HandRail
          handCount={5}
          defuseCount={1}
          combo={{ kind: 'none', label: 'Select cards' }}
          canPlay={false}
          canDraw={true}
          canNope={false}
          onPlay={vi.fn()}
          onDraw={vi.fn()}
          onNope={vi.fn()}
          onToggleFullscreen={vi.fn()}
          isFullscreen={true}
        />
      </TamaguiProvider>,
    );
    expect(screen.getByTestId('hand-rail-fullscreen')).toHaveAttribute(
      'aria-label',
      'games.table.controlPanel.exitFullscreen',
    );
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../../../shared/config/tamagui.config';
import { ScenePaletteProvider } from './ScenePaletteContext';
import { getVariantStyles } from './styles/variants';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (key === 'games.table.players.yourMove') return 'Your move';
      if (key === 'games.table.players.playerTurn') {
        const name = params?.name ?? '';
        return `${name}'s turn`;
      }
      return key;
    },
  }),
}));

// eslint-disable-next-line import/first
import { TurnBanner } from './TurnBanner';

const palette = getVariantStyles('cyberpunk').scene;

interface RenderBannerProps {
  isMyTurn?: boolean;
  currentPlayerName?: string;
  secondsRemaining?: number | null;
}

function renderBanner(props: RenderBannerProps = {}) {
  const {
    isMyTurn = false,
    currentPlayerName = 'Player',
    secondsRemaining = 0,
  } = props;
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <ScenePaletteProvider palette={palette}>
        <TurnBanner
          isMyTurn={isMyTurn}
          currentPlayerName={currentPlayerName}
          secondsRemaining={secondsRemaining}
        />
      </ScenePaletteProvider>
    </TamaguiProvider>,
  );
}

describe('TurnBanner', () => {
  it('shows YOUR MOVE when isMyTurn', () => {
    renderBanner({ isMyTurn: true });
    expect(screen.getByTestId('turn-banner')).toHaveTextContent(/YOUR MOVE/i);
  });

  it("shows {NAME}'S TURN otherwise", () => {
    renderBanner({ isMyTurn: false, currentPlayerName: 'Alice' });
    expect(screen.getByTestId('turn-banner')).toHaveTextContent(/ALICE/i);
  });

  it('formats seconds as m:ss', () => {
    renderBanner({ secondsRemaining: 75 });
    expect(screen.getByTestId('turn-banner')).toHaveTextContent('1:15');
  });

  it('renders timer as 0:00 when null', () => {
    renderBanner({ secondsRemaining: null });
    expect(screen.getByTestId('turn-banner')).toHaveTextContent('0:00');
  });

  it('gates the pulsing dot animation behind prefers-reduced-motion: no-preference', () => {
    const { container } = renderBanner({ isMyTurn: true });
    // The animation must live inside a @media (prefers-reduced-motion: no-preference)
    // block so that users with "reduce" set never receive the animation property.
    const styleTag = container.querySelector('style');
    expect(styleTag).not.toBeNull();
    const css = styleTag?.innerHTML ?? '';
    expect(css).toMatch(/prefers-reduced-motion:\s*no-preference/);
    expect(css).toMatch(/animation:\s*turnBannerDotPulse/);

    // The dot's inline style must not contain an animation rule — animation is
    // only attached via the guarded @media CSS block.
    const dot = screen.getByTestId('turn-banner-dot');
    expect(dot.getAttribute('style') ?? '').not.toContain('animation');
  });
});

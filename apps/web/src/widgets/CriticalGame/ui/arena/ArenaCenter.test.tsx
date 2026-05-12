import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../../../../shared/config/tamagui.config';
import { ScenePaletteProvider } from '../ScenePaletteContext';
import { getVariantStyles } from '../styles/variants';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (key === 'games.table.players.yourMove') return 'Your move';
      if (key === 'games.table.players.playerTurn') {
        return `${params?.name ?? ''}'s turn`;
      }
      return key;
    },
  }),
}));

import { ArenaCenter } from './ArenaCenter';
import type { CriticalCard } from '../../types';

const palette = getVariantStyles('cyberpunk').scene;

function renderCenter(
  override: Partial<React.ComponentProps<typeof ArenaCenter>> = {},
) {
  const props: React.ComponentProps<typeof ArenaCenter> = {
    isMyTurn: true,
    currentPlayerName: 'Alice',
    pendingDraws: 1,
    hand: ['strike', 'evade'] as CriticalCard[],
    allowActionCardCombos: false,
    deck: ['strike'] as CriticalCard[],
    logs: [],
    formatLogMessage: (m?: string | null) => m ?? '',
    ...override,
  };
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <ScenePaletteProvider palette={palette}>
        <ArenaCenter {...props} />
      </ScenePaletteProvider>
    </TamaguiProvider>,
  );
}

describe('ArenaCenter', () => {
  it('renders turn banner, combo card, threat strip, and flash slot', () => {
    renderCenter();
    expect(screen.getByTestId('arena-center')).toBeInTheDocument();
    expect(screen.getByTestId('turn-banner')).toBeInTheDocument();
    expect(screen.getByTestId('combo-card')).toBeInTheDocument();
    expect(screen.getByTestId('threat-strip')).toBeInTheDocument();
    expect(screen.getByTestId('arena-flash-slot')).toBeInTheDocument();
  });

  it('renders the flash slot as a child of arena-center so the overlay can position relative to it', () => {
    const { container } = renderCenter();
    const center = container.querySelector('[data-testid="arena-center"]');
    expect(center).not.toBeNull();
    expect(
      center?.querySelector('[data-testid="arena-flash-slot"]'),
    ).not.toBeNull();
  });
});

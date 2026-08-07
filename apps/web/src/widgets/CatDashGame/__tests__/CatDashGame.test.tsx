import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../../../shared/config/tamagui.config';
import { CatDashBoard } from '../ui/Board';
import { CatDashTurnBadge } from '../ui/TurnBadge';
import { CatDashRulesModal } from '../ui/RulesModal';
import { CatDashThemeProvider } from '../lib/CatDashThemeContext';
import type { CatDashClientState } from '../types';

function renderWithTheme(ui: React.ReactNode) {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <CatDashThemeProvider variant="village">{ui}</CatDashThemeProvider>
    </TamaguiProvider>,
  );
}

const mockSnapshot: CatDashClientState = {
  trackType: 'linear',
  theme: 'village',
  columns: 10,
  trackLength: 21,
  currentPlayerIndex: 0,
  turnNumber: 1,
  track: Array.from({ length: 21 }, (_, i) => ({
    id: i,
    type:
      i === 0 || i === 20
        ? 'normal'
        : i % 5 === 0
          ? 'obstacle'
          : i % 3 === 0
            ? 'bonus'
            : 'normal',
  })),
  gameOver: false,
  players: [
    {
      playerId: 'p1',
      catId: 'neon',
      position: 3,
      powerTokens: 3,
      abilitiesUsed: [],
      isReady: true,
      hasBonus: false,
    },
    {
      playerId: 'p2',
      catId: 'whiskers',
      position: 1,
      powerTokens: 3,
      abilitiesUsed: [],
      isReady: true,
      hasBonus: false,
    },
  ],
  logs: [],
};

describe('CatDashBoard', () => {
  it('renders track spaces', () => {
    renderWithTheme(
      <CatDashBoard
        snapshot={mockSnapshot}
        disabled={false}
        resolveName={(id) => id ?? ''}
      />,
    );
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('21')).toBeTruthy();
  });

  it('renders player indicators', () => {
    renderWithTheme(
      <CatDashBoard
        snapshot={mockSnapshot}
        disabled={false}
        resolveName={(id) => id ?? ''}
      />,
    );
    expect(screen.getByText('p1')).toBeTruthy();
    expect(screen.getByText('p2')).toBeTruthy();
  });
});

describe('CatDashTurnBadge', () => {
  it('shows current player turn', () => {
    renderWithTheme(
      <CatDashTurnBadge
        snapshot={mockSnapshot}
        currentEntryId="p1"
        myTurn={true}
        resolveName={(id) => id ?? ''}
      />,
    );
    expect(screen.getByText(/Your turn/)).toBeTruthy();
  });

  it('shows other player turn', () => {
    renderWithTheme(
      <CatDashTurnBadge
        snapshot={mockSnapshot}
        currentEntryId="p2"
        myTurn={false}
        resolveName={(id) => id ?? ''}
      />,
    );
    expect(screen.getByText(/rolling/)).toBeTruthy();
  });
});

describe('CatDashRulesModal', () => {
  it('renders when open', () => {
    renderWithTheme(<CatDashRulesModal open={true} onClose={() => {}} />);
    expect(screen.getByText('Cat Dash — Rules')).toBeTruthy();
  });

  it('does not render when closed', () => {
    renderWithTheme(<CatDashRulesModal open={false} onClose={() => {}} />);
    expect(screen.queryByText('Cat Dash — Rules')).toBeNull();
  });
});

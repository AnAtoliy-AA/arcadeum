import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CatDashBoard } from '../ui/Board';
import { CatDashTurnBadge } from '../ui/TurnBadge';
import { CatDashRulesModal } from '../ui/RulesModal';
import { CatDashThemeProvider } from '../lib/CatDashThemeContext';
import type { CatDashClientState } from '../types';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'games.cat_dash_v1.rules.title': 'Cat Dash — Rules',
        'games.cat_dash_v1.rules.objectiveTitle': 'Objective',
        'games.cat_dash_v1.rules.objective':
          'Score points by reaching the finish line.',
        'games.cat_dash_v1.rules.howToPlayTitle': 'How to Play',
        'games.cat_dash_v1.rules.howToPlay': 'Roll dice and move forward.',
        'games.cat_dash_v1.rules.trackSpacesTitle': 'Track Spaces',
        'games.cat_dash_v1.rules.trackSpaces':
          'Different spaces have different effects.',
        'games.cat_dash_v1.rules.abilitiesTitle': 'Abilities',
        'games.cat_dash_v1.rules.abilities':
          'Use power tokens for special abilities.',
        'games.cat_dash_v1.rules.catsTitle': 'Cats',
        'games.cat_dash_v1.rules.cats': 'Each cat has unique abilities.',
        'games.cat_dash_v1.rules.trackTypesTitle': 'Track Types',
        'games.cat_dash_v1.rules.trackTypes': 'Linear or branching tracks.',
      };
      return map[key] ?? key;
    },
  }),
}));

function renderWithTheme(ui: React.ReactNode) {
  return render(
    <CatDashThemeProvider variant="cyberpunk">{ui}</CatDashThemeProvider>,
  );
}

const mockSnapshot: CatDashClientState = {
  trackType: 'linear',
  theme: 'cyberpunk',
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

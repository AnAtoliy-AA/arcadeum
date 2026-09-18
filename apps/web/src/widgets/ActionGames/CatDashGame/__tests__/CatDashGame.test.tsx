import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CatDashBoard } from '../ui/Board';
import { CatDashTurnBadge } from '../ui/TurnBadge';
import { CatDashRulesModal } from '../ui/RulesModal';
import { CatDashDashboard } from '../ui/CatDashDashboard';
import { RealisticCat } from '../ui/RealisticCat';
import { RacerBioModal } from '../ui/RacerBioModal';
import { TacticalAbilityBar } from '../ui/TacticalAbilityBar';
import { CatDashThemeProvider } from '../lib/CatDashThemeContext';
import type { CatDashClientState, CatId } from '../types';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'games.cat_dash_v1.rules.title': 'Cat Dash - Rules',
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
    type: i === 0 ? 'start' : i === 20 ? 'finish' : 'standard',
    players: [],
    branches: [],
  })),
  players: [
    {
      playerId: 'p1',
      catId: 'neon',
      position: 5,
      powerTokens: 2,
      shielded: false,
      extraTurnPending: false,
      frozenTurnsRemaining: 0,
      activeEffects: [],
    },
    {
      playerId: 'p2',
      catId: 'whiskers',
      position: 3,
      powerTokens: 1,
      shielded: false,
      extraTurnPending: false,
      frozenTurnsRemaining: 0,
      activeEffects: [],
    },
  ],
  gamePhase: 'active',
  winner: null,
  logs: [
    {
      id: 'log-1',
      type: 'action',
      message: 'Player 1 Rolled 4 and moved',
      timestamp: 1000,
    },
  ],
  settings: {
    maxPlayers: 4,
    theme: 'cyberpunk',
    trackType: 'linear',
    difficulty: 'medium',
  },
};

describe('CatDashBoard', () => {
  it('renders track spaces', () => {
    const { container } = renderWithTheme(
      <CatDashBoard
        snapshot={mockSnapshot}
        currentUserId="p1"
        onSpaceClick={() => {}}
      />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders player indicators', () => {
    const { container } = renderWithTheme(
      <CatDashBoard
        snapshot={mockSnapshot}
        currentUserId="p1"
        onSpaceClick={() => {}}
      />,
    );
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThan(0);
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
        currentEntryId="p1"
        myTurn={false}
        resolveName={(id) => id ?? ''}
      />,
    );
    expect(screen.getByText(/is rolling/)).toBeTruthy();
  });
});

describe('CatDashRulesModal', () => {
  it('renders when open', () => {
    renderWithTheme(<CatDashRulesModal open={true} onClose={() => {}} />);
    expect(screen.getByText('Cat Dash - Rules')).toBeTruthy();
  });

  it('does not render when closed', () => {
    renderWithTheme(<CatDashRulesModal open={false} onClose={() => {}} />);
    expect(screen.queryByText('Cat Dash - Rules')).toBeNull();
  });
});

describe('RealisticCat', () => {
  it('renders correctly for all cat breeds', () => {
    const catIds: CatId[] = [
      'neon',
      'whiskers',
      'stardust',
      'felix',
      'shadow',
      'luna',
    ];

    for (const catId of catIds) {
      const { container } = render(<RealisticCat catId={catId} size={48} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg?.getAttribute('width')).toBe('48');
    }
  });
});

describe('RacerBioModal', () => {
  it('renders when open and switches between cats', () => {
    renderWithTheme(
      <RacerBioModal open={true} onClose={() => {}} initialCatId="neon" />,
    );

    expect(screen.getByText('Racer Dossier')).toBeInTheDocument();
    expect(screen.getAllByText('Neon').length).toBeGreaterThan(0);
    expect(screen.getByText('Cyber Bengal')).toBeInTheDocument();
    expect(screen.getByText('Performance Specs')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Whiskers'));
    expect(screen.getByText('Ginger Tabby')).toBeInTheDocument();
  });
});

describe('CatDashDashboard', () => {
  it('renders race progress, player cards, and roll dice button', () => {
    const handleRoll = vi.fn();
    renderWithTheme(
      <CatDashDashboard
        snapshot={mockSnapshot}
        currentUserId="p1"
        myTurn={true}
        isGameOver={false}
        isRolling={false}
        onRollDice={handleRoll}
        resolveName={(id) => id ?? ''}
      />,
    );

    expect(screen.getByTestId('catdash-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('dice-overlay-roll-button')).toBeInTheDocument();
    expect(screen.getByTestId('player-card-p1')).toBeInTheDocument();
    expect(screen.getByTestId('player-card-p2')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('dice-overlay-roll-button'));
    expect(handleRoll).toHaveBeenCalledTimes(1);
  });

  it('renders rolling animation when isRolling is true', () => {
    renderWithTheme(
      <CatDashDashboard
        snapshot={mockSnapshot}
        currentUserId="p1"
        myTurn={true}
        isGameOver={false}
        isRolling={true}
        onRollDice={vi.fn()}
        resolveName={(id) => id ?? ''}
      />,
    );

    expect(
      screen.getByTestId('dice-overlay-rolling-state'),
    ).toBeInTheDocument();
  });

  it('opens racer dossier when inspect button is clicked', () => {
    renderWithTheme(
      <CatDashDashboard
        snapshot={mockSnapshot}
        currentUserId="p1"
        myTurn={true}
        isGameOver={false}
        isRolling={false}
        onRollDice={vi.fn()}
        resolveName={(id) => id ?? ''}
      />,
    );

    fireEvent.click(screen.getByTestId('inspect-racers-btn'));
    expect(screen.getByText('Racer Dossier')).toBeInTheDocument();
  });

  it('triggers onUseAbility when ability button is clicked', () => {
    const handleUseAbility = vi.fn();
    renderWithTheme(
      <CatDashDashboard
        snapshot={mockSnapshot}
        currentUserId="p1"
        myTurn={true}
        isGameOver={false}
        isRolling={false}
        onRollDice={vi.fn()}
        resolveName={(id) => id ?? ''}
        onUseAbility={handleUseAbility}
      />,
    );

    const boostBtn = screen.getByTestId('ability-btn-neon_boost');
    expect(boostBtn).toBeInTheDocument();
    fireEvent.click(boostBtn);
    expect(handleUseAbility).toHaveBeenCalledWith('neon_boost');
  });
});

describe('TacticalAbilityBar', () => {
  it('renders abilities and handles activation', () => {
    const onUseAbility = vi.fn();
    renderWithTheme(
      <TacticalAbilityBar
        catId="neon"
        powerTokens={3}
        myTurn={true}
        isRolling={false}
        isGameOver={false}
        onUseAbility={onUseAbility}
      />,
    );

    expect(screen.getByTestId('tactical-ability-bar')).toBeInTheDocument();
    expect(screen.getByText('Digital Dash')).toBeInTheDocument();
    expect(screen.getByText('Neon Shield')).toBeInTheDocument();

    const shieldBtn = screen.getByTestId('ability-btn-neon_shield');
    fireEvent.click(shieldBtn);
    expect(onUseAbility).toHaveBeenCalledWith('neon_shield');
  });

  it('shows active buff indicators', () => {
    renderWithTheme(
      <TacticalAbilityBar
        catId="neon"
        powerTokens={1}
        shielded={true}
        speedBoostPending={3}
        myTurn={true}
        isRolling={false}
        isGameOver={false}
        onUseAbility={vi.fn()}
      />,
    );

    expect(screen.getByTestId('buff-shield')).toBeInTheDocument();
    expect(screen.getByTestId('buff-speed-boost')).toBeInTheDocument();
  });
});


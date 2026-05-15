import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../../../../shared/config/tamagui.config';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/features/games/store/gameStore', () => ({
  useGameStore: (selector: (s: unknown) => unknown) =>
    selector({ idlePlayers: [] }),
}));

vi.mock('@/shared/ui', () => ({
  IdleBadge: () => <span data-testid="idle-badge">idle</span>,
}));

import { OpponentsRow } from './OpponentsRow';
import type { CriticalCard, CriticalPlayerTableState } from '../../types';

function makePlayers(count: number): CriticalPlayerTableState[] {
  return Array.from({ length: count }, (_, i) => ({
    playerId: `p${i + 1}`,
    alive: true,
    hand: ['strike'] as CriticalCard[],
  }));
}

function renderRow(
  override: Partial<React.ComponentProps<typeof OpponentsRow>> = {},
) {
  const props: React.ComponentProps<typeof OpponentsRow> = {
    opponents: makePlayers(2),
    currentTurnPlayerId: null,
    resolveDisplayName: (_id, fb) => fb,
    ...override,
  };
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <OpponentsRow {...props} />
    </TamaguiProvider>,
  );
}

describe('OpponentsRow', () => {
  it('uses duel mode for a single opponent', () => {
    renderRow({ opponents: makePlayers(1) });
    const row = screen.getByTestId('opponents-row');
    expect(row).toHaveAttribute('data-mode', 'duel');
    expect(row).toHaveAttribute('data-count', '1');
    expect(screen.getByTestId('player-card-p1')).toBeInTheDocument();
  });

  it('uses FFA mode for 2+ opponents', () => {
    renderRow({ opponents: makePlayers(4) });
    expect(screen.getByTestId('opponents-row')).toHaveAttribute(
      'data-mode',
      'ffa',
    );
    expect(screen.getByTestId('opponents-row')).toHaveAttribute(
      'data-count',
      '4',
    );
  });

  it('renders all five tiles in a full FFA lobby', () => {
    renderRow({ opponents: makePlayers(5) });
    for (let i = 1; i <= 5; i += 1) {
      expect(screen.getByTestId(`player-card-p${i}`)).toBeInTheDocument();
    }
  });

  it('routes the turn ring to the matching opponent', () => {
    renderRow({
      opponents: makePlayers(3),
      currentTurnPlayerId: 'p2',
    });
    expect(screen.getByTestId('player-card-p1')).toHaveAttribute(
      'data-current-turn',
      'false',
    );
    expect(screen.getByTestId('player-card-p2')).toHaveAttribute(
      'data-current-turn',
      'true',
    );
  });

  it('flags the armed target opponent only', () => {
    renderRow({
      opponents: makePlayers(3),
      targetPlayerId: 'p3',
    });
    expect(screen.getByTestId('player-card-p1')).toHaveAttribute(
      'data-target',
      'false',
    );
    expect(screen.getByTestId('player-card-p3')).toHaveAttribute(
      'data-target',
      'true',
    );
  });

  it('forwards onSelectTarget calls with the clicked opponent id', () => {
    const onSelectTarget = vi.fn();
    renderRow({ opponents: makePlayers(2), onSelectTarget });
    screen.getByTestId('player-card-p2').click();
    expect(onSelectTarget).toHaveBeenCalledWith('p2');
  });

  it('does not invoke onSelectTarget for eliminated tiles', () => {
    const onSelectTarget = vi.fn();
    const opponents: CriticalPlayerTableState[] = [
      { playerId: 'p1', alive: true, hand: ['strike'] as CriticalCard[] },
      { playerId: 'p2', alive: false, hand: [] as CriticalCard[] },
    ];
    renderRow({ opponents, onSelectTarget });
    screen.getByTestId('player-card-p2').click();
    expect(onSelectTarget).not.toHaveBeenCalled();
  });
});

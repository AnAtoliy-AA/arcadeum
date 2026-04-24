import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../../../shared/config/tamagui.config';
import { ScenePaletteProvider } from './ScenePaletteContext';
import { getVariantStyles } from './styles/variants';
import type { CriticalPlayerTableState } from '../types';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'games.table.players.eliminated') return 'Eliminated';
      return key;
    },
  }),
}));

vi.mock('@/features/games/store/gameStore', () => ({
  useGameStore: (selector: (s: unknown) => unknown) =>
    selector({ idlePlayers: [] }),
}));

vi.mock('@/widgets/SeaBattleGame/ui/SeaBattlePopup', () => ({
  SeaBattlePopup: () => null,
}));

vi.mock('./ChatBubble', () => ({ ChatBubble: () => null }));

import { TablePlayer } from './TablePlayer';

const palette = getVariantStyles('cyberpunk').scene;

interface RenderProps {
  alive?: boolean;
  isCurrentTurn?: boolean;
}

function renderPlayer(props: RenderProps = {}) {
  const { alive = true, isCurrentTurn = false } = props;
  const player: CriticalPlayerTableState = {
    playerId: 'p1',
    alive,
    hand: ['critical_event', 'neutralizer'],
    stash: [],
    markedCards: [],
  };
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <ScenePaletteProvider palette={palette}>
        <TablePlayer
          player={player}
          index={0}
          relativeIndex={0}
          totalPlayers={2}
          currentTurnIndex={isCurrentTurn ? 0 : 1}
          currentUserId={null}
          logs={[]}
          cardVariant="cyberpunk"
          resolveDisplayName={(id, fallback) => fallback}
        />
      </ScenePaletteProvider>
    </TamaguiProvider>,
  );
}

describe('TablePlayer', () => {
  it('renders stable player-card and player-name testids', () => {
    renderPlayer();
    expect(screen.getByTestId('player-card-p1')).toBeInTheDocument();
    expect(screen.getByTestId('player-name-p1')).toBeInTheDocument();
  });

  it('renders turn ring with palette magenta color when it is this opponent turn and alive', () => {
    renderPlayer({ isCurrentTurn: true, alive: true });
    const ring = screen.getByTestId('player-turn-ring');
    const style = ring.getAttribute('style') ?? '';
    // jsdom may normalize fully-opaque rgba() to rgb(); match the rgb triple.
    const rgbTriple =
      palette.opponentTurnRingColor.match(/\d+,\s*\d+,\s*\d+/)?.[0];
    expect(rgbTriple).toBeTruthy();
    expect(style).toMatch(new RegExp(rgbTriple!.replace(/\s+/g, '\\s*')));
    expect(style).toContain(palette.opponentTurnHaloColor);
    expect(style).toMatch(/solid/);
  });

  it('does not render the turn ring when it is not the current turn', () => {
    renderPlayer({ isCurrentTurn: false, alive: true });
    expect(screen.queryByTestId('player-turn-ring')).toBeNull();
  });

  it('renders dashed eliminated ring and label when player is not alive', () => {
    renderPlayer({ alive: false });
    const ring = screen.getByTestId('player-eliminated-ring');
    expect(ring).toBeInTheDocument();
    expect(ring.getAttribute('style') ?? '').toMatch(/dashed/);
    expect(screen.getByTestId('player-eliminated-label-p1')).toHaveTextContent(
      /Eliminated/i,
    );
  });

  it('does not render the eliminated label when player is alive', () => {
    renderPlayer({ alive: true });
    expect(screen.queryByTestId('player-eliminated-label-p1')).toBeNull();
  });
});

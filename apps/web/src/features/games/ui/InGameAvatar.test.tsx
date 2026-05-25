import { render as rtlRender, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TamaguiProvider } from 'tamagui';
import config from '@/shared/config/tamagui.config';
import { InGameAvatar } from './InGameAvatar';
import * as cosmeticsHook from '@/features/shop/hooks/useEquippedCosmetics';
import { useGameStore } from '@/features/games/store/gameStore';
import type { GameRoomSummary } from '@/shared/types/games';

vi.mock('@/features/shop/hooks/useEquippedCosmetics');

const render = (ui: React.ReactElement) =>
  rtlRender(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>,
  );

const allNulls = {
  avatarUrl: null,
  avatarItem: null,
  badgeUrl: null,
  badgeItem: null,
  nameColor: null,
  nameColorItem: null,
  frameColor: null,
  frameItem: null,
  auraColor: null,
  auraItem: null,
  bannerColor: null,
  bannerItem: null,
};

function seedRoom(members: GameRoomSummary['members']) {
  useGameStore.setState({
    room: {
      id: 'room-1',
      gameId: 'critical',
      name: 'r',
      hostId: 'u-1',
      visibility: 'public',
      playerCount: members?.length ?? 0,
      maxPlayers: 4,
      createdAt: new Date().toISOString(),
      status: 'in_progress',
      members,
    } as GameRoomSummary,
  });
}

describe('InGameAvatar', () => {
  beforeEach(() => {
    vi.mocked(cosmeticsHook.useEquippedCosmetics).mockReset();
    useGameStore.setState({ room: null });
  });

  it('resolves equipped ids from the room store and passes them to the resolver', () => {
    const spy = vi
      .mocked(cosmeticsHook.useEquippedCosmetics)
      .mockReturnValue({ ...allNulls, avatarUrl: '/jane.png' });
    seedRoom([
      {
        id: 'u-1',
        displayName: 'Jane',
        isHost: true,
        equippedAvatarId: 'av-1',
        equippedBadgeId: 'bd-1',
      },
    ]);

    render(<InGameAvatar playerId="u-1" name="Jane" data-testid="iga" />);

    expect(spy).toHaveBeenCalledWith({
      equippedAvatarId: 'av-1',
      equippedBadgeId: 'bd-1',
    });
    expect(screen.getByRole('img')).toHaveAttribute('src', '/jane.png');
  });

  it('passes nulls for unknown players (bots, missing member)', () => {
    const spy = vi
      .mocked(cosmeticsHook.useEquippedCosmetics)
      .mockReturnValue(allNulls);
    seedRoom([]);

    render(<InGameAvatar playerId="bot-7" name="Bot 7" />);

    expect(spy).toHaveBeenCalledWith({
      equippedAvatarId: null,
      equippedBadgeId: null,
    });
  });

  it('suppresses cosmetic frame/aura/banner so game state rings stay authoritative', () => {
    vi.mocked(cosmeticsHook.useEquippedCosmetics).mockReturnValue({
      ...allNulls,
      avatarUrl: '/x.png',
      frameColor: '#ff0',
      auraColor: '#0ff',
      bannerColor: '#f0f',
    });
    seedRoom([
      {
        id: 'u-1',
        displayName: 'Jane',
        isHost: true,
        equippedAvatarId: 'av-1',
        equippedBadgeId: null,
        equippedFrameId: 'fr-1',
        equippedAuraId: 'au-1',
        equippedBannerId: 'bn-1',
      },
    ]);

    render(
      <InGameAvatar playerId="u-1" name="Jane" size="md" data-testid="iga" />,
    );

    // PlayerAvatar only paints frame / aura when those props are truthy. Since
    // InGameAvatar passes null for all three, none of those decorations
    // appear in the DOM.
    expect(screen.queryByTestId('iga-frame')).not.toBeInTheDocument();
    expect(screen.queryByTestId('iga-aura')).not.toBeInTheDocument();
    expect(screen.queryByTestId('iga-banner')).not.toBeInTheDocument();
  });
});

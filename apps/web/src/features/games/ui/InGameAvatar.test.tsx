import { render as rtlRender, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InGameAvatar } from './InGameAvatar';
import * as cosmeticsHook from '@/features/shop/hooks/useEquippedCosmetics';
import { useGameStore } from '@/features/games/store/gameStore';
import type { GameRoomSummary } from '@/shared/types/games';
import { useSessionStore } from '@/entities/session/store/sessionStore';

vi.mock('@/features/shop/hooks/useEquippedCosmetics');

const render = (ui: React.ReactElement) => rtlRender(ui);

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
  skinItem: null,
  skinChip: null,
  backgroundItem: null,
  backgroundColor: null,
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
      equippedFrameId: null,
      equippedAuraId: null,
      equippedBackgroundId: null,
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
      equippedFrameId: null,
      equippedAuraId: null,
      equippedBackgroundId: null,
    });
  });

  it('surfaces frame/aura cosmetics in-game but never the chrome-only banner', () => {
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

    expect(screen.getByTestId('iga-frame')).toBeInTheDocument();
    expect(screen.getByTestId('iga-aura')).toBeInTheDocument();
    expect(screen.queryByTestId('iga-banner')).not.toBeInTheDocument();
  });

  it('resolves equipped cosmetics from session tokens when player is self and room is null', () => {
    const spy = vi
      .mocked(cosmeticsHook.useEquippedCosmetics)
      .mockReturnValue({ ...allNulls, avatarUrl: '/self.png' });
    useSessionStore.setState({
      snapshot: {
        userId: 'my-user-id',
        username: 'Me',
        displayName: 'Me',
        email: 'me@example.com',
        role: 'vip',
        accessToken: 'token',
        refreshToken: 'refresh',
        accessTokenExpiresAt: '2099-01-01',
        provider: 'local',
        equippedAvatarId: 'av-self',
        equippedBadgeId: 'bd-self',
        equippedFrameId: 'fr-self',
        equippedAuraId: 'au-self',
        equippedBannerId: null,
        equippedNameColorId: null,
        equippedGameSkinId: null,
      },
    });

    render(
      <InGameAvatar playerId="my-user-id" name="Me" data-testid="iga-self" />,
    );

    expect(spy).toHaveBeenCalledWith({
      equippedAvatarId: 'av-self',
      equippedBadgeId: 'bd-self',
      equippedFrameId: 'fr-self',
      equippedAuraId: 'au-self',
      equippedBackgroundId: null,
    });
    expect(screen.getByRole('img')).toHaveAttribute('src', '/self.png');
  });

  it('renders bot fallback avatar when player is a bot', () => {
    vi.mocked(cosmeticsHook.useEquippedCosmetics).mockReturnValue(allNulls);

    render(
      <InGameAvatar
        playerId="bot-easy"
        name="Easy Bot"
        data-testid="iga-bot"
      />,
    );

    expect(screen.getByTestId('iga-bot-sprite')).toHaveAttribute(
      'data-avatar-url',
      '/shop/avatars/default-01.png',
    );
  });
});

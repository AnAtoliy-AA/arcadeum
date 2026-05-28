'use client';

import { memo } from 'react';
import { PlayerAvatar, type PlayerAvatarSize } from '@arcadeum/ui';
import { useEquippedCosmetics } from '@/features/shop/hooks/useEquippedCosmetics';
import { useGameStore, type GameState } from '@/features/games/store/gameStore';

export interface InGameAvatarProps {
  playerId: string;
  name: string;
  size?: PlayerAvatarSize;
  priority?: boolean;
  'data-testid'?: string;
}

// In-field avatars render the player's equipped disc cosmetics (avatar, badge,
// frame ring, aura/rays halo, background wash) so identity reads the same in
// game as it does in the shop/profile. Banner and name-color stay off: they're
// chrome-only (card/profile) and `md` has no chrome, and the game's own tile
// border carries turn/seat/eliminated state.
export const InGameAvatar = memo(function InGameAvatar({
  playerId,
  name,
  size = 'md',
  priority,
  'data-testid': testId,
}: InGameAvatarProps) {
  const room = useGameStore((s: GameState) => s.room);
  const member = room?.members?.find((m) => m.id === playerId);
  const cosmetics = useEquippedCosmetics({
    equippedAvatarId: member?.equippedAvatarId ?? null,
    equippedBadgeId: member?.equippedBadgeId ?? null,
    equippedFrameId: member?.equippedFrameId ?? null,
    equippedAuraId: member?.equippedAuraId ?? null,
    equippedBackgroundId: member?.equippedBackgroundId ?? null,
  });

  return (
    <PlayerAvatar
      name={name}
      size={size}
      avatarUrl={cosmetics.avatarUrl}
      badgeUrl={cosmetics.badgeUrl}
      frameColor={cosmetics.frameColor}
      auraColor={cosmetics.auraColor}
      backgroundColor={cosmetics.backgroundColor}
      bannerColor={null}
      nameColor={null}
      priority={priority}
      data-testid={testId}
    />
  );
});

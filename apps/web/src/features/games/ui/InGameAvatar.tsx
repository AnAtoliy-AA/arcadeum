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

// In-field avatars deliberately suppress cosmetic frame/aura/banner/name-color
// so they don't compete with the game's own state rings (turn, seat color,
// eliminated). Only the avatar image and equipped badge are shown.
export const InGameAvatar = memo(function InGameAvatar({
  playerId,
  name,
  size = 'icon',
  priority,
  'data-testid': testId,
}: InGameAvatarProps) {
  const room = useGameStore((s: GameState) => s.room);
  const member = room?.members?.find((m) => m.id === playerId);
  const cosmetics = useEquippedCosmetics({
    equippedAvatarId: member?.equippedAvatarId ?? null,
    equippedBadgeId: member?.equippedBadgeId ?? null,
  });

  return (
    <PlayerAvatar
      name={name}
      size={size}
      avatarUrl={cosmetics.avatarUrl}
      badgeUrl={cosmetics.badgeUrl}
      frameColor={null}
      auraColor={null}
      bannerColor={null}
      nameColor={null}
      priority={priority}
      data-testid={testId}
    />
  );
});

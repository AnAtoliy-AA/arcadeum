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
  className?: string;
  'data-testid'?: string;
}

export const InGameAvatar = memo(function InGameAvatar({
  playerId,
  name,
  size = 'md',
  priority,
  className,
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

  const avatar = (
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
      role={member?.role}
      priority={priority}
      data-testid={testId}
    />
  );

  return className ? <div className={className}>{avatar}</div> : avatar;
});

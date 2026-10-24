'use client';

import { memo } from 'react';
import { PlayerAvatar, type PlayerAvatarSize } from '@arcadeum/ui';
import { useEquippedCosmetics } from '@/features/shop/hooks/useEquippedCosmetics';
import { useGameStore, type GameState } from '@/features/games/store/gameStore';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';

export interface InGameAvatarProps {
  playerId: string;
  name: string;
  size?: PlayerAvatarSize;
  priority?: boolean;
  avatarUrl?: string | null;
  fallbackAvatarUrl?: string;
  role?: string | null;
  className?: string;
  'data-testid'?: string;
}

export const InGameAvatar = memo(function InGameAvatar({
  playerId,
  name,
  size = 'md',
  priority,
  avatarUrl,
  fallbackAvatarUrl,
  role,
  className,
  'data-testid': testId,
}: InGameAvatarProps) {
  const room = useGameStore((s: GameState) => s.room);
  const { snapshot } = useSessionTokens();
  const isSelf = !!snapshot.userId && snapshot.userId === playerId;
  const member = room?.members?.find((m) => m.id === playerId);

  const equippedAvatarId =
    member?.equippedAvatarId ?? (isSelf ? snapshot.equippedAvatarId : null);
  const equippedBadgeId =
    member?.equippedBadgeId ?? (isSelf ? snapshot.equippedBadgeId : null);
  const equippedFrameId =
    member?.equippedFrameId ?? (isSelf ? snapshot.equippedFrameId : null);
  const equippedAuraId =
    member?.equippedAuraId ?? (isSelf ? snapshot.equippedAuraId : null);
  const equippedBackgroundId = member?.equippedBackgroundId ?? null;

  const cosmetics = useEquippedCosmetics({
    equippedAvatarId: equippedAvatarId ?? null,
    equippedBadgeId: equippedBadgeId ?? null,
    equippedFrameId: equippedFrameId ?? null,
    equippedAuraId: equippedAuraId ?? null,
    equippedBackgroundId: equippedBackgroundId ?? null,
  });

  const isBot =
    playerId.startsWith('bot') ||
    name.toLowerCase().includes('bot') ||
    name.toLowerCase().includes('ai');
  const isAnonymous = isSelf && !snapshot.accessToken;
  const resolvedFallback =
    fallbackAvatarUrl ??
    (isBot || isAnonymous ? '/shop/avatars/default-01.png' : undefined);

  const effectiveAvatarUrl =
    avatarUrl ?? cosmetics.avatarUrl ?? resolvedFallback ?? null;
  const effectiveRole =
    role ?? member?.role ?? (isSelf ? snapshot.role : undefined);

  const avatar = (
    <PlayerAvatar
      name={name}
      size={size}
      avatarUrl={effectiveAvatarUrl}
      badgeUrl={cosmetics.badgeUrl}
      frameColor={cosmetics.frameColor}
      auraColor={cosmetics.auraColor}
      backgroundColor={cosmetics.backgroundColor}
      bannerColor={null}
      nameColor={null}
      role={effectiveRole}
      priority={priority}
      data-testid={testId}
    />
  );

  return className ? <div className={className}>{avatar}</div> : avatar;
});

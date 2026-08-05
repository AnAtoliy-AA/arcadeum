'use client';

import { Typography } from '@arcadeum/ui';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar';
import { useEquippedCosmetics } from '@/features/shop/hooks/useEquippedCosmetics';
import { nameColorRenderProps } from '@/features/shop/lib/nameColor';
import type { EquippedResolver } from './types';

interface ChatSenderLabelProps {
  senderName: string;
  senderColor?: string;
  senderId?: string | null;
  resolveEquipped?: EquippedResolver;
}

export function ChatSenderLabel({
  senderName,
  senderColor,
  senderId,
  resolveEquipped,
}: ChatSenderLabelProps) {
  const resolved = senderId ? (resolveEquipped?.(senderId) ?? null) : null;
  const { nameColor } = useEquippedCosmetics({
    equippedAvatarId: resolved?.equippedAvatarId,
    equippedBadgeId: resolved?.equippedBadgeId,
    equippedNameColorId: resolved?.equippedNameColorId,
    equippedFrameId: resolved?.equippedFrameId,
    equippedAuraId: resolved?.equippedAuraId,
    equippedBannerId: resolved?.equippedBannerId,
  });
  const nameProps = nameColorRenderProps(nameColor);
  const resolvedSenderColor = nameProps.color ?? senderColor;

  return (
    <span
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
      data-testid="chat-sender-label"
    >
      <EquippedPlayerAvatar
        name={senderName}
        size="icon"
        equippedAvatarId={resolved?.equippedAvatarId ?? null}
        equippedBadgeId={resolved?.equippedBadgeId ?? null}
        equippedNameColorId={resolved?.equippedNameColorId}
        equippedFrameId={resolved?.equippedFrameId}
        equippedAuraId={resolved?.equippedAuraId}
        equippedBannerId={resolved?.equippedBannerId}
      />
      <Typography
        uiSize="xs"
        weight="600"
        color={resolvedSenderColor}
        letterSpacing={0.5}
        textTransform="uppercase"
        style={nameProps.style}
      >
        {senderName}
      </Typography>
    </span>
  );
}

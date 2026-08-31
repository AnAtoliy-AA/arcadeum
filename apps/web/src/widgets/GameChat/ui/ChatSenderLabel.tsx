import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar';
import type { EquippedResolver } from './types';

interface ChatSenderLabelProps {
  senderName: string;
  senderId?: string | null;
  resolveEquipped?: EquippedResolver;
}

export function ChatSenderLabel({
  senderName,
  senderId,
  resolveEquipped,
}: ChatSenderLabelProps) {
  const resolved = senderId ? (resolveEquipped?.(senderId) ?? null) : null;

  return (
    <EquippedPlayerAvatar
      name={senderName}
      size="sm"
      equippedAvatarId={resolved?.equippedAvatarId ?? null}
      equippedBadgeId={resolved?.equippedBadgeId ?? null}
      equippedNameColorId={resolved?.equippedNameColorId}
      equippedFrameId={resolved?.equippedFrameId}
      equippedAuraId={resolved?.equippedAuraId}
      equippedBannerId={resolved?.equippedBannerId}
    />
  );
}

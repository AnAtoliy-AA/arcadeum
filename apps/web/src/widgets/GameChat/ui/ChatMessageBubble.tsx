'use client';

import { useEquippedCosmetics } from '@/features/shop/hooks/useEquippedCosmetics';
import { nameColorRenderProps } from '@/features/shop/lib/nameColor';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar';
import type { ChatScope } from '../store/gameChatStore';

interface ChatMessageBubbleProps {
  senderId?: string | null;
  senderName?: string | null;
  /** Sender's currently-equipped avatar id (from chat message payload). */
  senderEquippedAvatarId?: string | null;
  /** Sender's currently-equipped badge id (from chat message payload). */
  senderEquippedBadgeId?: string | null;
  /** Sender's currently-equipped name-color id (from chat message payload). */
  senderEquippedNameColorId?: string | null;
  /** Sender's currently-equipped frame id (from chat message payload). */
  senderEquippedFrameId?: string | null;
  /** Sender's currently-equipped aura id (from chat message payload). */
  senderEquippedAuraId?: string | null;
  /** Sender's currently-equipped banner id (from chat message payload). */
  senderEquippedBannerId?: string | null;
  message: string;
  type: 'system' | 'action' | 'message';
  scope?: ChatScope;
  isOwn?: boolean;
}

export function ChatMessageBubble({
  senderId,
  senderName,
  senderEquippedAvatarId,
  senderEquippedBadgeId,
  senderEquippedNameColorId,
  senderEquippedFrameId,
  senderEquippedAuraId,
  senderEquippedBannerId,
  message,
  type,
  isOwn,
}: ChatMessageBubbleProps) {
  // The hook resolves the name-color (used in the sender label outside the
  // PlayerAvatar slot). Avatar/badge/frame/aura come through PlayerAvatar.
  const { nameColor } = useEquippedCosmetics({
    equippedAvatarId: senderEquippedAvatarId,
    equippedBadgeId: senderEquippedBadgeId,
    equippedNameColorId: senderEquippedNameColorId,
    equippedFrameId: senderEquippedFrameId,
    equippedAuraId: senderEquippedAuraId,
    equippedBannerId: senderEquippedBannerId,
  });
  const nameColorProps = nameColorRenderProps(nameColor);

  if (type === 'system' || type === 'action') {
    return (
      <div className="flex flex-row items-stretch py-2 px-3 opacity-[0.7]">
        <span className="text-[16px] italic text-[$colorSubtle]">
          {message}
        </span>
      </div>
    );
  }

  const displayName = senderName ?? senderId ?? '?';

  return (
    <div
      className="flex flex-row gap-2 py-2 px-3 items-start"
      style={{ flexDirection: isOwn ? 'row-reverse' : 'row' }}
    >
      <div className="shrink-0">
        <EquippedPlayerAvatar
          name={displayName}
          size="sm"
          equippedAvatarId={senderEquippedAvatarId ?? null}
          equippedBadgeId={senderEquippedBadgeId ?? null}
          equippedNameColorId={senderEquippedNameColorId}
          equippedFrameId={senderEquippedFrameId}
          equippedAuraId={senderEquippedAuraId}
          equippedBannerId={senderEquippedBannerId}
        />
      </div>
      <div className="flex flex-col items-stretch flex-1 gap-1 bg-[rgba(15,23,42,0.8)] rounded-2xl border border-[rgba(99,102,241,0.3)] px-3 py-2">
        {senderName && (
          <div className="flex flex-row items-center gap-2">
            <span
              className="text-[14px] font-semibold uppercase tracking-[0.5px]"
              style={{ color: nameColorProps.color ?? '#a5b4fc' }}
            >
              {senderName}
            </span>
          </div>
        )}
        <span className="text-[18px] text-[var(--color)]">{message}</span>
      </div>
    </div>
  );
}

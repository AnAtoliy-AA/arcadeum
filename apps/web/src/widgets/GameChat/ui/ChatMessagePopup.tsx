'use client';

import { useEffect } from 'react';
import { FloatingBubbleLabel } from '@/features/games/ui/FloatingBubble';

interface ChatMessagePopupProps {
  senderId?: string | null;
  senderName: string;
  senderEquippedAvatarId?: string | null;
  senderEquippedBadgeId?: string | null;
  senderEquippedNameColorId?: string | null;
  senderEquippedFrameId?: string | null;
  senderEquippedAuraId?: string | null;
  senderEquippedBannerId?: string | null;
  message: string;
  visible: boolean;
  onDismiss: () => void;
  isOwn?: boolean;
}

const ACCENT_COLOR = 'rgba(99,102,241,0.9)';

export function ChatMessagePopup({
  senderName,
  senderEquippedAvatarId,
  senderEquippedBadgeId,
  senderEquippedNameColorId,
  senderEquippedFrameId,
  senderEquippedAuraId,
  senderEquippedBannerId,
  message,
  visible,
  onDismiss,
}: ChatMessagePopupProps) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(), 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!visible) return null;

  const label = senderName ? (
    <FloatingBubbleLabel
      senderName={senderName}
      equippedAvatarId={senderEquippedAvatarId}
      equippedBadgeId={senderEquippedBadgeId}
      equippedNameColorId={senderEquippedNameColorId}
      equippedFrameId={senderEquippedFrameId}
      equippedAuraId={senderEquippedAuraId}
      equippedBannerId={senderEquippedBannerId}
      accentColor={ACCENT_COLOR}
    />
  ) : undefined;

  return (
    <div
      onClick={onDismiss}
      data-testid="chat-message-popup"
      className="pointer-events-auto absolute top-6 right-2 z-[10000] flex max-w-[220px] cursor-pointer flex-col items-center gap-1.5 opacity-0 animate-[floatingBubbleFloat_3s_ease-out_forwards] [&_[data-bubble-label]]:animate-[floatingLabelPop_3s_ease-out_forwards]"
    >
      <div className="flex items-center justify-center rounded-2xl border-[1.5px] border-[rgba(99,102,241,0.5)] bg-[rgba(15,5,24,0.88)] px-3.5 py-2 text-center text-[13px] leading-[18px] font-semibold break-words text-white shadow-[0_0_18px_2px_rgba(99,102,241,0.45)]">
        {message}
      </div>
      {label}
    </div>
  );
}

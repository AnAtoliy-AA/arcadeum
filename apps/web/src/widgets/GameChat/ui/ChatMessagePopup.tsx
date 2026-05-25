'use client';

import { ChatMessageBubble } from './ChatMessageBubble';

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

export function ChatMessagePopup({
  senderId,
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
  isOwn,
}: ChatMessagePopupProps) {
  if (!visible) return null;

  return (
    <div
      onClick={onDismiss}
      onAnimationEnd={(e) => {
        e.stopPropagation();
        if (e.animationName === 'popupAutoDismiss') {
          onDismiss();
        }
      }}
      data-testid="chat-message-popup"
      style={{
        cursor: 'pointer',
        maxWidth: 340,
        position: 'absolute',
        top: 24,
        right: 24,
        zIndex: 10000,
        pointerEvents: 'auto',
        animation:
          'popupAutoDismiss var(--popup-dismiss-duration, 5s) forwards',
      }}
    >
      <ChatMessageBubble
        senderId={senderId ?? null}
        senderName={senderName}
        senderEquippedAvatarId={senderEquippedAvatarId ?? null}
        senderEquippedBadgeId={senderEquippedBadgeId ?? null}
        senderEquippedNameColorId={senderEquippedNameColorId ?? null}
        senderEquippedFrameId={senderEquippedFrameId ?? null}
        senderEquippedAuraId={senderEquippedAuraId ?? null}
        senderEquippedBannerId={senderEquippedBannerId ?? null}
        message={message}
        type="message"
        isOwn={isOwn}
      />
    </div>
  );
}

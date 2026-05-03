'use client';

import { ChatMessageBubble } from './ChatMessageBubble';

interface ChatMessagePopupProps {
  senderName: string;
  message: string;
  visible: boolean;
  onDismiss: () => void;
  isOwn?: boolean;
}

export function ChatMessagePopup({
  senderName,
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
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 10000,
        pointerEvents: 'auto',
        animation:
          'popupAutoDismiss var(--popup-dismiss-duration, 5s) forwards',
      }}
    >
      <ChatMessageBubble
        senderName={senderName}
        message={message}
        type="message"
        isOwn={isOwn}
      />
    </div>
  );
}

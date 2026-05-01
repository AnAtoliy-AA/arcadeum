'use client';

import { ChatMessageBubble } from './ChatMessageBubble';

interface ChatMessagePopupProps {
  senderName: string;
  message: string;
  visible: boolean;
  onDismiss: () => void;
}

export function ChatMessagePopup({
  senderName,
  message,
  visible,
  onDismiss,
}: ChatMessagePopupProps) {
  if (!visible) return null;

  return (
    <div
      onClick={onDismiss}
      onAnimationEnd={(e) => {
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
        animation: 'popupAutoDismiss 5s forwards',
      }}
    >
      <ChatMessageBubble
        senderName={senderName}
        message={message}
        type="message"
      />
    </div>
  );
}

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
      style={{ cursor: 'pointer', maxWidth: 340, position: 'relative' }}
    >
      <ChatMessageBubble
        senderName={senderName}
        message={message}
        type="message"
      />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { ChatBubbleContainer } from './styles';

interface ChatBubbleProps {
  message: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const CHAT_BUBBLE_VISIBILITY_MS = 4000;

export function ChatBubble({ message, position = 'top' }: ChatBubbleProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Don't auto-hide in E2E tests to prevent race conditions
    const isPlaywright =
      typeof window !== 'undefined' &&
      (window as unknown as { isPlaywright?: boolean }).isPlaywright;

    if (isPlaywright) return;

    const timer = setTimeout(() => {
      setVisible(false);
    }, CHAT_BUBBLE_VISIBILITY_MS);

    return () => clearTimeout(timer);
  }, [message]);

  return (
    <ChatBubbleContainer
      $visible={visible}
      $position={position}
      data-testid="chat-bubble"
    >
      {message}
    </ChatBubbleContainer>
  );
}

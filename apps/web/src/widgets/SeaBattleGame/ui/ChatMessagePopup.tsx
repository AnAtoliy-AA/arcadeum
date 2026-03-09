'use client';

import React from 'react';
import {
  PopupOverlay,
  PopupCard,
  SenderAvatar,
  PopupContent,
  SenderName,
  MessageText,
  DismissButton,
} from './styles/chatMessagePopup';

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

  const initial = senderName.charAt(0).toUpperCase();

  return (
    <PopupOverlay data-testid="chat-message-popup">
      <PopupCard $visible={visible} onClick={onDismiss}>
        <SenderAvatar>{initial}</SenderAvatar>
        <PopupContent>
          <SenderName>{senderName}</SenderName>
          <MessageText>{message}</MessageText>
        </PopupContent>
        <DismissButton aria-label="dismiss">✕</DismissButton>
      </PopupCard>
    </PopupOverlay>
  );
}

'use client';

import { useRef, useEffect } from 'react';
import { EMOTES, type EmoteId } from './EmotePicker';

const KEYFRAMES_CSS = `
@keyframes chatBubbleFloat {
  0% {
    opacity: 0;
    transform: translateY(140px) translateX(10px) scale(0.4) rotate(-8deg);
  }
  10% {
    opacity: 1;
    transform: translateY(70px) translateX(-15px) scale(1.2) rotate(5deg);
  }
  20% {
    transform: translateY(20px) translateX(8px) scale(0.95) rotate(-3deg);
  }
  30% {
    transform: translateY(0) translateX(0) scale(1) rotate(0deg);
  }
  65% {
    opacity: 1;
    transform: translateY(0) translateX(0) scale(1) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translateY(-140px) translateX(-5px) scale(0.6) rotate(4deg);
  }
}

@keyframes chatLabelPop {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.5);
  }
  15% {
    opacity: 1;
    transform: translateY(-2px) scale(1.15);
  }
  30% {
    transform: translateY(0) scale(1);
  }
  70% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) scale(0.8);
  }
}
`;

let stylesInjected = false;

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
  senderName,
  message,
  visible,
  onDismiss,
}: ChatMessagePopupProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!stylesInjected) {
      const style = document.createElement('style');
      style.textContent = KEYFRAMES_CSS;
      document.head.appendChild(style);
      stylesInjected = true;
    }
    const el = ref.current;
    if (el) {
      el.style.animation = 'chatBubbleFloat 3s ease-out forwards';
      const label = el.querySelector('[data-msg-label]');
      if (label) {
        (label as HTMLElement).style.animation =
          'chatLabelPop 3s ease-out forwards';
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(), 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!visible) return null;

  return (
    <div
      ref={ref}
      onClick={onDismiss}
      data-testid="chat-message-popup"
      style={{
        position: 'absolute',
        top: 24,
        right: 8,
        zIndex: 10000,
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        opacity: 0,
        cursor: 'pointer',
        maxWidth: 220,
      }}
    >
      <div
        style={{
          padding: '8px 14px',
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(15, 5, 24, 0.88)',
          borderWidth: 1.5,
          borderStyle: 'solid',
          borderColor: 'rgba(99, 102, 241, 0.5)',
          boxShadow: '0 0 18px 2px rgba(99, 102, 241, 0.45)',
          fontSize: 13,
          lineHeight: '18px',
          color: '#fff',
          fontWeight: 600,
          textAlign: 'center',
          wordBreak: 'break-word',
        }}
      >
        {message}
      </div>
      {senderName && (
        <div
          data-msg-label=""
          style={{
            color: '#fff',
            fontSize: 12,
            fontWeight: 800,
            textShadow:
              '0 0 8px rgba(99,102,241,0.9), 0 2px 10px rgba(0,0,0,0.8)',
            letterSpacing: 1,
            padding: '3px 10px',
            borderRadius: 8,
            backgroundColor: 'rgba(99, 102, 241, 0.35)',
            whiteSpace: 'nowrap',
            opacity: 0,
          }}
        >
          {senderName}
        </div>
      )}
    </div>
  );
}

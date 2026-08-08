'use client';

import { useRef, useEffect } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.style.animation = 'floatingBubbleFloat 3s ease-out forwards';
      const label = el.querySelector('[data-bubble-label]');
      if (label) {
        (label as HTMLElement).style.animation =
          'floatingLabelPop 3s ease-out forwards';
      }
    }
  }, []);

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
      ref={containerRef}
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
      {label}
    </div>
  );
}

'use client';

import { useRef, useEffect } from 'react';
import { EMOTES, type EmoteId } from '@/widgets/GameChat/ui/EmotePicker';
import { FloatingBubbleLabel } from './FloatingBubble';
import { useActiveEmotes } from './GameWidgetContainer.styles';

interface ActiveEmote {
  id: string;
  emoteId: EmoteId;
}

interface EmoteBubbleProps {
  playerId: string;
  activeEmotes: ActiveEmote[];
  senderName?: string;
}

function findEmoji(emoteId: EmoteId): string {
  return EMOTES.find((e) => e.id === emoteId)?.emoji ?? '❓';
}

const ACCENT_COLOR = 'rgba(236,72,153,0.9)';

export function EmoteBubble({ playerId, activeEmotes, senderName }: EmoteBubbleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const ctx = useActiveEmotes();
  const equipped = ctx.resolveEquipped?.(playerId) ?? null;

  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.style.animation = 'floatingBubbleFloat 2.4s ease-out forwards';
      const label = el.querySelector('[data-bubble-label]');
      if (label) {
        (label as HTMLElement).style.animation =
          'floatingLabelPop 2.4s ease-out forwards';
      }
    }
  }, []);

  const current = activeEmotes.find((e) => e.id === playerId);
  if (!current) return null;

  const label = senderName ? (
    <FloatingBubbleLabel
      senderName={senderName}
      equippedAvatarId={equipped?.equippedAvatarId ?? null}
      equippedBadgeId={equipped?.equippedBadgeId ?? null}
      equippedNameColorId={equipped?.equippedNameColorId}
      equippedFrameId={equipped?.equippedFrameId}
      equippedAuraId={equipped?.equippedAuraId}
      equippedBannerId={equipped?.equippedBannerId}
      accentColor={ACCENT_COLOR}
    />
  ) : undefined;

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: 100,
        right: 24,
        zIndex: 10,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        opacity: 0,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 96,
          height: 96,
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(15, 5, 24, 0.88)',
            borderWidth: 1.5,
            borderStyle: 'solid',
            borderColor: 'rgba(236, 72, 153, 0.5)',
            boxShadow: '0 0 18px 2px rgba(236, 72, 153, 0.45)',
            fontSize: 56,
            lineHeight: '64px',
          }}
        >
          {findEmoji(current.emoteId)}
        </div>
      </div>
      {label}
    </div>
  );
}

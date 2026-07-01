'use client';

import { useRef, useEffect } from 'react';
import { EMOTES, type EmoteId } from '@/widgets/GameChat/ui/EmotePicker';

const EMOTE_LABELS: Record<EmoteId, string> = {
  good_move: 'Nice!',
  lol: 'LOL',
  thinking: 'Hmm...',
  nice: 'GG!',
  unlucky: 'Oof!',
  rip: 'RIP',
  fire: 'Fire!',
  clap: 'Bravo!',
  cry: 'Sad',
  angry: 'Mad',
  rocket: "Let's go!",
  heart: 'Love',
  brain: 'Galaxy Brain',
  skull: 'Dead',
  sweat: 'Close!',
  clown: 'Clown',
};

const KEYFRAMES_CSS = `
@keyframes emoteFloat {
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

@keyframes labelPop {
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

interface ActiveEmote {
  id: string;
  emoteId: EmoteId;
}

interface EmoteBubbleProps {
  playerId: string;
  activeEmotes: ActiveEmote[];
}

function findEmoji(emoteId: EmoteId): string {
  return EMOTES.find((e) => e.id === emoteId)?.emoji ?? '❓';
}

let stylesInjected = false;

export function EmoteBubble({ playerId, activeEmotes }: EmoteBubbleProps) {
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
      el.style.animation = 'emoteFloat 2.4s ease-out forwards';
      const label = el.querySelector('[data-emote-label]');
      if (label) {
        (label as HTMLElement).style.animation =
          'labelPop 2.4s ease-out forwards';
      }
    }
  }, []);

  const current = activeEmotes.find((e) => e.id === playerId);
  if (!current) return null;

  const label = EMOTE_LABELS[current.emoteId] ?? '';

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: '50%',
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
          width: 72,
          height: 72,
          borderRadius: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(15, 5, 24, 0.88)',
          borderWidth: 1.5,
          borderStyle: 'solid',
          borderColor: 'rgba(236, 72, 153, 0.5)',
          boxShadow: '0 0 18px 2px rgba(236, 72, 153, 0.45)',
          fontSize: 42,
          lineHeight: '48px',
        }}
      >
        {findEmoji(current.emoteId)}
      </div>
      {label && (
        <div
          data-emote-label=""
          style={{
            color: '#fff',
            fontSize: 16,
            fontWeight: 800,
            textShadow:
              '0 0 8px rgba(236,72,153,0.9), 0 2px 10px rgba(0,0,0,0.8)',
            letterSpacing: 1,
            padding: '3px 10px',
            borderRadius: 8,
            backgroundColor: 'rgba(236, 72, 153, 0.35)',
            whiteSpace: 'nowrap',
            opacity: 0,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

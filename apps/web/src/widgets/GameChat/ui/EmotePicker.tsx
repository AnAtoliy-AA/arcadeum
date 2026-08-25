'use client';

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type MouseEventHandler,
  type ReactNode,
} from 'react';

import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';

export const EMOTES = [
  { id: 'good_move', emoji: '👍' },
  { id: 'lol', emoji: '😂' },
  { id: 'thinking', emoji: '🤔' },
  { id: 'nice', emoji: '🎉' },
  { id: 'unlucky', emoji: '😤' },
  { id: 'rip', emoji: '💀' },
  { id: 'fire', emoji: '🔥' },
  { id: 'clap', emoji: '👏' },
  { id: 'cry', emoji: '😢' },
  { id: 'angry', emoji: '😡' },
  { id: 'rocket', emoji: '🚀' },
  { id: 'heart', emoji: '❤️' },
  { id: 'brain', emoji: '🧠' },
  { id: 'skull', emoji: '☠️' },
  { id: 'sweat', emoji: '😅' },
  { id: 'clown', emoji: '🤡' },
] as const;

export type EmoteId = (typeof EMOTES)[number]['id'];

const RATE_LIMIT_MS = 2000;

function PickerShell({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-row items-stretch gap-[4px] p-[6px] rounded-[14px] border border-[var(--glassBorder)] bg-[var(--glassBg)] flex-wrap justify-center">
      {children}
    </div>
  );
}

function EmoteBtn({
  opacity,
  onClick,
  ariaLabel,
  children,
}: {
  opacity?: number;
  onClick: MouseEventHandler<HTMLDivElement>;
  ariaLabel: string;
  children: ReactNode;
}) {
  return (
    <div
      className="flex flex-row items-center justify-center w-[40px] h-[40px] rounded-[10px] cursor-pointer transition-all duration-150 ease-out hover:bg-[var(--backgroundHover)] active:bg-[var(--backgroundPress)] active:scale-[0.92]"
      style={opacity !== undefined ? { opacity } : undefined}
      role="button"
      tabIndex={0}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}

function EmoteLabel({ children }: { children?: ReactNode }) {
  return (
    <span className="text-[9px] font-semibold text-[rgba(180,180,200,0.7)] text-center line-clamp-1">
      {children}
    </span>
  );
}

interface EmotePickerProps {
  onEmote: (emoteId: EmoteId) => void;
  disabled?: boolean;
}

export function EmotePicker({ onEmote, disabled }: EmotePickerProps) {
  const [cooldown, setCooldown] = useState(false);
  const lastSentRef = useRef(0);
  const { t } = useTranslation();

  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setCooldown(false), RATE_LIMIT_MS);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleEmote = useCallback(
    (id: EmoteId) => {
      if (disabled || cooldown) return;
      const now = Date.now();
      if (now - lastSentRef.current < RATE_LIMIT_MS) return;
      lastSentRef.current = now;
      setCooldown(true);
      onEmote(id);
    },
    [onEmote, cooldown, disabled],
  );

  return (
    <PickerShell>
      {EMOTES.map((e) => (
        <div className="flex flex-col items-center gap-2" key={e.id}>
          <EmoteBtn
            onClick={() => handleEmote(e.id)}
            opacity={cooldown ? 0.5 : 1}
            ariaLabel={t(`games.emotes.${e.id}` as TranslationKey)}
          >
            <span className="text-[20px]">{e.emoji}</span>
          </EmoteBtn>
          <EmoteLabel>{t(`games.emotes.${e.id}` as TranslationKey)}</EmoteLabel>
        </div>
      ))}
    </PickerShell>
  );
}

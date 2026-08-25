'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

import { cx } from '@arcadeum/ui/utils/cx';
import { EMOTES, type EmoteId } from '@/widgets/GameChat/ui/EmotePicker';
import type { TranslationKey } from '@/shared/lib/useTranslation';

// ARC-926: fixed, compact reaction set for spectators — a subset of the
// full EmotePicker catalog, filtered by id (never redefined).
const SPECTATOR_REACTION_IDS = [
  'fire',
  'clap',
  'heart',
  'lol',
  'good_move',
  'rip',
] as const satisfies readonly EmoteId[];

const RATE_LIMIT_MS = 2000;

export interface SpectatorReactionsLabels {
  /** Accessible label for the bar itself ("React"). */
  reactionsLabel: string;
  /** Localized emote names keyed by EmoteId. */
  emotes: Partial<Record<EmoteId, string>>;
}

interface SpectatorReactionsBarProps {
  sendEmote: (emoteId: EmoteId) => void;
  disabled?: boolean;
  labels: SpectatorReactionsLabels;
}

export function SpectatorReactionsBar({
  sendEmote,
  disabled,
  labels,
}: SpectatorReactionsBarProps) {
  const [cooldown, setCooldown] = useState(false);
  const lastSentRef = useRef(0);

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
      sendEmote(id);
    },
    [sendEmote, cooldown, disabled],
  );

  return (
    <div
      role="toolbar"
      aria-label={labels.reactionsLabel}
      title={labels.reactionsLabel}
      data-testid="spectator-reactions-bar"
      className={cx(
        'flex flex-row items-center gap-1 rounded-full border border-[var(--glassBorder)] bg-[var(--glassBg)] px-2 py-1',
      )}
    >
      {SPECTATOR_REACTION_IDS.map((id) => {
        const entry = EMOTES.find((e) => e.id === id);
        if (!entry) return null;
        return (
          <button
            key={id}
            type="button"
            onClick={() => handleEmote(id)}
            aria-label={labels.emotes[id] ?? id}
            title={labels.emotes[id] ?? id}
            disabled={disabled || cooldown}
            data-testid={`spectator-reaction-${id}`}
            className={cx(
              'flex h-8 w-8 items-center justify-center rounded-full text-lg transition-all duration-150 ease-out',
              'hover:bg-[var(--backgroundHover)] active:scale-[0.92]',
              (disabled || cooldown) && 'cursor-not-allowed opacity-50',
            )}
          >
            <span aria-hidden="true">{entry.emoji}</span>
          </button>
        );
      })}
    </div>
  );
}

export function buildSpectatorReactionsLabels(
  t: (key: TranslationKey, params?: Record<string, string | number>) => string,
): SpectatorReactionsLabels {
  const emotes: Partial<Record<EmoteId, string>> = {};
  for (const id of SPECTATOR_REACTION_IDS) {
    emotes[id] = t(`games.emotes.${id}` as TranslationKey);
  }
  return { reactionsLabel: t('games.spectator.reactionsLabel'), emotes };
}

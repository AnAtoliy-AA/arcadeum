'use client';

import { useState, useCallback, useRef } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/i18n/useTranslation';
import type { EmoteId } from '@/widgets/GameChat/ui/EmotePicker';

export const SPECTATOR_REACTIONS: readonly { id: EmoteId; emoji: string }[] = [
  { id: 'fire', emoji: '🔥' },
  { id: 'clap', emoji: '👏' },
  { id: 'nice', emoji: '🎉' },
  { id: 'heart', emoji: '❤️' },
  { id: 'thinking', emoji: '🤔' },
  { id: 'rip', emoji: '💀' },
  { id: 'lol', emoji: '😂' },
  { id: 'good_move', emoji: '👍' },
] as const;

export type SpectatorReactionId = (typeof SPECTATOR_REACTIONS)[number]['id'];

interface SpectatorReactionsProps {
  onEmote: (emoteId: EmoteId) => void;
  className?: string;
}

export function SpectatorReactions({
  onEmote,
  className,
}: SpectatorReactionsProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const lastEmoteTimeRef = useRef(0);
  const { t } = useTranslation();

  const handleEmoteClick = useCallback(
    (id: EmoteId) => {
      const now = Date.now();
      if (now - lastEmoteTimeRef.current < 600) return;
      lastEmoteTimeRef.current = now;

      setActiveReaction(id);
      setTimeout(() => {
        setActiveReaction(null);
      }, 400);

      onEmote(id);
    },
    [onEmote],
  );

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  return (
    <div
      data-testid="spectator-reactions-dock"
      className={cx(
        'absolute bottom-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 p-1 rounded-full bg-[var(--glassBg)] border border-[var(--glassBorder)] backdrop-blur-lg shadow-xl transition-all duration-200 select-none',
        className,
      )}
    >
      <button
        type="button"
        onClick={toggleCollapsed}
        data-testid="spectator-reactions-toggle"
        aria-label={
          collapsed
            ? t('games.spectator.reactionsLabel') || 'Show Reactions'
            : 'Collapse'
        }
        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-[var(--color)] hover:bg-[var(--glassBgHover)] active:scale-95 transition-transform"
      >
        <span className="text-sm">👁️</span>
        <span className="text-[11px] uppercase tracking-wider hidden sm:inline">
          {t('games.spectator.reactionsLabel') || 'React'}
        </span>
      </button>

      {!collapsed && (
        <div className="flex items-center gap-1 pr-1">
          {SPECTATOR_REACTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              data-testid={`spectator-reaction-${item.id}`}
              onClick={() => handleEmoteClick(item.id)}
              aria-label={item.id}
              className={cx(
                'flex items-center justify-center w-8 h-8 rounded-full text-lg hover:scale-125 hover:bg-[var(--glassBgHover)] active:scale-90 transition-all duration-150',
                activeReaction === item.id
                  ? 'scale-125 bg-[var(--glassBgHover)]'
                  : '',
              )}
            >
              {item.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

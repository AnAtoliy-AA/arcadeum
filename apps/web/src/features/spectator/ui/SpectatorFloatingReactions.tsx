'use client';

import { memo } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { EMOTES } from '@/widgets/GameChat/ui/EmotePicker';
import type { ActiveEmote } from '@/features/games/ui/GameWidgetContainer.styles';

const LANE_CLASSES = [
  'left-[12%]',
  'left-[28%]',
  'left-[44%]',
  'left-[60%]',
  'left-[76%]',
  'left-[88%]',
];

function getEmoji(emoteId: string): string {
  return EMOTES.find((e) => e.id === emoteId)?.emoji ?? '✨';
}

interface SpectatorFloatingReactionsProps {
  emotes: ActiveEmote[];
  resolveDisplayName?: (id?: string, fallback?: string) => string | undefined;
}

export const SpectatorFloatingReactions = memo(
  function SpectatorFloatingReactions({
    emotes,
    resolveDisplayName,
  }: SpectatorFloatingReactionsProps) {
    if (!emotes || emotes.length === 0) return null;

    return (
      <div
        data-testid="spectator-floating-reactions-layer"
        className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
      >
        {emotes.map((emote) => {
          const laneIndex =
            typeof emote.laneIndex === 'number' ? emote.laneIndex % 6 : 2;
          const laneClass = LANE_CLASSES[laneIndex];
          const senderName = resolveDisplayName?.(emote.userId);

          return (
            <div
              key={emote.key}
              data-testid="spectator-floating-reaction"
              data-emote-id={emote.emoteId}
              className={cx(
                'pointer-events-none absolute bottom-12 flex flex-col items-center gap-1 opacity-0 animate-spectator-float',
                laneClass,
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--glassBorderStrong)] bg-[var(--glassBg)] text-2xl shadow-xl backdrop-blur-md">
                {getEmoji(emote.emoteId)}
              </div>
              {senderName && (
                <div className="px-2 py-0.5 rounded-full text-[10px] font-extrabold text-[var(--color)] bg-[var(--glassBg)] border border-[var(--glassBorder)] shadow-md truncate max-w-[100px]">
                  {senderName}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  },
);

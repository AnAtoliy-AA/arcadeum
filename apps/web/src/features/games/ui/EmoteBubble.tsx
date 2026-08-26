'use client';

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

export function EmoteBubble({
  playerId,
  activeEmotes,
  senderName,
}: EmoteBubbleProps) {
  const ctx = useActiveEmotes();
  const equipped = ctx.resolveEquipped?.(playerId) ?? null;

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
    <div className="pointer-events-none absolute top-[100px] right-6 z-10 flex flex-col items-center gap-1.5 opacity-0 animate-[floatingBubbleFloat_2.4s_ease-out_forwards] [&_[data-bubble-label]]:animate-[floatingLabelPop_2.4s_ease-out_forwards]">
      <div className="relative h-24 w-24">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-[1.5px] border-[rgba(236,72,153,0.5)] bg-[rgba(15,5,24,0.88)] text-[56px] leading-[64px] shadow-[0_0_18px_2px_rgba(236,72,153,0.45)]">
          {findEmoji(current.emoteId)}
        </div>
      </div>
      {label}
    </div>
  );
}

'use client';

import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar';

interface FloatingBubbleLabelProps {
  senderName: string;
  equippedAvatarId?: string | null;
  equippedBadgeId?: string | null;
  equippedNameColorId?: string | null;
  equippedFrameId?: string | null;
  equippedAuraId?: string | null;
  equippedBannerId?: string | null;
  accentColor?: string;
}

export function FloatingBubbleLabel({
  senderName,
  equippedAvatarId,
  equippedBadgeId,
  equippedNameColorId,
  equippedFrameId,
  equippedAuraId,
  equippedBannerId,
}: FloatingBubbleLabelProps) {
  return (
    <div
      data-bubble-label=""
      className="flex items-center gap-[5px] rounded-lg px-2.5 py-[3px] text-xs font-extrabold tracking-[1px] whitespace-nowrap text-white opacity-0 bg-[rgba(236,72,153,0.35)] shadow-[0_0_8px_rgba(236,72,153,0.9),0_2px_10px_rgba(0,0,0,0.8)]"
    >
      <span className="inline-flex scale-[0.7] origin-center">
        <EquippedPlayerAvatar
          name={senderName}
          size="icon"
          equippedAvatarId={equippedAvatarId ?? null}
          equippedBadgeId={equippedBadgeId ?? null}
          equippedNameColorId={equippedNameColorId}
          equippedFrameId={equippedFrameId}
          equippedAuraId={equippedAuraId}
          equippedBannerId={equippedBannerId}
        />
      </span>
      {senderName}
    </div>
  );
}

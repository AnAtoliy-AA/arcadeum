'use client';

import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar';

const FLOAT_KEYFRAMES_CSS = `
@keyframes floatingBubbleFloat {
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

@keyframes floatingLabelPop {
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

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = FLOAT_KEYFRAMES_CSS;
  document.head.appendChild(style);
}

interface FloatingBubbleLabelProps {
  senderName: string;
  equippedAvatarId?: string | null;
  equippedBadgeId?: string | null;
  equippedNameColorId?: string | null;
  equippedFrameId?: string | null;
  equippedAuraId?: string | null;
  equippedBannerId?: string | null;
  accentColor: string;
}

export function FloatingBubbleLabel({
  senderName,
  equippedAvatarId,
  equippedBadgeId,
  equippedNameColorId,
  equippedFrameId,
  equippedAuraId,
  equippedBannerId,
  accentColor,
}: FloatingBubbleLabelProps) {
  const bgColor = accentColor.replace('0.9', '0.35').replace('0.8', '0.3');

  return (
    <div
      data-bubble-label=""
      className="flex items-center gap-[5px] rounded-lg px-2.5 py-[3px] text-xs font-extrabold tracking-[1px] whitespace-nowrap text-white opacity-0"
      style={{
        backgroundColor: bgColor,
        textShadow: `0 0 8px ${accentColor}, 0 2px 10px rgba(0,0,0,0.8)`,
      }}
    >
      <span
        className="inline-flex scale-[0.7]"
        style={{ transformOrigin: 'center' }}
      >
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

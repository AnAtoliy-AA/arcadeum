'use client';

import { resolveThemeColor } from '@/shared/lib/theme-tokens';

interface TurnBadgeProps {
  isYourTurn: boolean;
  text: string;
}

export function TurnBadge({ isYourTurn, text }: TurnBadgeProps) {
  return (
    <div
      className={`flex flex-row items-center gap-2 px-3 py-2 rounded-[20px] border ${isYourTurn ? 'sb-turn-pulse' : undefined}`}
      style={{
        backgroundColor: resolveThemeColor(
          isYourTurn ? '$successBgSoft' : 'rgba(255, 255, 255, 0.06)',
        ),
        borderColor: resolveThemeColor(
          isYourTurn ? '$successBorder' : 'rgba(255, 255, 255, 0.1)',
        ),
      }}
    >
      <div
        className={`flex flex-col items-stretch w-[7px] h-[7px] rounded-[100px] ${isYourTurn ? 'sb-dot-blink' : undefined}`}
        style={{
          backgroundColor: resolveThemeColor(
            isYourTurn ? '$success' : '$color',
          ),
          opacity: isYourTurn ? 1 : 0.3,
        }}
      />
      <span
        className="text-[11px] font-semibold tracking-[0.8px]"
        style={{
          color: resolveThemeColor(isYourTurn ? '$success' : '$color'),
          opacity: isYourTurn ? 1 : 0.5,
        }}
      >
        {text}
      </span>
    </div>
  );
}

import { Progress as TamaguiProgress, YStack, XStack, Text, Circle } from 'tamagui';
import { memo } from 'react';

export type ProgressBarProps = {
  value: number;
  height?: number;
  color?: string;
  showLabel?: boolean;
};

export const ProgressBar = memo(function ProgressBar({
  value,
  height = 8,
  color = '$primary',
  showLabel = false,
}: ProgressBarProps) {
  return (
    <YStack width="100%" gap="$2">
      <TamaguiProgress value={value} height={height} backgroundColor="$borderColor">
        <TamaguiProgress.Indicator backgroundColor={color} />
      </TamaguiProgress>
      {showLabel && (
        <Text fontSize="$2" textAlign="right">{Math.round(value)}%</Text>
      )}
    </YStack>
  );
});

export type ProgressCircleProps = {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showLabel?: boolean;
  animate?: boolean;
  suffix?: string;
};

export const ProgressCircle = memo(function ProgressCircle({
  value,
  size = 80,
  strokeWidth = 8,
  color = '$primary',
  showLabel = true,
  suffix = '%',
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <YStack width={size} height={size} alignItems="center" justifyContent="center" position="relative">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="$neutralBorder"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ color: 'var(--primary)', transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <YStack position="absolute" inset={0} alignItems="center" justifyContent="center">
        {showLabel && (
          <Text fontWeight="700" fontSize="$4">{Math.round(value)}{suffix}</Text>
        )}
      </YStack>
    </YStack>
  );
});
export type WinRateBadgeProps = {
  wins: number;
  losses: number;
  size?: 'sm' | 'md' | 'lg';
  showStats?: boolean;
};

const WIN_RATE_SIZE_MAP = { sm: 60, md: 80, lg: 100 } as const;

export const WinRateBadge = memo(function WinRateBadge({ wins, losses, size = 'md', showStats = true }: WinRateBadgeProps) {
  const total = wins + losses;
  const winRate = total > 0 ? (wins / total) * 100 : 0;

  return (
    <XStack gap="$4" alignItems="center">
      <ProgressCircle value={winRate} size={WIN_RATE_SIZE_MAP[size]} />
      {showStats && (
        <YStack>
          <XStack gap="$2" alignItems="center">
            <Circle size={8} backgroundColor="$success" />
            <Text fontSize="$2" fontWeight="600">Wins: {wins}</Text>
          </XStack>
          <XStack gap="$2" alignItems="center">
            <Circle size={8} backgroundColor="$danger" />
            <Text fontSize="$2" fontWeight="600">Losses: {losses}</Text>
          </XStack>
        </YStack>
      )}
    </XStack>
  );
});

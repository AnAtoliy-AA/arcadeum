import React from 'react';
import styled, { css, keyframes } from 'styled-components';

// Progress color constants
export const PROGRESS_COLORS = {
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
} as const;

// Get color based on value thresholds
export const getProgressColor = (value: number): string => {
  if (value >= 70) return PROGRESS_COLORS.success;
  if (value >= 40) return PROGRESS_COLORS.warning;
  return PROGRESS_COLORS.danger;
};
export interface ProgressCircleProps {
  /** Percentage value (0-100) */
  value: number;
  /** Size of the circle in pixels */
  size?: number;
  /** Stroke width in pixels */
  strokeWidth?: number;
  /** Show percentage text inside */
  showLabel?: boolean;
  /** Color of the progress */
  color?: string;
  /** Background circle color */
  trackColor?: string;
  /** Animate the progress */
  animate?: boolean;
  /** Label suffix (default: %) */
  suffix?: string;
  /** Custom className */
  className?: string;
}

const fillAnimation = keyframes`
  from {
    stroke-dashoffset: 283;
  }
`;

const CircleContainer = styled.div<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const SVG = styled.svg`
  transform: rotate(-90deg);
`;

const TrackCircle = styled.circle<{ $color: string }>`
  fill: none;
  stroke: ${({ $color }) => $color};
`;

const ProgressCirclePath = styled.circle<{
  $color: string;
  $dashOffset: number;
  $animate: boolean;
}>`
  fill: none;
  stroke: ${({ $color }) => $color};
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease-out;
  ${({ $animate, $dashOffset }) =>
    $animate &&
    css`
      animation: ${fillAnimation} 1s ease-out forwards;
      stroke-dashoffset: ${$dashOffset};
    `}
`;

const Label = styled.div<{ $size: number }>`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: ${({ $size }) => Math.max($size / 3.5, 12)}px;
  color: ${({ theme }) => theme.text.primary};
`;

const Suffix = styled.span<{ $size: number }>`
  font-size: ${({ $size }) => Math.max($size / 5, 10)}px;
  font-weight: 500;
  opacity: 0.7;
`;

export function ProgressCircle({
  value,
  size = 80,
  strokeWidth = 8,
  showLabel = true,
  color,
  trackColor,
  animate = true,
  suffix = '%',
  className,
}: ProgressCircleProps) {
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const dashOffset = circumference - (normalizedValue / 100) * circumference;

  // Default colors based on value
  const progressColor = color || getProgressColor(normalizedValue);

  return (
    <CircleContainer $size={size} className={className}>
      <SVG width={size} height={size}>
        <TrackCircle
          $color={trackColor || 'rgba(128, 128, 128, 0.2)'}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <ProgressCirclePath
          $color={progressColor}
          $dashOffset={dashOffset}
          $animate={animate}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={animate ? undefined : dashOffset}
        />
      </SVG>
      {showLabel && (
        <Label $size={size}>
          <span>{Math.round(normalizedValue)}</span>
          <Suffix $size={size}>{suffix}</Suffix>
        </Label>
      )}
    </CircleContainer>
  );
}

// Progress Bar Component
export interface ProgressBarProps {
  /** Percentage value (0-100) */
  value: number;
  /** Height of the bar in pixels */
  height?: number;
  /** Color of the progress */
  color?: string;
  /** Background track color */
  trackColor?: string;
  /** Show percentage label inside bar (requires height >= 16) */
  showLabel?: boolean;
  /** Show percentage label next to bar with matching color */
  showInlineLabel?: boolean;
  /** Animate the progress */
  animate?: boolean;
  /** Custom className */
  className?: string;
}

const BarContainer = styled.div<{ $height: number }>`
  width: 100%;
  height: ${({ $height }) => $height}px;
  background: ${({ theme }) => theme.surfaces.card.border};
  border-radius: ${({ $height }) => $height / 2}px;
  overflow: hidden;
  position: relative;
`;

const BarProgress = styled.div<{
  $width: number;
  $color: string;
  $animate: boolean;
}>`
  height: 100%;
  width: ${({ $width }) => $width}%;
  background: ${({ $color }) => $color};
  border-radius: inherit;
  transition: ${({ $animate }) => ($animate ? 'width 0.5s ease-out' : 'none')};
`;

const BarLabel = styled.div`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

const InlineLabelWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
`;

const InlineLabel = styled.span<{ $color: string }>`
  font-size: 0.875rem;
  font-weight: 600;
  min-width: 48px;
  text-align: right;
  color: ${({ $color }) => $color};
`;

export function ProgressBar({
  value,
  height = 8,
  color,
  trackColor,
  showLabel = false,
  showInlineLabel = false,
  animate = true,
  className,
}: ProgressBarProps) {
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const progressColor = color || getProgressColor(normalizedValue);

  const bar = (
    <BarContainer
      $height={height}
      className={!showInlineLabel ? className : undefined}
      style={trackColor ? { background: trackColor } : undefined}
    >
      <BarProgress
        $width={normalizedValue}
        $color={progressColor}
        $animate={animate}
      />
      {showLabel && height >= 16 && (
        <BarLabel>{Math.round(normalizedValue)}%</BarLabel>
      )}
    </BarContainer>
  );

  if (showInlineLabel) {
    return (
      <InlineLabelWrapper className={className}>
        {bar}
        <InlineLabel $color={progressColor}>
          {normalizedValue.toFixed(1)}%
        </InlineLabel>
      </InlineLabelWrapper>
    );
  }

  return bar;
}

// Win Rate Badge - combines circle with context
export interface WinRateBadgeProps {
  wins: number;
  losses: number;
  size?: 'sm' | 'md' | 'lg';
  showStats?: boolean;
  className?: string;
}

const BadgeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const StatRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
`;

const StatDot = styled.div<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

const StatLabel = styled.span`
  color: ${({ theme }) => theme.text.secondary};
`;

const StatValue = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

export function WinRateBadge({
  wins,
  losses,
  size = 'md',
  showStats = true,
  className,
}: WinRateBadgeProps) {
  const total = wins + losses;
  const winRate = total > 0 ? (wins / total) * 100 : 0;

  const sizeMap = { sm: 60, md: 80, lg: 100 };
  const circleSize = sizeMap[size];

  return (
    <BadgeContainer className={className}>
      <ProgressCircle
        value={winRate}
        size={circleSize}
        strokeWidth={size === 'sm' ? 6 : size === 'md' ? 8 : 10}
      />
      {showStats && (
        <StatsColumn>
          <StatRow>
            <StatDot $color="#10b981" />
            <StatLabel>Wins</StatLabel>
            <StatValue>{wins}</StatValue>
          </StatRow>
          <StatRow>
            <StatDot $color="#ef4444" />
            <StatLabel>Losses</StatLabel>
            <StatValue>{losses}</StatValue>
          </StatRow>
        </StatsColumn>
      )}
    </BadgeContainer>
  );
}

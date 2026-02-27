import styled, { keyframes } from 'styled-components';

const drift = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
`;

const Badge = styled.span<{ $variant?: 'idle' | 'offline' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.1rem 0.35rem;
  border-radius: 6px;
  line-height: 1;
  background: ${({ $variant }) =>
    $variant === 'offline'
      ? 'rgba(239, 68, 68, 0.25)'
      : 'rgba(251, 191, 36, 0.2)'};
  color: ${({ $variant }) => ($variant === 'offline' ? '#fca5a5' : '#fbbf24')};
  border: 1px solid
    ${({ $variant }) =>
      $variant === 'offline'
        ? 'rgba(239, 68, 68, 0.4)'
        : 'rgba(251, 191, 36, 0.35)'};
  animation: ${drift} 2.5s ease-in-out infinite;
  white-space: nowrap;
`;

export interface IdleBadgeProps {
  variant?: 'idle' | 'offline';
  label?: string;
}

export function IdleBadge({ variant = 'idle', label }: IdleBadgeProps) {
  const emoji = variant === 'offline' ? '🔴' : '💤';
  const defaultLabel = variant === 'offline' ? 'Offline' : 'Idle';
  return (
    <Badge $variant={variant} data-testid="idle-badge">
      {emoji} {label || defaultLabel}
    </Badge>
  );
}

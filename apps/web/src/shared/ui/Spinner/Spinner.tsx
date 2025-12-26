import styled, { keyframes } from 'styled-components';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
`;

const sizeMap = {
  sm: { width: '20px', borderWidth: '2px' },
  md: { width: '36px', borderWidth: '3px' },
  lg: { width: '48px', borderWidth: '4px' },
};

const StyledSpinner = styled.div<{ $size: SpinnerSize }>`
  width: ${({ $size }) => sizeMap[$size].width};
  height: ${({ $size }) => sizeMap[$size].width};
  border: ${({ $size }) => sizeMap[$size].borderWidth} solid
    ${({ theme }) => theme.surfaces.card.border}40;
  border-top-color: ${({ theme }) => theme.buttons.primary.gradientStart};
  border-right-color: ${({ theme }) => theme.buttons.primary.gradientStart}80;
  border-radius: 50%;
  animation:
    ${spin} 0.8s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite,
    ${pulse} 1.5s ease-in-out infinite;
  box-shadow: 0 0 20px ${({ theme }) => theme.buttons.primary.gradientStart}20;
`;

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <StyledSpinner
      $size={size}
      className={className}
      role="status"
      aria-label="Loading"
    />
  );
}

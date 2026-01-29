import styled, { keyframes, css } from 'styled-components';
import { ReactNode, HTMLAttributes } from 'react';

export type PageTitleSize = 'sm' | 'md' | 'lg' | 'xl';

export interface PageTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  size?: PageTitleSize;
  gradient?: boolean;
  animated?: boolean;
  children: ReactNode;
}

const sizeMap = {
  sm: { fontSize: '1.5rem', lineHeight: '1.3' },
  md: { fontSize: '2rem', lineHeight: '1.25' },
  lg: { fontSize: '2.5rem', lineHeight: '1.2' },
  xl: { fontSize: '3.5rem', lineHeight: '1.1' },
};

const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const fadeSlideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

interface StyledTitleProps {
  $size: PageTitleSize;
  $gradient: boolean;
  $animated: boolean;
}

const StyledTitle = styled.h1<StyledTitleProps>`
  margin: 0;
  font-size: ${({ $size }) => sizeMap[$size].fontSize};
  line-height: ${({ $size }) => sizeMap[$size].lineHeight};
  font-weight: 800;
  color: ${({ theme }) => theme.text.primary};
  letter-spacing: -0.03em;
  animation: ${fadeSlideIn} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);

  ${({ $gradient, $animated, theme }) =>
    $gradient &&
    `
    background: linear-gradient(
      135deg,
      ${theme.text.primary} 0%,
      ${theme.buttons.primary.gradientStart} 50%,
      ${theme.text.primary} 100%
    );
    background-size: ${$animated ? '200% 100%' : '100% 100%'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    ${({ $animated }: StyledTitleProps) =>
      $animated &&
      css`
        animation:
          ${fadeSlideIn} 0.5s ease-out,
          ${gradientShift} 6s ease-in-out infinite;
      `}
  `}

  @media (max-width: 768px) {
    font-size: calc(${({ $size }) => sizeMap[$size].fontSize} * 0.75);
  }
`;

export function PageTitle({
  size = 'lg',
  gradient = false,
  animated = false,
  children,
  ...props
}: PageTitleProps) {
  return (
    <StyledTitle
      $size={size}
      $gradient={gradient}
      $animated={animated}
      {...props}
    >
      {children}
    </StyledTitle>
  );
}

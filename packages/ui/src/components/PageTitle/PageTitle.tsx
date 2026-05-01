'use client';
import { H1, styled } from 'tamagui';
import { memo } from 'react';
import type { ReactNode, ReactElement } from 'react';
import './PageTitle.css';

export type PageTitleSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeMap = {
  sm: '$4',
  md: '$6',
  lg: '$8',
  xl: '$9',
} as const;

const StyledTitle = styled(H1, {
  name: 'PageTitle',
  margin: 0,
  fontWeight: '800',
  letterSpacing: -0.5,
  overflow: 'visible',
  color: '$color',
  lineHeight: 1.2,

  variants: {
    gradient: {
      true: {
        color: 'transparent',
        backgroundClip: 'text',
        backgroundSize: '200% 200%',
        backgroundImage: 'linear-gradient(135deg, var(--color, #ecefee) 0%, var(--primary, #0369a1) 100%)',
      },
    },
  } as const,
});

export type PageTitleProps = {
  size?: PageTitleSize;
  gradient?: boolean;
  children: ReactNode;
};

export const PageTitle = memo(function PageTitle({
  size = 'lg',
  gradient = false,
  children,
}: PageTitleProps): ReactElement {
  return (
    <StyledTitle
      size={sizeMap[size]}
      gradient={gradient}
      className={gradient ? 'page-title-gradient' : 'page-title-base'}
    >
      {children}
    </StyledTitle>
  );
});

import { H1, styled } from 'tamagui';
import { memo } from 'react';
import type { ReactNode, ReactElement } from 'react';

export type PageTitleSize = 'sm' | 'md' | 'lg' | 'xl';

const StyledTitle = styled(H1, {
  name: 'PageTitle',
  margin: 0,
  fontWeight: '800',
  color: '$color',
  letterSpacing: -0.5,

  variants: {
    size: {
      sm: { fontSize: '$4' },
      md: { fontSize: '$6' },
      lg: { fontSize: '$8' },
      xl: { fontSize: '$9' },
    },
    gradient: {
      true: {
        color: 'transparent',
        background: 'linear-gradient(135deg, $color 0%, $primary 100%)',
        backgroundClip: 'text',
      },
    },
  } as const,

  defaultVariants: {
    size: 'lg',
  },
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
    <StyledTitle size={size} gradient={gradient}>
      {children}
    </StyledTitle>
  );
});

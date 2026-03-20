import { H1, styled, useTheme } from 'tamagui';
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
  lineHeight: '1.2' as unknown as number,

  variants: {
    gradient: {
      true: {
        color: 'transparent',
      },
    },
  } as const,
});

export type PageTitleProps = {
  size?: PageTitleSize;
  gradient?: boolean;
  children: ReactNode;
};

  const baseStyle = {
    animationName: 'pageTitleEnter',
    animationDuration: '200ms',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'both' as const,
  };

export const PageTitle = memo(function PageTitle({
  size = 'lg',
  gradient = false,
  children,
}: PageTitleProps): ReactElement {
  const theme = useTheme();

  const gradientStyle = gradient
    ? {
        ...baseStyle,
        backgroundImage: `linear-gradient(135deg, ${theme.color?.get() ?? 'currentColor'} 0%, ${theme.primary?.get() ?? '#57c3ff'} 100%)`,
        backgroundSize: '200% 200%',
        backgroundClip: 'text' as const,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        display: 'inline-block' as const,
        paddingTop: '0.5em',
        paddingBottom: '0.5em',
        marginTop: '-0.5em',
        marginBottom: '-0.5em',
        animationName: 'pageTitleEnter, gradientShift',
        animationDuration: '200ms, 4s',
        animationTimingFunction: 'ease-out, ease',
        animationIterationCount: '1, infinite' as const,
      }
    : baseStyle;

  return (
    <StyledTitle
      gradient={gradient}
      size={sizeMap[size]}
      style={gradientStyle}
    >
      {children}
    </StyledTitle>
  );
});

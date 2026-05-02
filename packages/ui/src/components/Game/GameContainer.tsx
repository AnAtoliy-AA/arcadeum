import { YStack, styled, GetProps } from 'tamagui';
import { memo } from 'react';
import type { ReactNode, ReactElement } from 'react';
import type { GameVariant } from '../Button/types';

export type { GameVariant };

export type GameContainerProps = GetProps<typeof YStack> & {
  children: ReactNode;
  $variant?: GameVariant;
};

const StyledGameContainer = styled(YStack, {
  name: 'GameContainer',
  position: 'relative',
  width: '100%',
  flex: 1,
  overflow: 'hidden',
  backgroundColor: '$background',

  variants: {
    $variant: {
      cyberpunk: {
        backgroundColor: '$cyberpunkBg',
      },
      underwater: {
        backgroundColor: '$underwaterBg',
      },
      crime: {
        backgroundColor: '$crimeBg',
      },
      horror: {
        backgroundColor: '$horrorBg',
      },
      adventure: {
        backgroundColor: '$adventureBg',
      },
      'high-altitude-hike': {
        backgroundColor: '$hikeBg',
      },
    },
    $isMyTurn: {
      true: {},
      false: {},
    },
  } as const,
});

const AmbientGlow = styled(YStack, {
  position: 'absolute',
  top: '-60%',
  left: '-60%',
  width: '220%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 0,
  opacity: 0.5,

  variants: {
    $variant: {
      cyberpunk: {
        background: 'radial-gradient(circle at 30% 30%, rgba(6, 182, 212, 0.15) 0%, transparent 35%), radial-gradient(circle at 70% 70%, rgba(192, 38, 211, 0.12) 0%, transparent 35%)',
      },
      underwater: {
        background: 'radial-gradient(circle at 30% 30%, rgba(34, 211, 238, 0.15) 0%, transparent 40%), radial-gradient(circle at 70% 70%, rgba(236, 72, 153, 0.1) 0%, transparent 40%)',
      },
      crime: {
        background: 'radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.1) 0%, transparent 60%)',
      },
      horror: {
        background: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 60%)',
      },
      adventure: {
        background: 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.1) 0%, transparent 60%)',
      },
      'high-altitude-hike': {
        background: 'radial-gradient(circle at 30% 30%, rgba(56, 189, 248, 0.15) 0%, transparent 40%), radial-gradient(circle at 70% 70%, rgba(248, 250, 252, 0.1) 0%, transparent 40%)',
      },
    },
  } as const,
});

export const GameContainer = memo(function GameContainer({ children, $variant, ...props }: GameContainerProps): ReactElement {
  return (
    <StyledGameContainer $variant={$variant} {...props}>
      <AmbientGlow $variant={$variant} />
      {children}
    </StyledGameContainer>
  );
});

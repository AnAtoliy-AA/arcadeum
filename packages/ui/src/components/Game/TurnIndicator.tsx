import { styled, XStack, Text, type XStackProps } from 'tamagui';

const TurnIndicatorBase = styled(XStack, {
  name: 'TurnIndicator',
  minWidth: 240,
  maxWidth: 'fit-content' as any,
  paddingHorizontal: '$6',
  paddingVertical: '$2',
  backdropFilter: 'blur(20px)',
  borderWidth: 1,
  borderRadius: 100,
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$2',
  zIndex: 90,
  animation: 'medium',

  $md: {
    minWidth: 0,
    paddingHorizontal: '$4',
    paddingVertical: '$1',
  },

  variants: {
    isYourTurn: {
      true: {
        backgroundColor: 'rgba(16, 185, 129, 0.45)',
        borderColor: 'rgba(16, 185, 129, 0.5)',
      },
      false: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
      },
    },
  } as const,
});

export interface TurnIndicatorProps extends Omit<XStackProps, 'children'> {
  isYourTurn: boolean;
  children: string;
}

export function TurnIndicator({ isYourTurn, children, ...props }: TurnIndicatorProps) {
  return (
    <TurnIndicatorBase isYourTurn={isYourTurn} {...props}>
      <Text fontSize={18}>{isYourTurn ? '🎯' : '⏳'}</Text>
      <Text
        color="white"
        fontWeight="800"
        fontSize={14}
        textTransform="uppercase"
        letterSpacing={0.8}
      >
        {children}
      </Text>
    </TurnIndicatorBase>
  );
}

import { styled, YStack, Text } from 'tamagui';
import { getVariantStyles } from './variants';
import { scrollbarStyles } from '@/shared/lib/styles';

export const ChatCard = styled(YStack, {
  name: 'ChatCard',
  flexDirection: 'column',
  gap: '$4',
  padding: '$4',
  borderRadius: 20,
  backgroundColor: '$background',
  backdropFilter: 'blur(20px)',
  borderWidth: 2,
  borderColor: '$borderColor',
  elevation: 10,
  height: '100%',
  maxHeight: 450,

  variants: {
    $variant: (val: string) => {
      const config = getVariantStyles(val).chat;
      return {
        backgroundColor: config.getBackground(),
        borderColor: config.getBorder(),
        shadowColor: config.getShadow(),
      };
    },
  } as const,
});

export const ChatContainer = styled(YStack, {
  name: 'ChatContainer',
  flex: 1,
  backgroundColor: '$background',
});

export const ChatMessages = styled(YStack, {
  name: 'ChatMessages',
  flex: 1,
  overflowY: 'auto',
  gap: '$3',
  padding: '$2',

  ...scrollbarStyles,
});

export const ChatCloseButton = styled(Text, {
  name: 'ChatCloseButton',
  position: 'absolute',
  top: '$3',
  right: '$3',
  width: 24,
  height: 24,
  lineHeight: 24,
  textAlign: 'center',
  borderRadius: 12,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  cursor: 'pointer',
  zIndex: 10,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',

  hoverStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    scale: 1.1,
  },

  pressStyle: {
    scale: 0.95,
  },
});

// Log-pill spec (Task 13 Step 3): single line, soft blur, variant-tinted border
// at ~0.35 alpha, ellipsis truncation on overflow.
export const LOG_PILL_STYLE = {
  paddingVertical: '$1',
  paddingHorizontal: '$3',
  borderRadius: 999,
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  backdropFilter: 'blur(8px)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.14)',
} as const;

export const LogEntry = styled(Text, {
  name: 'LogEntry',
  ...LOG_PILL_STYLE,
  fontSize: 12,
  lineHeight: 20,
  numberOfLines: 1,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',

  variants: {
    $type: (_val: unknown) => ({}),
    $scope: (_val: unknown) => ({}),
    $variant: (_val: unknown) => ({}),
  } as const,
});

export const GameLog = styled(YStack, {
  name: 'GameLog',
  flex: 1,
  overflowY: 'auto',
  gap: '$2',
  padding: '$2',

  ...scrollbarStyles,
});

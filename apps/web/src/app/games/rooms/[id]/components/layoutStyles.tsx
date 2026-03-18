import { styled, XStack, YStack } from 'tamagui';

/**
 * Horizontal flex row on desktop (≥800px), vertical stack on mobile.
 * Wraps GameWrapper + ChatPanel side by side.
 */
export const GameRow = styled(XStack, {
  name: 'GameRow',
  flex: 1,
  gap: '$4',
  alignItems: 'stretch',

  $sm: {
    flexDirection: 'column',
  },
});

/**
 * Chat panel — fixed 300px wide on desktop, full width below game on mobile.
 * Hidden via display:none when visible=false so GameChat stays mounted
 * (preserves scroll position and store subscription).
 */
export const ChatPanel = styled(YStack, {
  name: 'ChatPanel',
  width: 300,
  minWidth: 300,
  minHeight: 500,
  flexShrink: 0,

  $sm: {
    width: '100%',
    minWidth: 0,
    minHeight: 0,
    height: 400,
  },

  variants: {
    visible: {
      true: {},
      false: {
        display: 'none',
      },
    },
  } as const,
});

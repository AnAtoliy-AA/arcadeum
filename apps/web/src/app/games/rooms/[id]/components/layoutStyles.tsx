import { styled, YStack } from 'tamagui';

/**
 * Horizontal flex row on desktop (≥1150px), vertical stack on mobile/tablet.
 * Wraps GameWrapper + ChatPanel side by side.
 */
export const GameRow = styled(YStack, {
  name: 'GameRow',
  flex: 1,
  minHeight: 0,
  gap: '$4',
  alignItems: 'stretch',

  // Switch to horizontal layout only on wide screens (> 1150px)
  $md: {
    flexDirection: 'column',
    flex: 1,
  },
  $tablet: {
    flexDirection: 'column',
    flex: 1,
  },
  $gtMd: {
    flexDirection: 'row',
    flex: 1,
  },
});

/**
 * Chat panel — fixed 320px wide on desktop, full width below game on mobile/tablet.
 * Uses glassmorphism for a premium look and separates cleanly from the game.
 */
export const ChatPanel = styled(YStack, {
  name: 'ChatPanel',
  width: 350,
  minWidth: 350,
  height: '100%',
  minHeight: 350,
  flexShrink: 0,
  backgroundColor: '$glassBg',
  borderRadius: '$4',
  borderWidth: 1,
  borderColor: '$glassBorder',
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',

  $md: {
    width: '100%',
    minWidth: 0,
    height: 'auto',
    paddingTop: 0,
    marginTop: '$2',
    borderRadius: '$3',
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

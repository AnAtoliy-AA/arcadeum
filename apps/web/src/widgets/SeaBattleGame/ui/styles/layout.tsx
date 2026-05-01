import { styled, XStack, YStack } from 'tamagui';

export const MainGameArea = styled(YStack, {
  name: 'MainGameArea',
  gap: '$5',
  width: '100%',
  flex: 1,
  minHeight: 0,

  $md: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
  },
  $tablet: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
  },
  $sm: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    gap: '$3',
  },
});

export const GameBoardWrapper = styled(XStack, {
  name: 'GameBoardWrapper',
  gap: '$6',
  flexWrap: 'wrap',
  width: '100%',

  $md: {
    flexDirection: 'column',
    gap: '$4',
  },
  $sm: {
    flexDirection: 'column',
    gap: '$4',
  },
});

export const BoardContainer = styled(YStack, {
  name: 'BoardContainer',
  flex: 1,
  maxWidth: 520,

  $md: {
    flex: 0,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  $sm: {
    flex: 0,
    width: '100%',
    maxWidth: 'none',
  },
});

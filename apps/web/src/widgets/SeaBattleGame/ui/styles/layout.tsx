import { styled, XStack, YStack } from 'tamagui';

export const MainGameArea = styled(YStack, {
  name: 'MainGameArea',
  gap: '$4',
  width: '100%',
  flexGrow: 1,
  flexShrink: 0,
  minHeight: 0,
  padding: '$2',

  $md: {
    gap: '$3',
    padding: '$1',
  },
  $sm: {
    gap: '$2',
    padding: 0,
  },
});

export const GameBoardWrapper = styled(XStack, {
  name: 'GameBoardWrapper',
  gap: '$4',
  flexWrap: 'wrap',
  width: '100%',
  justifyContent: 'center',

  $md: {
    flexDirection: 'column',
    gap: '$3',
  },
  $sm: {
    flexDirection: 'column',
    gap: '$2',
  },
});

export const BoardContainer = styled(YStack, {
  name: 'BoardContainer',
  flex: 1,
  maxWidth: 520,
  width: '100%',

  $md: {
    flex: 0,
    maxWidth: 500,
    alignSelf: 'center',
  },
  $sm: {
    flex: 0,
    maxWidth: 'none',
  },
  $short: {
    maxWidth: 420,
  },
});

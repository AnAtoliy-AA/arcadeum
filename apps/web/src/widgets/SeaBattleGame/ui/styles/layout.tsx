import { styled, XStack, YStack } from 'tamagui';

export const MainGameArea = styled(YStack, {
  name: 'MainGameArea',
  gap: '$5',
  width: '100%',

  $sm: {
    gap: '$3',
  },
});

export const GameBoardWrapper = styled(XStack, {
  name: 'GameBoardWrapper',
  gap: '$6',
  flexWrap: 'wrap',
  width: '100%',

  $sm: {
    flexDirection: 'column',
    gap: '$4',
  },
});

export const BoardContainer = styled(YStack, {
  name: 'BoardContainer',
  flex: 1,
  minWidth: 0,
  width: '100%',
});

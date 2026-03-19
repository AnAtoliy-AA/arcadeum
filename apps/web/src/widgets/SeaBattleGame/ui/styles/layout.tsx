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

// TEMPORARY: GridsContainer is kept here until Task 11 moves it inline in SeaBattleGrids.tsx.
// It is intentionally NOT listed as a primary export of the new Tamagui layout — it remains
// a Tamagui shim so SeaBattleGrids.tsx compiles unchanged.
export const GridsContainer = styled(YStack, {
  name: 'GridsContainer',
  // grid layout approximated with flex wrapping; Task 11 will replace with inline CSS grid
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: '$8',
  width: '100%',
  paddingVertical: '$2',
  paddingHorizontal: '$1',

  $sm: {
    flexDirection: 'column',
    gap: '$4',
  },
});

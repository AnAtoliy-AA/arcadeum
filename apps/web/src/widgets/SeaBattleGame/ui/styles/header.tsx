import { styled, XStack, YStack } from 'tamagui';

export const CompactHeaderContainer = styled(XStack, {
  name: 'CompactHeaderContainer',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  gap: '$4',
  paddingVertical: '$2',
  paddingBottom: '$3',
  zIndex: 100,
  backgroundColor: '$background',
  borderBottomWidth: 1,
  borderBottomColor: '$glassBorder',

  $sm: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: '$2',
  },
});

export const HeaderTitleArea = styled(YStack, {
  name: 'HeaderTitleArea',
  minWidth: 0,
  flex: 1,

  $sm: {
    alignItems: 'center',
  },
});

export const PlacementHeader = styled(XStack, {
  name: 'PlacementHeader',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '$4',
  marginBottom: '$5',

  $sm: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '$2',
    marginBottom: '$3',
  },
});

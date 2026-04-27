import { styled, XStack } from 'tamagui';

export const ActionBar = styled(XStack, {
  name: 'CriticalActionBar',
  position: 'sticky',
  bottom: 0,
  zIndex: 40,
  paddingVertical: '$2',
  paddingHorizontal: '$3',
  gap: '$2',
  backgroundColor: 'rgba(15,17,22,0.85)',
  backdropFilter: 'blur(12px)',
  borderTopWidth: 1,
  borderTopColor: '$glassBorder',
  alignItems: 'center',
  justifyContent: 'flex-end',
  flexShrink: 0,
  width: '100%',

  variants: {
    $variant: (_val: unknown) => ({}),
  } as const,
});

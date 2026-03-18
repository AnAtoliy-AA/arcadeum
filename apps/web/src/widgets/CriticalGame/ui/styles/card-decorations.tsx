import { styled, YStack, Text } from 'tamagui';

export const CardName = styled(Text, {
  name: 'CardName',
  fontWeight: '800',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  color: 'white',
  position: 'absolute',
  top: '$2',
  left: '$2',
  padding: '$1 $2',
  borderRadius: 4,
  backgroundColor: 'rgba(0,0,0,0.5)',
  zIndex: 10,

  variants: {
    $variant: (_val: unknown) => ({}),
  } as const,
});

export const CardDescription = styled(Text, {
  name: 'CardDescription',
  fontSize: 10,
  color: 'white',
  textAlign: 'center',
  paddingHorizontal: '$3',
  opacity: 0.9,

  variants: {
    $variant: (_val: unknown) => ({}),
  } as const,
});

export const CardCountBadge = styled(Text, {
  name: 'CardCountBadge',
  position: 'absolute',
  top: -8,
  right: -8,
  backgroundColor: '$danger',
  color: 'white',
  width: 24,
  height: 24,
  borderRadius: 12,
  textAlign: 'center',
  lineHeight: 24,
  fontSize: 12,
  fontWeight: '700',
  elevation: 5,
  zIndex: 20,

  variants: {
    $variant: (_val: unknown) => ({}),
  } as const,
});

export const CardInner = styled(YStack, {
  name: 'CardInner',
  flex: 1,
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  borderRadius: 12,
  overflow: 'hidden',

  variants: {
    $variant: (_val: unknown) => ({}),
  } as const,
});

export const CardFrame = styled(YStack, {
  name: 'CardFrame',
  position: 'absolute',
  inset: 0,
  borderWidth: 2,
  borderColor: 'rgba(255,255,255,0.1)',
  borderRadius: 14,
  pointerEvents: 'none',

  variants: {
    $variant: (_val: unknown) => ({}),
  } as const,
});

export const CardCorner = styled(YStack, {
  name: 'CardCorner',
  position: 'absolute',
  width: 12,
  height: 12,
  borderColor: '$primary',
  pointerEvents: 'none',

  variants: {
    $position: {
      tl: { top: 4, left: 4, borderTopWidth: 2, borderLeftWidth: 2 },
      tr: { top: 4, right: 4, borderTopWidth: 2, borderRightWidth: 2 },
      bl: { bottom: 4, left: 4, borderBottomWidth: 2, borderLeftWidth: 2 },
      br: { bottom: 4, right: 4, borderBottomWidth: 2, borderRightWidth: 2 },
    },
    $variant: (_val: unknown) => ({}),
  } as const,
});

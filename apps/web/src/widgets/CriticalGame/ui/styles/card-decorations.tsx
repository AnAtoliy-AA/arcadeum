import { styled, YStack, Text } from 'tamagui';

export const CardNameContainer = styled(YStack, {
  name: 'CardNameContainer',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.45)',
  backdropFilter: 'blur(8px)',
  padding: '$1.5 $2',
  borderTopLeftRadius: 14,
  borderTopRightRadius: 14,
  zIndex: 10,
  borderBottomWidth: 1,
  borderBottomColor: 'rgba(255, 255, 255, 0.1)',

  variants: {
    $variant: (val: string) => {
      if (val === 'cyberpunk') {
        return {
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        };
      }
      return {};
    },
  } as const,
});

export const CardDescriptionContainer = styled(YStack, {
  name: 'CardDescriptionContainer',
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.45)',
  backdropFilter: 'blur(8px)',
  padding: '$1.5 $2',
  borderBottomLeftRadius: 14,
  borderBottomRightRadius: 14,
  zIndex: 10,
  borderTopWidth: 1,
  borderTopColor: 'rgba(255, 255, 255, 0.1)',

  variants: {
    $variant: (val: string) => {
      if (val === 'cyberpunk') {
        return {
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        };
      }
      return {};
    },
  } as const,
});

export const CardName = styled(Text, {
  name: 'CardName',
  fontWeight: '800',
  textTransform: 'uppercase',
  letterSpacing: 1,
  fontSize: 11,
  color: 'white',
  textAlign: 'center',
  numberOfLines: 1,
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',

  variants: {
    $variant: (_val: unknown) => ({}),
  } as const,
});

export const CardDescription = styled(Text, {
  name: 'CardDescription',
  fontSize: 10,
  lineHeight: '$13',
  fontWeight: '500',
  color: 'rgba(255, 255, 255, 0.95)',
  textAlign: 'center',
  textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',

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

export const CardBackContainer = styled(YStack, {
  name: 'CardBackContainer',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
});

export const CardBackLogo = styled(Text, {
  name: 'CardBackLogo',
  fontSize: 40,
  lineHeight: '$48',
  opacity: 0.15,
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

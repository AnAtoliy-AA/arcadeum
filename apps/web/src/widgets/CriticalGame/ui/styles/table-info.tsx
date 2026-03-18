import { styled, YStack, XStack, Text } from 'tamagui';
import { getVariantStyles } from './variants';
import { TamaguiTheme } from './variants/types';

export const TableInfo = styled(YStack, {
  name: 'TableInfo',
  position: 'absolute',
  top: '$4',
  right: '$4',
  gap: '$2',
  padding: '$4',
  borderRadius: 16,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  backdropFilter: 'blur(12px)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
  zIndex: 5,
  elevation: 5,
  overflow: 'hidden',

  variants: {
    $variant: (val: string) => {
      const config = getVariantStyles(val).tableInfo;
      return {
        backgroundColor: config.getBackground(),
        borderColor: config.getBorder(),
        shadowColor: config.getShadow(),
        ...config.getStyles?.(),
      };
    },
  } as const,

  $sm: {
    top: '$4',
    left: '$4',
    right: '$4',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: '$2',
    padding: '$2',
    borderRadius: 12,
  },
});

export const TableStat = styled(XStack, {
  name: 'TableStat',
  alignItems: 'center',
  gap: '$3',
  paddingVertical: '$2',
  paddingHorizontal: '$3',
  borderRadius: 10,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',

  hoverStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    x: -2,
  },

  $sm: {
    flex: 1,
    justifyContent: 'center',
    gap: '$1.5',
    paddingVertical: '$1.5',
    paddingHorizontal: '$2',
  },

  variants: {
    $variant: (val: string) => {
      const config = getVariantStyles(val).tableInfo;
      return {
        ...config.getTableStatStyles?.(),
      };
    },
  } as const,
});

export const StatIcon = styled(YStack, {
  name: 'StatIcon',
  alignItems: 'center',
  justifyContent: 'center',
});

export const StatValue = styled(Text, {
  name: 'StatValue',
  fontSize: 14,
  fontWeight: '700',
  color: '$color',

  variants: {
    $isWarning: {
      true: {
        color: '$danger',
      },
    },
    $variant: (val: string, { props }: { props: { $isWarning?: boolean } }) => {
      const config = getVariantStyles(val).tableInfo;
      return {
        color: config.getStatValueColor(!!props.$isWarning),
        textShadowColor: config.getTextGlow(),
      };
    },
  } as const,
});

export const InfoCard = styled(YStack, {
  name: 'InfoCard',
  padding: '$6',
  borderRadius: 20,
  backgroundColor: '$background',
  backdropFilter: 'blur(20px)',
  borderWidth: 2,
  borderColor: '$borderColor',
  elevation: 10,
  position: 'relative',
  overflow: 'hidden',

  $sm: {
    padding: '$5',
    borderRadius: 16,
  },

  variants: {
    $variant: (val: string, { theme }: { theme: TamaguiTheme }) => {
      const config = getVariantStyles(val).tableInfo;
      return {
        backgroundColor: config.getInfoCardBackground(theme),
        borderColor: config.getInfoCardBorder(theme),
        shadowColor: config.getInfoCardShadow(),
        ...config.getInfoCardStyles?.(),
      };
    },
  } as const,
});

export * from './table-decorations';

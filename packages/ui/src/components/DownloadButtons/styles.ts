import { XStack, YStack, Text, styled } from 'tamagui';

export const Container = styled(XStack, {
  name: 'DownloadButtonsContainer',
  flexWrap: 'wrap',
  gap: '$4',
  justifyContent: 'center',

  $xs: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
});

export const DownloadLink = styled(XStack, {
  name: 'DownloadLink',
  alignItems: 'center',
  gap: '$3',
  borderRadius: 100,
  backgroundColor: '$background',
  borderWidth: 1.5,
  borderColor: '$borderColor',
  cursor: 'pointer',
  paddingHorizontal: '$8',
  paddingVertical: '$3',
  minHeight: 60,
  minWidth: 170,

  hoverStyle: {
    backgroundColor: '$backgroundHover',
    borderColor: '$borderColorHover',
    scale: 1.02,
  },

  pressStyle: {
    scale: 0.98,
    backgroundColor: '$backgroundPress',
    borderColor: '$borderColorPress',
  },

  variants: {
    isButton: {
      true: {
        // Tag is handled via asChild or tag in the component
      },
    },
  } as const,
});

export const IconWrapper = styled(XStack, {
  name: 'DownloadIconWrapper',
  alignItems: 'center',
  justifyContent: 'center',
});

export const TextWrapper = styled(YStack, {
  name: 'DownloadTextWrapper',
  alignItems: 'flex-start',
});

export const SmallText = styled(Text, {
  name: 'DownloadSmallText',
  fontSize: 10,
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: 1,
  opacity: 0.9,
  color: '$color',
  lineHeight: 12,
});

export const LargeText = styled(Text, {
  name: 'DownloadLargeText',
  fontSize: 20,
  fontWeight: '700',
  whiteSpace: 'nowrap',
  color: '$color',
  lineHeight: 22,
});

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
  padding: '$3 $5',
  borderRadius: '$4',
  backgroundColor: '$black',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.15)',
  cursor: 'pointer',
  minWidth: 180,

  hoverStyle: {
    y: -2,
    backgroundColor: '#111',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
  },

  pressStyle: {
    y: 0,
    backgroundColor: '#000',
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
  fontWeight: '500',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  opacity: 0.8,
  color: '$white',
  lineHeight: 12, // Numeric value for Tamagui
});

export const LargeText = styled(Text, {
  name: 'DownloadLargeText',
  fontSize: 18,
  fontWeight: '600',
  whiteSpace: 'nowrap',
  color: '$white',
  lineHeight: 20, // Numeric value for Tamagui
});

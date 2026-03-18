import { styled, YStack, XStack, Text } from 'tamagui';

export const ServerLoadingMessage = styled(YStack, {
  name: 'ServerLoadingMessage',
  gap: '$3',
  padding: '$4',
  marginTop: '$3',
  background:
    'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.06) 50%, rgba(236, 72, 153, 0.05) 100%)',
  backdropFilter: 'blur(12px)',
  borderRadius: 14,
  borderWidth: 1,
  borderColor: 'rgba(99, 102, 241, 0.2)',
  maxWidth: 420,
  position: 'relative',
  overflow: 'hidden',
  elevation: 5,
});

export const ServerLoadingHeader = styled(XStack, {
  name: 'ServerLoadingHeader',
  alignItems: 'center',
  gap: '$3',
});

export const ServerLoadingSpinner = styled(YStack, {
  name: 'ServerLoadingSpinner',
  width: 24,
  height: 24,
  flexShrink: 0,
  borderRadius: 100,
  borderWidth: 2.5,
  borderColor: 'rgba(99, 102, 241, 0.15)',
  borderTopColor: '#6366f1',
  borderRightColor: '#8b5cf6',
  // animation handled via animation prop
});

export const ServerLoadingTitle = styled(Text, {
  name: 'ServerLoadingTitle',
  fontSize: 14,
  fontWeight: '600',
  color: '$color',
});

export const ServerLoadingText = styled(Text, {
  name: 'ServerLoadingText',
  fontSize: 12,
  color: '$color',
  opacity: 0.8,
  lineHeight: 18,
  paddingLeft: 36,
  position: 'relative',
});

export const ServerLoadingProgressBar = styled(YStack, {
  name: 'ServerLoadingProgressBar',
  height: 6,
  backgroundColor: 'rgba(99, 102, 241, 0.1)',
  borderRadius: 3,
  overflow: 'hidden',
  marginTop: '$2',
  position: 'relative',
});

export const ServerLoadingFooter = styled(XStack, {
  name: 'ServerLoadingFooter',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '$1',
  paddingLeft: 36,
});

export const ServerLoadingPercentage = styled(Text, {
  name: 'ServerLoadingPercentage',
  fontSize: 12,
  fontWeight: '600',
  color: '#6366f1',
});

export const ServerLoadingTimer = styled(Text, {
  name: 'ServerLoadingTimer',
  fontSize: 11,
  color: '$color',
  opacity: 0.7,
});

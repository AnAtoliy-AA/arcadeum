import { styled } from 'tamagui';
import { Typography } from '@arcadeum/ui';
import { YStack, XStack } from 'tamagui';

export const LogItem = styled(YStack, {
  name: 'LogItem',
  padding: '$5',
  borderRadius: '$4',
  borderWidth: 1,
  borderColor: '$borderColor',
  backgroundColor: '$background',
  gap: '$3',
  hoverStyle: {
    borderColor: '$borderColorHover',
  },
} as any);

export const LogHeader = styled(XStack, {
  jc: 'space-between',
  ai: 'center',
  gap: '$4',
});

export const LogTimestamp = styled(Typography, {
  uiSize: 'xs',
  alpha: 'medium',
  fontFamily: '$mono',
} as any);

export const LogScope = styled(Typography, {
  uiSize: 'xs',
  weight: '600',
  textTransform: 'uppercase',
  letterSpacing: '$md',
  paddingHorizontal: '$3',
  paddingVertical: '$1',
  borderRadius: 999,
  backgroundColor: '$backgroundStrong',
  alpha: 'medium',
} as any);

export const LogSender = styled(Typography, {
  uiSize: 'sm',
  weight: '500',
  alpha: 'high',
} as any);

export const LogMessage = styled(Typography, {
  lineHeight: '$5',
} as any);

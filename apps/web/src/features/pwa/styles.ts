'use client';

import { styled, YStack, XStack, Text } from 'tamagui';

export const PWAFeaturesList = styled(YStack, {
  name: 'PWAFeaturesList',
  tag: 'ul',
  padding: 0,
  margin: 0,
  marginTop: '$5',
  gap: '$3',
} as unknown as Record<string, unknown>);

export const PWAFeatureItem = styled(XStack, {
  name: 'PWAFeatureItem',
  tag: 'li',
  alignItems: 'center',
  gap: '$3',
  opacity: 0.7,
} as unknown as Record<string, unknown>);

export const PWAFeatureIcon = styled(Text, {
  name: 'PWAFeatureIcon',
  fontSize: '$5',
} as unknown as Record<string, unknown>);

export const PWAManualInstructions = styled(YStack, {
  name: 'PWAManualInstructions',
  marginTop: '$5',
  padding: '$4',
  backgroundColor: '$background',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '$borderColor',
} as unknown as Record<string, unknown>);

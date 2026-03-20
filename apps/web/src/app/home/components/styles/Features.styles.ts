'use client';

import { styled, YStack, XStack, Text } from 'tamagui';
import { SectionContainer } from './Common.styles';

export const FeaturesSection = styled(SectionContainer, {
  name: 'FeaturesSection',
  gap: '$10',
});

export const FeaturesGrid = styled(XStack, {
  name: 'FeaturesGrid',
  flexWrap: 'wrap',
  gap: '$6',
});

// FeatureCard uses GlassCard directly in the component — see HomeFeatures.tsx
// exported here as a re-export alias so the component import doesn't change
export { GlassCard as FeatureCard } from '@/shared/ui';

export const FeatureIcon = styled(YStack, {
  name: 'FeatureIcon',
  width: 56,
  height: 56,
  borderRadius: 16,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255,255,255,0.08)',
  borderWidth: 1,
  borderColor: '$glassBorder',
  transition: 'transform 0.2s ease-out' as any,
});

export const FeatureTitle = styled(Text, {
  name: 'FeatureTitle',
  margin: 0,
  fontSize: '$5',
  fontWeight: '600',
  color: '$color',
});

export const FeatureDescription = styled(Text, {
  name: 'FeatureDescription',
  margin: 0,
  fontSize: '$3',
  lineHeight: '$4' as any,
  color: '$color',
  opacity: 0.7,
});

// ComingSoonBadge uses Badge directly in the component
export { Badge as ComingSoonBadge } from '@/shared/ui';

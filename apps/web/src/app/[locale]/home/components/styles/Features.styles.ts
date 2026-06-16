'use client';

import {
  styled,
  YStack,
  XStack,
  Text,
  type GetThemeValueForKey,
} from 'tamagui';
import { GlassCard } from '@arcadeum/ui';
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

export const FeatureCard = styled(GlassCard, {
  name: 'FeatureCard',
  cursor: 'default',
  group: 'card' as unknown as boolean,
  style: {
    transition:
      'transform 0.2s ease-out, box-shadow 0.2s ease-out, border-color 0.2s ease-out',
  },

  hoverStyle: {
    transform: 'translateY(-4px)',
    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
    borderColor: 'rgba(87, 195, 255, 0.35)',
  },
});

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
  style: {
    transition: 'transform 0.2s ease-out',
  },

  '$group-card-hover': {
    scale: 1.1,
  },
} as never);

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
  lineHeight: '$4' as unknown as GetThemeValueForKey<'lineHeight'>,
  color: '$color',
  opacity: 0.7,
});

// ComingSoonBadge uses Badge directly in the component
export { Badge as ComingSoonBadge } from '@arcadeum/ui';

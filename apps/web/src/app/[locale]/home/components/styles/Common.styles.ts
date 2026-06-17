'use client';

import { styled, H2, Text, YStack } from 'tamagui';
import { Container } from '@arcadeum/ui';

export const PageWrapper = styled(YStack, {
  name: 'PageWrapper',
  flex: 1,
  width: '100%',
  position: 'relative',
  // Use CSS variables to avoid hydration mismatches
  background:
    'radial-gradient(circle at 50% 50%, var(--backgroundRadialStart) 0%, var(--backgroundRadialEnd) 100%)',
});

export const SectionContainer = styled(Container, {
  name: 'SectionContainer',
  size: 'xl',
  paddingVertical: '$12',
  overflow: 'hidden',
});

export const SectionHeader = styled(Container, {
  name: 'SectionHeader',
  size: 'xl',
  paddingVertical: 0,
  alignItems: 'center',
  gap: '$3',
});

export const SectionTitle = styled(H2, {
  name: 'SectionTitle',
  margin: 0,
  fontSize: '$8',
  fontWeight: '700',
  color: '$color',
  textAlign: 'center',
  letterSpacing: -0.5,
});

export const SectionSubtitle = styled(Text, {
  name: 'SectionSubtitle',
  fontSize: '$4',
  color: '$color',
  opacity: 0.7,
  textAlign: 'center',
  maxWidth: 600,
  marginHorizontal: 'auto',
});

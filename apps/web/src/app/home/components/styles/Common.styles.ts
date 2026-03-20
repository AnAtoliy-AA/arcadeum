'use client';

import { styled, H2, Text, YStack } from 'tamagui';
import { Container } from '@/shared/ui';

export const PageWrapper = styled(YStack, {
  name: 'PageWrapper',
  tag: 'main',
  minHeight: '100vh',
  flexDirection: 'column',
  overflow: 'hidden',
} as any);

export const SectionContainer = styled(Container, {
  name: 'SectionContainer',
  paddingVertical: '$10',
} as any);

export const SectionHeader = styled(Container, {
  name: 'SectionHeader',
  paddingVertical: 0,
  alignItems: 'center',
  gap: '$3',
} as any);

export const SectionTitle = styled(H2, {
  name: 'SectionTitle',
  margin: 0,
  fontSize: '$8',
  fontWeight: '700',
  color: '$color',
  textAlign: 'center',
});

export const SectionSubtitle = styled(Text, {
  name: 'SectionSubtitle',
  fontSize: '$4',
  color: '$color',
  opacity: 0.6,
  textAlign: 'center',
  maxWidth: 600,
  marginHorizontal: 'auto',
});

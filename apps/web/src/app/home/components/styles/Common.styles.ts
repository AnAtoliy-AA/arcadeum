'use client';

import { styled, H2, Text, Main } from 'tamagui';
import { Container } from '@/shared/ui';

export const PageWrapper = styled(Main, {
  name: 'PageWrapper',
  minHeight: '100vh',
  flexDirection: 'column',
  overflowX: 'hidden',
} as Record<string, unknown>);

export const SectionContainer = styled(Container, {
  name: 'SectionContainer',
  size: 'xl',
  paddingVertical: '$12',
  overflow: 'hidden',
} as Record<string, unknown>);

export const SectionHeader = styled(Container, {
  name: 'SectionHeader',
  size: 'xl',
  paddingVertical: 0,
  alignItems: 'center',
  gap: '$3',
} as Record<string, unknown>);

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

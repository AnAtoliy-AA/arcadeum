'use client';

import { styled, Text } from 'tamagui';
import { SectionContainer } from './Common.styles';

export const DownloadCtaSection = styled(SectionContainer, {
  name: 'DownloadCtaSection',
  alignItems: 'center',
});

// DownloadCtaCard uses GlassCard directly in the component
export { GlassCard as DownloadCtaCard } from '@/shared/ui';

export const DownloadTitle = styled(Text, {
  name: 'DownloadTitle',
  margin: 0,
  fontSize: '$6',
  fontWeight: '600',
  color: '$color',
  textAlign: 'center',
});

export const DownloadDescription = styled(Text, {
  name: 'DownloadDescription',
  margin: 0,
  maxWidth: 500,
  fontSize: '$4',
  lineHeight: '$5' as any,
  color: '$color',
  opacity: 0.7,
  textAlign: 'center',
});

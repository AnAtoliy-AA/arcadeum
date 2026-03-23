'use client';

import { styled } from 'tamagui';
import { SectionContainer } from './Common.styles';

export const PitchDeckSection = styled(SectionContainer, {
  name: 'PitchDeckSection',
  alignItems: 'center',
  size: 'full',
  maxWidth: 2000,
  paddingHorizontal: '$10',
  gap: '$10',
  paddingVertical: '$28',
});

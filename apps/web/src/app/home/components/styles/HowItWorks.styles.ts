'use client';

import { styled, YStack, Text } from 'tamagui';
import { SectionContainer } from './Common.styles';

export const HowItWorksSection = styled(SectionContainer, {
  name: 'HowItWorksSection',
  gap: '$8',
});

export const StepsContainer = styled(YStack, {
  name: 'StepsContainer',
  gap: '$8',
  maxWidth: 700,
  alignSelf: 'center',
  width: '100%',

  $gtMd: {
    flexDirection: 'row',
    maxWidth: '100%',
    gap: '$12',
  },
});

export const StepItem = styled(YStack, {
  name: 'StepItem',
  flex: 1,
  gap: '$4',
  position: 'relative',
  flexDirection: 'row',
  alignItems: 'flex-start',

  $gtMd: {
    flexDirection: 'column',
    alignItems: 'center',
  },
});

// Connector line rendered as a separate element inside StepItem — see HomeHowItWorks.tsx
export const StepConnector = styled(YStack, {
  name: 'StepConnector',
  position: 'absolute',
  zIndex: 0,
  // Mobile: vertical line
  left: 27,
  top: 56,
  bottom: -32,
  width: 2,

  $gtMd: {
    // Desktop: horizontal line
    left: '50%',
    top: 28,
    width: '100%',
    height: 2,
    bottom: 'auto',
  },
});

export const StepNumber = styled(YStack, {
  name: 'StepNumber',
  flexShrink: 0,
  width: 56,
  height: 56,
  borderRadius: 999,
  backgroundColor: '$glassBg',
  borderWidth: 1,
  borderColor: '$primary',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  zIndex: 1,
  shadowColor: 'transparent',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease' as any,
} as any);

export const StepContent = styled(YStack, {
  name: 'StepContent',
  flex: 1,
  gap: '$2',
  paddingTop: '$2',
});

export const StepTitle = styled(Text, {
  name: 'StepTitle',
  margin: 0,
  fontSize: '$5',
  fontWeight: '600',
  color: '$color',
  letterSpacing: -0.3,
});

export const StepDescription = styled(Text, {
  name: 'StepDescription',
  margin: 0,
  fontSize: '$4',
  lineHeight: '$5' as any,
  color: '$color',
  opacity: 0.7,
});

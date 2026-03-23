'use client';

import { styled, YStack, Text } from 'tamagui';
import { SectionContainer } from './Common.styles';

export const HowItWorksSection = styled(SectionContainer, {
  name: 'HowItWorksSection',
  gap: '$8',
  overflow: 'hidden',
});

export const StepsContainer = styled(YStack, {
  name: 'StepsContainer',
  gap: '$8',
  maxWidth: 700,
  alignSelf: 'center',
  width: '100%',
  height: 'auto',

  $gtMd: {
    flexDirection: 'row',
    maxWidth: 1100,
    gap: '$12',
  },
});

export const StepItem = styled(YStack, {
  name: 'StepItem',
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: 0,
  minWidth: 0,
  minHeight: 120,
  gap: '$4',
  position: 'relative',
  flexDirection: 'row',
  alignItems: 'flex-start',

  $gtMd: {
    minHeight: 180,
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
  background:
    'linear-gradient(to bottom, transparent, rgba(255,255,255,0.2), transparent)',

  $gtMd: {
    // Desktop: horizontal line
    left: '50%',
    top: 28,
    width: 'calc(100% + 48px)',
    height: 2,
    bottom: 'auto',
    background:
      'linear-gradient(to right, transparent, rgba(87, 195, 255, 0.3), transparent)',
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
} as Record<string, unknown>);

export const StepContent = styled(YStack, {
  name: 'StepContent',
  flex: 1,
  gap: '$2',
  paddingTop: '$2',
  alignItems: 'center',
});

export const StepTitle = styled(Text, {
  name: 'StepTitle',
  margin: 0,
  fontSize: '$5',
  fontWeight: '600',
  color: '$color',
  letterSpacing: -0.3,
  textAlign: 'center',
});

export const StepDescription = styled(Text, {
  name: 'StepDescription',
  margin: 0,
  fontSize: '$4',
  lineHeight: '$5' as unknown as number,
  color: '$color',
  opacity: 0.7,
  textAlign: 'center',
  maxWidth: 300,
});

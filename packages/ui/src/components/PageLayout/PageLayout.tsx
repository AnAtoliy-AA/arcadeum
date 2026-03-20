import { YStack, styled } from 'tamagui';
import type { ComponentProps } from 'react';

export const PageLayout = styled(YStack, {
  name: 'PageLayout',
  minHeight: '100vh',
  padding: '$5',
  backgroundColor: '$background',
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'radial-gradient(circle at top left, $backgroundRadialStart, transparent 55%), radial-gradient(circle at bottom right, $backgroundRadialEnd, transparent 55%), $background',
});

export type PageLayoutProps = ComponentProps<typeof PageLayout>;

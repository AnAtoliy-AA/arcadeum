'use client';
import { Main, styled } from 'tamagui';
import type { ComponentProps } from 'react';

export const PageLayout = styled(Main, {
  name: 'PageLayout',
  minHeight: '100vh',
  padding: '$5',
  backgroundColor: '$background',
  width: '100%',
  paddingTop: '$8',
  background: 'radial-gradient(circle at top left, $backgroundRadialStart, transparent 55%), radial-gradient(circle at bottom right, $backgroundRadialEnd, transparent 55%), $background',
});

export type PageLayoutProps = ComponentProps<typeof PageLayout>;

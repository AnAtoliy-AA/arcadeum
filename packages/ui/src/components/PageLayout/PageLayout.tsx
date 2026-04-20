'use client';
import { Main, styled } from 'tamagui';
import type { ComponentProps } from 'react';

const StyledPageLayout = styled(Main, {
  name: 'PageLayout',
  minHeight: '100vh',
  padding: '$5',
  backgroundColor: '$background',
  width: '100%',
  paddingTop: '$8',
  background: 'radial-gradient(circle at top left, $backgroundRadialStart, transparent 55%), radial-gradient(circle at bottom right, $backgroundRadialEnd, transparent 55%), $background',
});

import { filterProps } from '../../utils/filterProps';

export type PageLayoutProps = {
  /** @deprecated Use onClick instead */
  onPress?: () => void;
  onClick?: (e: unknown) => void;
};

export const PageLayout = StyledPageLayout.styleable(({ onPress, onClick, children, ...props }, ref) => {
  const filteredProps = filterProps({ ...props, onPress, onClick });

  return (
    <StyledPageLayout {...filteredProps} ref={ref}>
      {children}
    </StyledPageLayout>
  );
});

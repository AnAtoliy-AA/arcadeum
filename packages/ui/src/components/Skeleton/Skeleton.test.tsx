import { render as rtlRender, screen, fireEvent } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '../../tamagui.config';
import { Skeleton, SkeletonText, SkeletonCircle, SkeletonTableRow } from './Skeleton';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const render = (ui: React.ReactElement) => {
  return rtlRender(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>
  );
};

describe('Skeleton', () => {
  it('renders correctly', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders SkeletonText', () => {
    const { container } = render(<SkeletonText />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders SkeletonCircle', () => {
    const { container } = render(<SkeletonCircle />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with pulse animation', () => {
    const { container } = render(<Skeleton animation="pulse" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with no animation', () => {
    const { container } = render(<Skeleton animation="none" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders SkeletonTableRow with multiple columns', () => {
    const { container } = render(<SkeletonTableRow columns={4} />);
    // The container contains the ThemeProvider, which contains the skeletons.
    // Actually render() wraps in a div.
    // So container (the div) -> ThemeProvider (no div, just a component) -> 4 Skeletons.
    // Let's count divs inside the container.
    const skeletons = container.querySelectorAll('div');
    // Note: StyledSkeleton is a div.
    expect(skeletons.length).toBeGreaterThanOrEqual(4);
  });
});

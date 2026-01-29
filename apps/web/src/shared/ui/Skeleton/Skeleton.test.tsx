import { render } from '@testing-library/react';
import {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonTableRow,
} from './Skeleton';
import { ThemeProvider } from 'styled-components';
import { themeTokens } from '@/shared/config/theme';
import { describe, it, expect } from 'vitest';

const theme = themeTokens.dark;

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('Skeleton', () => {
  it('renders correctly', () => {
    const { container } = renderWithTheme(<Skeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders SkeletonText', () => {
    const { container } = renderWithTheme(<SkeletonText />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders SkeletonCircle', () => {
    const { container } = renderWithTheme(<SkeletonCircle />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with pulse animation', () => {
    const { container } = renderWithTheme(<Skeleton animation="pulse" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with no animation', () => {
    const { container } = renderWithTheme(<Skeleton animation="none" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders SkeletonTableRow with multiple columns', () => {
    const { container } = renderWithTheme(<SkeletonTableRow columns={4} />);
    // The container contains the ThemeProvider, which contains the skeletons.
    // Actually render() wraps in a div.
    // So container (the div) -> ThemeProvider (no div, just a component) -> 4 Skeletons.
    // Let's count divs inside the container.
    const skeletons = container.querySelectorAll('div');
    // Note: StyledSkeleton is a div.
    expect(skeletons.length).toBeGreaterThanOrEqual(4);
  });
});

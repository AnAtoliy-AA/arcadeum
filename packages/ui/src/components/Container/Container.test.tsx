import { render as rtlRender, screen, fireEvent } from '@testing-library/react';
import { Container } from './Container';

import { describe, it, expect, vi, beforeEach } from 'vitest';

const render = (ui: React.ReactElement) => {
  return rtlRender(ui);
};

describe('Container', () => {
  it('renders children correctly', () => {
    render(<Container>Content</Container>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const;
    sizes.forEach((size) => {
      const { unmount } = render(
        <Container size={size}>Size {size}</Container>,
      );
      expect(screen.getByText(`Size ${size}`)).toBeInTheDocument();
      unmount();
    });
  });
});

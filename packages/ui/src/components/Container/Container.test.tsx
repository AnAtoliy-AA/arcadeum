import { render, screen } from '@testing-library/react';
import { Container } from './Container';
import { describe, it, expect } from 'vitest';

describe('Container', () => {
  it('renders children correctly', () => {
    render(<Container>Content</Container>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies responsive padding classes', () => {
    render(<Container data-testid="container-el">Content</Container>);
    const el = screen.getByTestId('container-el');
    expect(el).toHaveClass('px-4');
    expect(el).toHaveClass('sm:px-6');
    expect(el).toHaveClass('lg:px-8');
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

  it('supports custom id and className', () => {
    render(
      <Container id="custom-id" className="custom-class" data-testid="custom-container">
        Custom
      </Container>,
    );
    const el = screen.getByTestId('custom-container');
    expect(el).toHaveAttribute('id', 'custom-id');
    expect(el).toHaveClass('custom-class');
  });

  it('forwards supported HTML attributes', () => {
    render(
      <Container
        id="attr-id"
        data-current-locale="es"
        data-testid="attr-container"
        onClick={() => {}}
      >
        Content
      </Container>,
    );
    const el = screen.getByTestId('attr-container');
    expect(el).toHaveAttribute('id', 'attr-id');
    expect(el).toHaveAttribute('data-current-locale', 'es');
  });
});


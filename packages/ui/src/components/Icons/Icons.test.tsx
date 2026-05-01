import { render } from '@testing-library/react';
import { MaximizeIcon, MinimizeIcon, ArrowLeftIcon } from './index';
import { describe, it, expect } from 'vitest';

describe('Icons', () => {
  it('renders MaximizeIcon', () => {
    const { container } = render(<MaximizeIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders MinimizeIcon', () => {
    const { container } = render(<MinimizeIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders ArrowLeftIcon', () => {
    const { container } = render(<ArrowLeftIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('passes size prop to SVG', () => {
    const { container } = render(<MaximizeIcon size={40} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '40');
    expect(svg).toHaveAttribute('height', '40');
  });
});

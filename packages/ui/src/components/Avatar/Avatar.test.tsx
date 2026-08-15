import { render as rtlRender, screen, fireEvent } from '@testing-library/react';
import { Avatar } from './Avatar';

import { describe, it, expect, vi, beforeEach } from 'vitest';

const render = (ui: React.ReactElement) => {
  return rtlRender(ui);
};

describe('Avatar', () => {
  it('renders initials when no src is provided', () => {
    render(<Avatar name="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders a question mark when no name or src is provided', () => {
    render(<Avatar />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('renders an image when src is provided', () => {
    const src = 'https://example.com/avatar.png';
    render(<Avatar name="John Doe" src={src} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', src);
    expect(img).toHaveAttribute('alt', 'John Doe');
  });

  it('handles name with single part', () => {
    render(<Avatar name="John" />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });
});

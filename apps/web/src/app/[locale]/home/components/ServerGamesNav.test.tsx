import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ServerGamesNav } from './ServerGamesNav';

describe('ServerGamesNav', () => {
  it('renders descriptive link text and aria-label for Go to satisfy SEO link-text audit', () => {
    render(<ServerGamesNav locale="en" />);

    const goLink = screen.getByRole('link', { name: /Go \(Baduk\)/i });
    expect(goLink).toBeInTheDocument();
    expect(goLink).toHaveAttribute('href', '/en/games/go');
    expect(goLink).toHaveAttribute('aria-label', 'Play Go (Baduk) online');
  });

  it('renders all games with descriptive play online aria-labels', () => {
    render(<ServerGamesNav locale="en" />);

    const chessLink = screen.getByRole('link', { name: /Chess/i });
    expect(chessLink).toHaveAttribute('href', '/en/games/chess');
    expect(chessLink).toHaveAttribute('aria-label', 'Play Chess online');
  });
});

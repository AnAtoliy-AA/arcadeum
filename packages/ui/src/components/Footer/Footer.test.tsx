import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Footer } from './Footer';

describe('Footer', () => {
  it('renders brand title and copyright', () => {
    render(
      <Footer
        appName="Arcadeum"
        description="Next-gen multiplayer games."
        copyrightLabel="© 2026 Arcadeum. All rights reserved."
      />,
    );

    expect(screen.getByText('ARCADEUM')).toBeInTheDocument();
    expect(screen.getByText('Next-gen multiplayer games.')).toBeInTheDocument();
    expect(
      screen.getByText('© 2026 Arcadeum. All rights reserved.'),
    ).toBeInTheDocument();
  });

  it('renders section links and toggles collapsible mobile state', () => {
    const customSections = [
      {
        title: 'Explore',
        links: [
          { href: '/games', label: 'All Games' },
          { href: '/rewards', label: 'Rewards' },
        ],
      },
      {
        title: 'Developers',
        links: [{ href: '/developers', label: 'API Docs' }],
      },
    ];

    render(<Footer sections={customSections} />);

    const exploreButton = screen.getByRole('button', { name: /explore/i });
    expect(exploreButton).toBeInTheDocument();
    expect(exploreButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(exploreButton);
    expect(exploreButton).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(exploreButton);
    expect(exploreButton).toHaveAttribute('aria-expanded', 'false');

    expect(screen.getByText('All Games')).toBeInTheDocument();
    expect(screen.getByText('Rewards')).toBeInTheDocument();
    expect(screen.getByText('API Docs')).toBeInTheDocument();
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { HeroBackground } from './HeroBackground';
import { HeroAmbientGlow } from './HeroAmbientGlow';
import { useHeroBackgroundStore } from '../store/heroBackgroundStore';

describe('HeroBackground', () => {
  it('renders hero background image with proper attributes for LCP', () => {
    render(<HeroBackground />);
    const img = screen.getByAltText(
      'Arcadeum glowing board game table background',
    );
    expect(img).toBeInTheDocument();
    expect(img.className).toContain('hero-background-image');
    expect(img.className).not.toContain('hidden');
  });

  it('renders ambient glow with corresponding active game theme', () => {
    const { container } = render(<HeroAmbientGlow />);
    expect(container.firstChild).toHaveClass('hero-dynamic-ambient');

    act(() => {
      useHeroBackgroundStore.getState().setActiveGameId('sea_battle_v1');
    });
    const { container: updatedContainer } = render(<HeroAmbientGlow />);
    expect(updatedContainer.firstChild).toHaveClass('hero-dynamic-ambient');
  });
});

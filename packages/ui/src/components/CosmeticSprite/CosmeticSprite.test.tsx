import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CosmeticSprite } from './CosmeticSprite';

describe('CosmeticSprite', () => {
  it('renders badge from sprite sheet when URL matches sprite map', () => {
    render(
      <CosmeticSprite
        src="/shop/badges/scout.png"
        size={40}
        alt="Scout"
        data-testid="scout-sprite"
      />,
    );

    const element = screen.getByTestId('scout-sprite');
    expect(element.tagName).toBe('DIV');
    expect(element.style.backgroundImage).toContain('/shop/badges_spritesheet.webp');
    expect(element.style.width).toBe('40px');
    expect(element.style.height).toBe('40px');
  });

  it('renders avatar from sprite sheet when URL matches sprite map', () => {
    render(
      <CosmeticSprite
        src="/shop/avatars/fox-01.png"
        size={48}
        alt="Fox"
        data-testid="fox-sprite"
      />,
    );

    const element = screen.getByTestId('fox-sprite');
    expect(element.tagName).toBe('DIV');
    expect(element.style.backgroundImage).toContain('/shop/avatars_spritesheet.webp');
    expect(element.style.width).toBe('48px');
    expect(element.style.height).toBe('48px');
  });

  it('falls back to img tag when URL is not in sprite maps', () => {
    render(
      <CosmeticSprite
        src="https://example.com/other.png"
        size={32}
        alt="Custom"
        data-testid="fallback-image"
      />,
    );

    const element = screen.getByTestId('fallback-image');
    expect(element.tagName).toBe('IMG');
    expect(element).toHaveAttribute('src', 'https://example.com/other.png');
    expect(element).toHaveAttribute('alt', 'Custom');
  });
});

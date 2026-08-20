import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameThemePicker } from './GameThemePicker';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => (key.startsWith('games.') ? key.split('.').pop() : key),
  }),
}));

describe('GameThemePicker', () => {
  it('renders shared themes by default', () => {
    render(<GameThemePicker selectedTheme="cyberpunk" onSelect={vi.fn()} />);
    expect(screen.getByTestId('theme-cyberpunk')).toBeInTheDocument();
    expect(screen.getByTestId('theme-zen')).toBeInTheDocument();
  });

  it('filters to allowedThemes when provided', () => {
    render(
      <GameThemePicker
        selectedTheme="cyberpunk"
        onSelect={vi.fn()}
        allowedThemes={['cyberpunk', 'galaxy']}
      />,
    );
    expect(screen.getByTestId('theme-cyberpunk')).toBeInTheDocument();
    expect(screen.getByTestId('theme-galaxy')).toBeInTheDocument();
    expect(screen.queryByTestId('theme-zen')).not.toBeInTheDocument();
  });

  it('marks the selected theme and calls onSelect on click', () => {
    const onSelect = vi.fn();
    render(
      <GameThemePicker
        selectedTheme="cyberpunk"
        onSelect={onSelect}
        allowedThemes={['cyberpunk', 'galaxy']}
      />,
    );
    const cyberpunk = screen.getByTestId('theme-cyberpunk');
    expect(cyberpunk.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(screen.getByTestId('theme-galaxy'));
    expect(onSelect).toHaveBeenCalledWith('galaxy');
  });

  it('disables options flagged as coming soon when showComingSoon is set', () => {
    render(
      <GameThemePicker
        selectedTheme="cyberpunk"
        onSelect={vi.fn()}
        options={[{ id: 'custom', nameKey: 'Custom' }]}
        showComingSoon
      />,
    );
    const custom = screen.getByTestId('theme-custom');
    expect(custom).toBeDisabled();
  });

  it('renders a radiogroup with an accessible label', () => {
    render(
      <GameThemePicker
        selectedTheme="cyberpunk"
        onSelect={vi.fn()}
        label="Pick a theme"
      />,
    );
    expect(screen.getByRole('radiogroup')).toHaveAttribute(
      'aria-label',
      'Pick a theme',
    );
  });
});

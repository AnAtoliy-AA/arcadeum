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
    expect(
      screen.getAllByTestId('theme-cyberpunk').length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByTestId('theme-zen').length).toBeGreaterThanOrEqual(1);
  });

  it('filters to allowedThemes when provided', () => {
    render(
      <GameThemePicker
        selectedTheme="cyberpunk"
        onSelect={vi.fn()}
        allowedThemes={['cyberpunk', 'galaxy']}
      />,
    );
    expect(
      screen.getAllByTestId('theme-cyberpunk').length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByTestId('theme-galaxy').length).toBeGreaterThanOrEqual(
      1,
    );
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
    const cyberpunk = screen.getAllByTestId('theme-cyberpunk')[0];
    expect(cyberpunk).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(screen.getAllByTestId('theme-galaxy')[0]);
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
    const customs = screen.getAllByTestId('theme-custom');
    expect(customs.length).toBeGreaterThanOrEqual(1);
    expect(customs[0]).toBeDisabled();
  });

  it('renders a radiogroup with an accessible label', () => {
    render(
      <GameThemePicker
        selectedTheme="cyberpunk"
        onSelect={vi.fn()}
        label="Pick a theme"
      />,
    );
    const groups = screen.getAllByRole('radiogroup');
    expect(groups.length).toBeGreaterThanOrEqual(1);
    expect(groups[0]).toHaveAttribute('aria-label', 'Pick a theme');
  });
});

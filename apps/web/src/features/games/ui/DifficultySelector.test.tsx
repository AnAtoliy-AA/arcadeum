import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DifficultySelector } from './DifficultySelector';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('DifficultySelector', () => {
  it('renders all four difficulty tiers', () => {
    render(<DifficultySelector value="medium" onChange={vi.fn()} />);
    for (const d of ['easy', 'medium', 'hard', 'expert']) {
      expect(
        screen.getByText(
          `games.lobby.difficulty${d[0].toUpperCase()}${d.slice(1)}`,
        ),
      ).toBeInTheDocument();
    }
  });

  it('marks the selected difficulty as active', () => {
    const { container } = render(
      <DifficultySelector value="hard" onChange={vi.fn()} />,
    );
    const active = container.querySelector('[data-active="on"]');
    expect(active).not.toBeNull();
  });

  it('calls onChange with the clicked difficulty', () => {
    const onChange = vi.fn();
    render(<DifficultySelector value="medium" onChange={onChange} />);
    fireEvent.click(screen.getByText('games.lobby.difficultyExpert'));
    expect(onChange).toHaveBeenCalledWith('expert');
  });
});

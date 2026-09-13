import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DifficultySelector } from './DifficultySelector';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('DifficultySelector', () => {
  it('renders all nine difficulty tiers', () => {
    render(<DifficultySelector value="medium" onChange={vi.fn()} />);
    for (const d of [
      'beginner',
      'easy',
      'intermediate',
      'medium',
      'advanced',
      'strong',
      'hard',
      'master',
      'expert',
    ]) {
      expect(
        screen.getByText(
          `games.lobby.difficulty${d[0].toUpperCase()}${d.slice(1)}`,
        ),
      ).toBeInTheDocument();
    }
  });

  it('marks the selected difficulty as active', () => {
    render(<DifficultySelector value="hard" onChange={vi.fn()} />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('hard');
  });

  it('calls onChange with the selected difficulty', () => {
    const onChange = vi.fn();
    render(<DifficultySelector value="medium" onChange={onChange} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'expert' } });
    expect(onChange).toHaveBeenCalledWith('expert');
  });
});

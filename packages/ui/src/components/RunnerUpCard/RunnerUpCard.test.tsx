import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RunnerUpCard } from './RunnerUpCard';

describe('RunnerUpCard', () => {
  it('renders runner-up card with player details', () => {
    render(
      <RunnerUpCard
        place={2}
        name="Nightblade"
        rating={2750}
        wins={120}
        winrate={0.75}
        region="North America"
      />,
    );

    expect(screen.getByText('Nightblade')).toBeInTheDocument();
    expect(screen.getByText('2,750')).toBeInTheDocument();
    expect(screen.getByText('120 W')).toBeInTheDocument();
    expect(screen.getByText('75% WR')).toBeInTheDocument();
    expect(screen.getByText('· North America')).toBeInTheDocument();
  });

  it('triggers onClick when clicked or on Enter key', () => {
    const handleClick = vi.fn();
    render(
      <RunnerUpCard
        place={3}
        name="Frostbyte"
        rating={2680}
        wins={95}
        winrate={0.68}
        onClick={handleClick}
      />,
    );

    const card = screen.getByTestId('runner-up-3');
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });
});

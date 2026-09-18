import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnimatedDice } from './AnimatedDice';

describe('AnimatedDice', () => {
  it('renders correct number of dice', () => {
    render(<AnimatedDice values={[2, 4]} />);
    expect(screen.getByTestId('dice-die-0')).toBeInTheDocument();
    expect(screen.getByTestId('dice-die-1')).toBeInTheDocument();
  });

  it('applies rolling animations when isRolling is true', () => {
    render(<AnimatedDice isRolling={true} values={[3, 3]} />);
    const die0 = screen.getByTestId('dice-die-0');
    expect(die0.className).toContain('animated-dice-shake');
  });

  it('applies doubles styling when isDoubles is true', () => {
    render(<AnimatedDice isDoubles={true} values={[5, 5]} />);
    const die0 = screen.getByTestId('dice-die-0');
    expect(die0.className).toContain('border-amber-400');
  });

  it('renders classic and gold variants with appropriate classes', () => {
    const { rerender } = render(
      <AnimatedDice variant="classic" size="xl" values={[6]} />,
    );
    expect(screen.getByTestId('dice-die-0').className).toContain('w-16');

    rerender(<AnimatedDice variant="gold" size="2xl" values={[6]} />);
    expect(screen.getByTestId('dice-die-0').className).toContain('w-20');
    expect(screen.getByTestId('dice-die-0').className).toContain('from-amber-200');
  });
});

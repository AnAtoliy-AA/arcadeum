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
    expect(die0.className).toContain('animate-spin');
  });

  it('applies doubles styling when isDoubles is true', () => {
    render(<AnimatedDice isDoubles={true} values={[5, 5]} />);
    const die0 = screen.getByTestId('dice-die-0');
    expect(die0.className).toContain('border-amber-400');
  });
});

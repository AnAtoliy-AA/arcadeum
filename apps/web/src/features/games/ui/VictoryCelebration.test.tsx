import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VictoryCelebration } from './VictoryCelebration';

describe('VictoryCelebration', () => {
  it('renders victory celebration with active theme', () => {
    render(<VictoryCelebration tone="victory" theme="cyberpunk" />);
    const celebration = screen.getByTestId('victory-celebration');
    expect(celebration).toBeInTheDocument();
    expect(celebration).toHaveAttribute('data-theme', 'cyberpunk');
  });

  it('renders defeat celebration with embers', () => {
    render(<VictoryCelebration tone="defeat" theme="underwater" />);
    const celebration = screen.getByTestId('victory-celebration');
    expect(celebration).toBeInTheDocument();
    expect(celebration).toHaveAttribute('data-theme', 'underwater');
  });

  it('renders draw celebration without confetti', () => {
    render(<VictoryCelebration tone="draw" theme="zen" />);
    const celebration = screen.getByTestId('victory-celebration');
    expect(celebration).toBeInTheDocument();
    expect(celebration).toHaveAttribute('data-theme', 'zen');
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DiceRollOverlay } from './DiceRollOverlay';

describe('DiceRollOverlay', () => {
  it('renders roll button when canRoll is true and fires onRoll callback', () => {
    const handleRoll = vi.fn();
    render(
      <DiceRollOverlay
        canRoll={true}
        isRolling={false}
        onRoll={handleRoll}
        rollLabel="Roll Now"
      />,
    );

    const button = screen.getByTestId('dice-overlay-roll-button');
    expect(button).toBeInTheDocument();
    expect(button.textContent).toContain('Roll Now');

    fireEvent.click(button);
    expect(handleRoll).toHaveBeenCalledTimes(1);
  });

  it('renders rolling animation when isRolling is true', () => {
    render(
      <DiceRollOverlay
        canRoll={false}
        isRolling={true}
        onRoll={vi.fn()}
      />,
    );

    expect(screen.getByTestId('dice-overlay-rolling-state')).toBeInTheDocument();
    expect(screen.queryByTestId('dice-overlay-roll-button')).not.toBeInTheDocument();
  });

  it('renders result values and label when rolled', () => {
    render(
      <DiceRollOverlay
        canRoll={false}
        isRolling={false}
        onRoll={vi.fn()}
        values={[5]}
        resultLabel="Moved 5 spaces"
      />,
    );

    expect(screen.getByTestId('dice-overlay-result-state')).toBeInTheDocument();
    expect(screen.getByTestId('dice-overlay-result-label').textContent).toBe(
      'Moved 5 spaces',
    );
  });

  it('renders previous roll hint when canRoll is true and lastValues are provided', () => {
    render(
      <DiceRollOverlay
        canRoll={true}
        isRolling={false}
        onRoll={vi.fn()}
        lastValues={[4]}
      />,
    );

    expect(
      screen.getByTestId('dice-overlay-previous-roll-hint'),
    ).toBeInTheDocument();
  });
});

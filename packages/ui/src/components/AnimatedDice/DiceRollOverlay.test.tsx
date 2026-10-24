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

  it('triggers onRoll when flicked upward via pointer events', () => {
    const handleRoll = vi.fn();
    render(
      <DiceRollOverlay
        canRoll={true}
        isRolling={false}
        onRoll={handleRoll}
      />,
    );

    const inner = screen.getByTestId('dice-overlay-container').firstElementChild;
    expect(inner).toBeInTheDocument();

    if (inner) {
      fireEvent.pointerDown(inner, { clientY: 200 });
      fireEvent.pointerUp(inner, { clientY: 150 });
      expect(handleRoll).toHaveBeenCalledTimes(1);
    }
  });

  it('triggers onRoll on Space key press when canRoll is true', () => {
    const handleRoll = vi.fn();
    render(
      <DiceRollOverlay
        canRoll={true}
        isRolling={false}
        onRoll={handleRoll}
      />,
    );

    fireEvent.keyDown(window, { code: 'Space', key: ' ' });
    expect(handleRoll).toHaveBeenCalledTimes(1);
  });

  it('does not trigger onRoll on Space key press when typing in input or disabled', () => {
    const handleRoll = vi.fn();
    render(
      <div>
        <input data-testid="chat-input" />
        <DiceRollOverlay
          canRoll={true}
          isRolling={false}
          onRoll={handleRoll}
        />
      </div>,
    );

    const input = screen.getByTestId('chat-input');
    fireEvent.keyDown(input, { code: 'Space', key: ' ' });
    expect(handleRoll).not.toHaveBeenCalled();
  });
});

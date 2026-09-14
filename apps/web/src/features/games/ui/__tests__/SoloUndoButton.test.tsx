import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SoloUndoButton } from '../SoloUndoButton';

describe('SoloUndoButton', () => {
  it('renders undo text', () => {
    render(<SoloUndoButton onUndo={vi.fn()} canUndo={true} />);
    expect(screen.getByText('Undo')).toBeTruthy();
  });

  it('calls onUndo when clicked and canUndo is true', () => {
    const onUndo = vi.fn();
    render(<SoloUndoButton onUndo={onUndo} canUndo={true} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('does not call onUndo when canUndo is false', () => {
    const onUndo = vi.fn();
    render(<SoloUndoButton onUndo={onUndo} canUndo={false} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onUndo).not.toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    const onUndo = vi.fn();
    render(<SoloUndoButton onUndo={onUndo} canUndo={true} disabled={true} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onUndo).not.toHaveBeenCalled();
  });

  it('has correct data-testid', () => {
    render(<SoloUndoButton onUndo={vi.fn()} canUndo={true} />);
    expect(screen.getByTestId('solo-undo-button')).toBeTruthy();
  });
});

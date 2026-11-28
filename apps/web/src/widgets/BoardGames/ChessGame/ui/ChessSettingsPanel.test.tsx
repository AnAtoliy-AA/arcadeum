import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChessSettingsPanel } from './ChessSettingsPanel';

describe('ChessSettingsPanel', () => {
  beforeEach(() => window.localStorage.clear());

  it('exposes settings as labelled switches', () => {
    const onToggleConfirmMoves = vi.fn();
    render(
      <ChessSettingsPanel
        pieceStyle="neo"
        confirmMoves={false}
        onToggleConfirmMoves={onToggleConfirmMoves}
      />,
    );
    const coords = screen.getByRole('switch', {
      name: 'games.chess_v1.settings.coordinates',
    });
    expect(coords.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(coords);
    expect(coords.getAttribute('aria-checked')).toBe('false');

    const confirm = screen.getByRole('switch', {
      name: 'games.chess_v1.settings.confirmMoves',
    });
    expect(confirm.getAttribute('aria-checked')).toBe('false');
    fireEvent.click(confirm);
    expect(onToggleConfirmMoves).toHaveBeenCalledTimes(1);

    expect(
      screen.getByRole('switch', {
        name: 'games.chess_v1.settings.streamerMode',
      }),
    ).toBeDefined();
  });

  it('labels the volume slider and marks the active piece set', () => {
    render(<ChessSettingsPanel pieceStyle="neo" />);
    const slider = screen.getByLabelText('games.chess_v1.settings.volume');
    expect(slider.getAttribute('type')).toBe('range');
    const pressed = screen
      .getAllByRole('button')
      .filter((b) => b.getAttribute('aria-pressed') === 'true');
    expect(pressed.length).toBeGreaterThan(0);
  });
});

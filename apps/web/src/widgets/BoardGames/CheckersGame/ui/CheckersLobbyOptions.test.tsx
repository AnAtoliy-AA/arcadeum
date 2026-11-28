import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CheckersLobbyOptionsPanel } from './CheckersLobbyOptions';

const setOption = vi.fn();

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/features/games/hooks/useRoomOptions', () => ({
  useRoomOptions: () => ({ setOption }),
}));
vi.mock('@/features/games/ui/GameThemePicker', () => ({
  GameThemePicker: () => <div data-testid="theme-picker" />,
}));

const base = {
  theme: 'classic',
  variant: 'classic',
  mode: 'american',
  forcedCaptures: true,
  backwardCaptures: false,
} as never;

describe('CheckersLobbyOptionsPanel', () => {
  beforeEach(() => setOption.mockClear());

  it('lets the host pick a ruleset', () => {
    render(
      <CheckersLobbyOptionsPanel
        options={base}
        roomId="r1"
        userId="u1"
        isHost
      />,
    );
    expect(screen.getByTestId('checkers-board-size-section')).toBeDefined();
    fireEvent.click(screen.getByTestId('checkers-rule-variant-russian'));
    expect(setOption).toHaveBeenCalledWith({ mode: 'russian' });
    expect(screen.queryByTestId('lobby-host-only-note')).toBeNull();
  });

  it('keeps capture rules in a collapsed advanced section', () => {
    render(
      <CheckersLobbyOptionsPanel
        options={base}
        roomId="r1"
        userId="u1"
        isHost
      />,
    );
    const details = screen.getByTestId(
      'checkers-capture-rules',
    ) as HTMLDetailsElement;
    expect(details.open).toBe(false);
    fireEvent.click(screen.getByTestId('checkers-forced-captures'));
    expect(setOption).toHaveBeenCalledWith({ forcedCaptures: false });
  });

  it('is read only for non-hosts and explains why', () => {
    render(
      <CheckersLobbyOptionsPanel
        options={base}
        roomId="r1"
        userId="u2"
        isHost={false}
      />,
    );
    expect(screen.getByTestId('lobby-host-only-note')).toBeDefined();
    fireEvent.click(screen.getByTestId('checkers-rule-variant-russian'));
    expect(setOption).not.toHaveBeenCalled();
  });
});

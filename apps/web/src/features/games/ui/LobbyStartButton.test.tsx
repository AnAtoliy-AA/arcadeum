import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LobbyStartButton } from './LobbyStartButton';

const base = {
  startBusy: false,
  startDisabled: false,
  enableBots: false,
  playerCount: 2,
  minPlayers: 2,
  botCount: 3,
  startLabel: 'Start',
  startingLabel: 'Starting...',
  startWithBotsLabel: 'Start with {{count}} bots',
  onStart: vi.fn(),
};

describe('LobbyStartButton', () => {
  it('shows the start label and fires onStart', () => {
    const onStart = vi.fn();
    render(<LobbyStartButton {...base} onStart={onStart} />);
    const btn = screen.getByTestId('start-with-bots-button');
    expect(btn.textContent).toBe('Start');
    fireEvent.click(btn);
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('shows the busy label and is disabled while starting', () => {
    render(<LobbyStartButton {...base} startBusy />);
    const btn = screen.getByTestId(
      'start-with-bots-button',
    ) as HTMLButtonElement;
    expect(btn.textContent).toBe('Starting...');
    expect(btn.disabled).toBe(true);
  });

  it('is disabled when startDisabled is set', () => {
    render(<LobbyStartButton {...base} startDisabled />);
    expect(
      (screen.getByTestId('start-with-bots-button') as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });

  it('is disabled when there are not enough players', () => {
    render(<LobbyStartButton {...base} playerCount={1} />);
    expect(
      (screen.getByTestId('start-with-bots-button') as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });

  it('offers start with bots for a solo host and interpolates the count', () => {
    render(<LobbyStartButton {...base} enableBots playerCount={1} />);
    const btn = screen.getByTestId(
      'start-with-bots-button',
    ) as HTMLButtonElement;
    expect(btn.textContent).toBe('Start with 3 bots');
    expect(btn.disabled).toBe(false);
  });
});

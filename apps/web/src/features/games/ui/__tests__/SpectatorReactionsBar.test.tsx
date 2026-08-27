import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SpectatorReactionsBar } from '../SpectatorReactionsBar';
import type { EmoteId } from '@/widgets/GameChat/ui/EmotePicker';

const LABELS = {
  reactionsLabel: 'React',
  emotes: {
    fire: 'Fire!',
    clap: 'Bravo!',
    heart: 'Love',
    lol: 'LOL',
    good_move: 'Nice!',
    rip: 'RIP',
  } as Partial<Record<EmoteId, string>>,
};

const sendEmote = vi.fn();

function renderBar(overrides?: { disabled?: boolean }) {
  return render(
    <SpectatorReactionsBar
      sendEmote={sendEmote}
      disabled={overrides?.disabled}
      labels={LABELS}
    />,
  );
}

describe('SpectatorReactionsBar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sendEmote.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders exactly six reaction buttons with localized aria-labels', () => {
    renderBar();

    const ids = ['fire', 'clap', 'heart', 'lol', 'good_move', 'rip'];
    expect(screen.getByTestId('spectator-reactions-bar')).toBeInTheDocument();
    for (const id of ids) {
      const btn = screen.getByTestId(`spectator-reaction-${id}`);
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveAttribute(
        'aria-label',
        LABELS.emotes[id as EmoteId] ?? id,
      );
      expect(btn).toHaveAttribute('title', LABELS.emotes[id as EmoteId] ?? id);
    }
    // No extra buttons beyond the fixed subset
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(ids.length);
  });

  it('calls sendEmote with the clicked emote id', () => {
    renderBar();

    fireEvent.click(screen.getByTestId('spectator-reaction-fire'));
    expect(sendEmote).toHaveBeenCalledTimes(1);
    expect(sendEmote).toHaveBeenCalledWith('fire');
  });

  it('ignores a second click within the cooldown window', () => {
    renderBar();

    fireEvent.click(screen.getByTestId('spectator-reaction-fire'));
    expect(sendEmote).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('spectator-reaction-lol'));
    expect(sendEmote).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    fireEvent.click(screen.getByTestId('spectator-reaction-lol'));
    expect(sendEmote).toHaveBeenCalledTimes(2);
    expect(sendEmote).toHaveBeenCalledWith('lol');
  });

  it('does not send when disabled', () => {
    renderBar({ disabled: true });

    for (const btn of screen.getAllByRole('button')) {
      expect(btn).toBeDisabled();
    }

    fireEvent.click(screen.getByTestId('spectator-reaction-heart'));
    expect(sendEmote).not.toHaveBeenCalled();
  });
});

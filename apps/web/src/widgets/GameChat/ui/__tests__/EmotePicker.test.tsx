import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '@/shared/config/tamagui.config';
import { EmotePicker, EMOTES, type EmoteId } from '../EmotePicker';

function renderPicker(
  props: { onEmote?: (id: EmoteId) => void; disabled?: boolean } = {},
) {
  const onEmote = props.onEmote ?? vi.fn();
  return {
    onEmote,
    ...render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <EmotePicker onEmote={onEmote} disabled={props.disabled} />
      </TamaguiProvider>,
    ),
  };
}

describe('EmotePicker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders all 6 emotes', () => {
    renderPicker();

    for (const emote of EMOTES) {
      expect(screen.getByText(emote.emoji)).toBeTruthy();
      expect(screen.getByLabelText(emote.label)).toBeTruthy();
    }
  });

  it('calls onEmote with the correct id when an emote is pressed', () => {
    const { onEmote } = renderPicker();

    fireEvent.click(screen.getByLabelText('Good Move'));

    expect(onEmote).toHaveBeenCalledWith('good_move');
  });

  it('calls onEmote for each emote type', () => {
    const { onEmote } = renderPicker();

    for (const emote of EMOTES) {
      fireEvent.click(screen.getByLabelText(emote.label));
      expect(onEmote).toHaveBeenCalledWith(emote.id);
      act(() => {
        vi.advanceTimersByTime(2000);
      });
    }

    expect(onEmote).toHaveBeenCalledTimes(EMOTES.length);
  });

  it('enforces rate limit of 2 seconds', () => {
    const { onEmote } = renderPicker();

    fireEvent.click(screen.getByLabelText('LOL'));
    expect(onEmote).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByLabelText('LOL'));
    expect(onEmote).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    fireEvent.click(screen.getByLabelText('LOL'));
    expect(onEmote).toHaveBeenCalledTimes(2);
  });

  it('does not call onEmote when disabled', () => {
    const { onEmote } = renderPicker({ disabled: true });

    fireEvent.click(screen.getByLabelText('Nice!'));

    expect(onEmote).not.toHaveBeenCalled();
  });

  it('dims emotes during cooldown', () => {
    renderPicker();

    const btn = screen.getByLabelText('RIP');
    fireEvent.click(btn);

    expect(
      btn.closest('[role="button"]')?.getAttribute('aria-disabled'),
    ).not.toBe('true');
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpectatorReactions, SPECTATOR_REACTIONS } from './SpectatorReactions';

describe('SpectatorReactions', () => {
  it('renders dock with toggle and quick reaction buttons', () => {
    const onEmote = vi.fn();
    render(<SpectatorReactions onEmote={onEmote} />);

    expect(screen.getByTestId('spectator-reactions-dock')).toBeInTheDocument();
    expect(
      screen.getByTestId('spectator-reactions-toggle'),
    ).toBeInTheDocument();

    for (const item of SPECTATOR_REACTIONS) {
      expect(
        screen.getByTestId(`spectator-reaction-${item.id}`),
      ).toBeInTheDocument();
    }
  });

  it('calls onEmote when a reaction button is clicked', () => {
    const onEmote = vi.fn();
    render(<SpectatorReactions onEmote={onEmote} />);

    const fireBtn = screen.getByTestId('spectator-reaction-fire');
    fireEvent.click(fireBtn);

    expect(onEmote).toHaveBeenCalledWith('fire');
  });

  it('collapses and expands reaction buttons when toggle button is clicked', () => {
    const onEmote = vi.fn();
    render(<SpectatorReactions onEmote={onEmote} />);

    const toggleBtn = screen.getByTestId('spectator-reactions-toggle');
    expect(screen.getByTestId('spectator-reaction-fire')).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(
      screen.queryByTestId('spectator-reaction-fire'),
    ).not.toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.getByTestId('spectator-reaction-fire')).toBeInTheDocument();
  });
});

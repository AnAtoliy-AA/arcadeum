import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpectatorFloatingReactions } from './SpectatorFloatingReactions';

describe('SpectatorFloatingReactions', () => {
  it('renders nothing when emotes list is empty', () => {
    const { container } = render(<SpectatorFloatingReactions emotes={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders floating reaction item with emoji and sender name', () => {
    const mockEmotes = [
      {
        key: 'e-1',
        userId: 'u-1',
        emoteId: 'fire',
        laneIndex: 1,
        ts: 1000,
      },
    ];

    render(
      <SpectatorFloatingReactions
        emotes={mockEmotes}
        resolveDisplayName={(id) => (id === 'u-1' ? 'Alice' : undefined)}
      />,
    );

    expect(
      screen.getByTestId('spectator-floating-reactions-layer'),
    ).toBeInTheDocument();
    const item = screen.getByTestId('spectator-floating-reaction');
    expect(item).toBeInTheDocument();
    expect(item).toHaveAttribute('data-emote-id', 'fire');
    expect(screen.getByText('🔥')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });
});

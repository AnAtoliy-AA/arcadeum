import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoomCardAvatars } from './RoomCardAvatars';

vi.mock('@/shared/ui/PlayerAvatar', () => ({
  EquippedPlayerAvatar: ({ name }: { name: string }) => <span>{name}</span>,
}));

const members = [{ id: 'u1', displayName: 'Ann' }];

describe('RoomCardAvatars', () => {
  it('renders placeholders for open seats', () => {
    render(
      <RoomCardAvatars
        members={members}
        labelFor={(m) => m.displayName ?? m.id}
        maxPlayers={4}
        emptySlotLabel="Open seat"
      />,
    );
    expect(screen.getAllByTestId('room-card-empty-slot')).toHaveLength(3);
  });

  it('skips placeholders for large rooms', () => {
    render(
      <RoomCardAvatars
        members={members}
        labelFor={(m) => m.id}
        maxPlayers={20}
      />,
    );
    expect(screen.queryAllByTestId('room-card-empty-slot')).toHaveLength(0);
  });
});

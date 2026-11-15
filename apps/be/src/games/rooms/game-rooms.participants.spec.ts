import { removeRoomParticipant } from './game-rooms.participants';
import { GameRoom } from '../schemas/game-room.schema';

describe('removeRoomParticipant', () => {
  it('triggers bot fallback when opponent leaves a rematch room during lobby phase', () => {
    const room = {
      status: 'lobby',
      gameOptions: { rematchPreviousRoomId: 'prev-room-1' },
      participants: [
        { userId: 'host-1', joinedAt: new Date() },
        { userId: 'opponent-1', joinedAt: new Date() },
      ],
    } as unknown as GameRoom;

    const removed = removeRoomParticipant(room, 'opponent-1');

    expect(removed).toBe(true);
    expect(room.participants).toHaveLength(2);
    expect(room.participants[0].userId).toBe('host-1');
    expect(room.participants[1].userId).toMatch(/^bot-/);
  });

  it('does not trigger bot fallback if room is not a rematch room', () => {
    const room = {
      status: 'lobby',
      gameOptions: {},
      participants: [
        { userId: 'host-1', joinedAt: new Date() },
        { userId: 'opponent-1', joinedAt: new Date() },
      ],
    } as unknown as GameRoom;

    const removed = removeRoomParticipant(room, 'opponent-1');

    expect(removed).toBe(true);
    expect(room.participants).toHaveLength(1);
    expect(room.participants[0].userId).toBe('host-1');
  });
});

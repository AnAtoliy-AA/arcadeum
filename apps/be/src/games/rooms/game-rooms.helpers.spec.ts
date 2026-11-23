import { canViewRoom } from './game-rooms.helpers';
import type { GameRoom } from '../schemas/game-room.schema';

describe('canViewRoom', () => {
  const room = (extra: Partial<GameRoom> = {}) =>
    ({
      visibility: 'private',
      hostId: 'host',
      participants: [{ userId: 'host', joinedAt: new Date() }],
      gameOptions: { rematchInvitedIds: ['friend'] },
      ...extra,
    }) as unknown as GameRoom;

  it('lets an invited user open a private room to accept the invite', () => {
    expect(canViewRoom(room(), 'friend')).toBe(true);
  });

  it('still hides a private room from uninvited users and anonymous viewers', () => {
    expect(canViewRoom(room(), 'stranger')).toBe(false);
    expect(canViewRoom(room(), null)).toBe(false);
  });

  it('stops exposing the room once the invite is revoked', () => {
    expect(
      canViewRoom(room({ gameOptions: { rematchInvitedIds: [] } }), 'friend'),
    ).toBe(false);
  });
});

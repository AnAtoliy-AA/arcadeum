import { describe, expect, it } from 'vitest';
import type { GameRoomSummary } from '@/shared/types/games';
import {
  isBotRoom,
  memberLabel,
  resolveRoomCta,
  seatsLeft,
} from './roomCardUtils';

const base = {
  id: 'r1',
  gameId: 'chess_v1',
  name: 'Room',
  hostId: 'u1',
  visibility: 'public',
  playerCount: 1,
  maxPlayers: 2,
  createdAt: new Date().toISOString(),
  status: 'lobby',
} as unknown as GameRoomSummary;

const room = (patch: Partial<GameRoomSummary>): GameRoomSummary => ({
  ...base,
  ...patch,
});

describe('roomCardUtils', () => {
  it('computes seats left', () => {
    expect(seatsLeft(room({ playerCount: 1, maxPlayers: 4 }))).toBe(3);
    expect(seatsLeft(room({ playerCount: 5, maxPlayers: 4 }))).toBe(0);
    expect(seatsLeft(room({ maxPlayers: null }))).toBeNull();
  });

  it('detects bot rooms', () => {
    expect(isBotRoom(room({}))).toBe(false);
    expect(isBotRoom(room({ hostId: 'bot-abc' }))).toBe(true);
    expect(isBotRoom(room({ gameOptions: { aiVsAi: true } }))).toBe(true);
  });

  it('offers join for open lobby rooms', () => {
    expect(resolveRoomCta(room({}), false)).toBe('join');
  });

  it('marks full human rooms as full', () => {
    expect(resolveRoomCta(room({ playerCount: 2 }), false)).toBe('full');
  });

  it('keeps full bot rooms joinable', () => {
    expect(
      resolveRoomCta(room({ playerCount: 2, hostId: 'bot-x' }), false),
    ).toBe('join');
  });

  it('lets participants resume in-progress rooms', () => {
    expect(resolveRoomCta(room({ status: 'in_progress' }), true)).toBe(
      'resume',
    );
  });

  it('hides actions for in-progress rooms the viewer is not in', () => {
    expect(resolveRoomCta(room({ status: 'in_progress' }), false)).toBe('none');
  });

  it('hides actions for completed rooms', () => {
    expect(resolveRoomCta(room({ status: 'completed' }), true)).toBe('none');
  });

  it('labels members', () => {
    const labels = { guest: (id: string) => `G${id}`, bot: 'Bot' };
    expect(memberLabel({ id: 'anon_abcdef' }, labels)).toBe('Gabcd');
    expect(memberLabel({ id: 'bot-1' }, labels)).toBe('Bot');
    expect(memberLabel({ id: 'u', displayName: 'Ann' }, labels)).toBe('Ann');
  });
});

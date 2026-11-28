import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { GameRoomsBotService } from './game-rooms.bot.service';
import type { GameRoomsMapper } from './game-rooms.mapper';
import type { GameEngineRegistry } from '../engines/registry/game-engine.registry';

const HOST = new Types.ObjectId().toHexString();
const ROOM_ID = new Types.ObjectId().toHexString();

function makeService(room: Record<string, unknown>, engineMax: number) {
  const save = jest.fn().mockResolvedValue(undefined);
  const doc = { ...room, save };
  const model = {
    findById: jest.fn().mockReturnValue({ exec: () => Promise.resolve(doc) }),
  };
  const mapper = {
    prepareRoomSummary: jest.fn().mockResolvedValue({ id: ROOM_ID }),
  };
  const registry = {
    getMetadata: jest.fn().mockReturnValue({ maxPlayers: engineMax }),
  };
  const service = new GameRoomsBotService(
    model as never,
    mapper as unknown as GameRoomsMapper,
    registry as unknown as GameEngineRegistry,
  );
  return { service, doc, save };
}

function participants(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    userId: i === 0 ? HOST : `bot-${i}`,
    joinedAt: new Date(),
  }));
}

describe('GameRoomsBotService.addBotToRoom (Pachisi 4th player)', () => {
  const base = { hostId: HOST, status: 'lobby', gameId: 'pachisi_v1' };

  it('adds a second and third bot to a room that already has a bot', async () => {
    const { service, doc } = makeService(
      { ...base, maxPlayers: 4, participants: participants(2) },
      4,
    );
    await service.addBotToRoom(ROOM_ID, HOST);
    await service.addBotToRoom(ROOM_ID, HOST);
    expect(doc.participants).toHaveLength(4);
  });

  it('caps "auto" rooms (maxPlayers null) at the engine maximum', async () => {
    const { service, doc } = makeService(
      { ...base, maxPlayers: null, participants: participants(4) },
      4,
    );
    await expect(service.addBotToRoom(ROOM_ID, HOST)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(doc.participants).toHaveLength(4);
  });

  it('allows the 4th seat in an "auto" room', async () => {
    const { service, doc } = makeService(
      { ...base, maxPlayers: null, participants: participants(3) },
      4,
    );
    await service.addBotToRoom(ROOM_ID, HOST);
    expect(doc.participants).toHaveLength(4);
  });
});

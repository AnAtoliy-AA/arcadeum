import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { GameRoom } from '../schemas/game-room.schema';
import { GameRoomsMapper } from './game-rooms.mapper';
import { GameRoomSummary } from './game-rooms.types';
import { SeaBattleTeamConfigService } from './sea-battle-team-config.service';
import {
  SeaBattleGameOptions,
  SeaBattleTeamConfigEntry,
} from './sea-battle-team-config.types';

export interface FakeRoom {
  _id: string;
  hostId: string;
  status: 'lobby' | 'in_progress' | 'completed';
  participants: { userId: string; joinedAt: Date }[];
  gameOptions: Record<string, unknown>;
  updatedAt: Date;
  save: () => Promise<FakeRoom>;
  markModified: (path: string) => void;
}

export function makeRoom(overrides: Partial<FakeRoom> = {}): FakeRoom {
  const base: FakeRoom = {
    _id: 'r1',
    hostId: 'host',
    status: 'lobby',
    participants: [{ userId: 'host', joinedAt: new Date() }],
    gameOptions: {},
    updatedAt: new Date(),
    save: jest.fn(function (this: FakeRoom): Promise<FakeRoom> {
      return Promise.resolve(this);
    }),
    markModified: jest.fn(),
  };
  const room = { ...base, ...overrides };
  room.save = jest.fn((): Promise<FakeRoom> => Promise.resolve(room));
  room.markModified = jest.fn();
  return room;
}

export class FakeRoomModel {
  private rooms = new Map<string, FakeRoom>();
  set(room: FakeRoom): void {
    this.rooms.set(room._id, room);
  }
  findById(id: string): { exec: () => Promise<FakeRoom | null> } {
    const room = this.rooms.get(id) ?? null;
    return { exec: (): Promise<FakeRoom | null> => Promise.resolve(room) };
  }
}

export const mapperStub: Pick<GameRoomsMapper, 'prepareRoomSummary'> = {
  prepareRoomSummary: jest.fn((room: GameRoom): Promise<GameRoomSummary> => {
    const fake = room as unknown as FakeRoom;
    return Promise.resolve({
      id: fake._id,
      hostId: fake.hostId,
      gameOptions: fake.gameOptions,
    } as unknown as GameRoomSummary);
  }),
};

export function getOpts(room: FakeRoom): SeaBattleGameOptions {
  return room.gameOptions as SeaBattleGameOptions;
}

export function getTeams(room: FakeRoom): SeaBattleTeamConfigEntry[] {
  const teams = getOpts(room).teams;
  if (!teams) {
    throw new Error('expected teams to be set');
  }
  return teams;
}

export async function buildService(
  model: FakeRoomModel,
): Promise<SeaBattleTeamConfigService> {
  const moduleRef = await Test.createTestingModule({
    providers: [
      SeaBattleTeamConfigService,
      { provide: getModelToken(GameRoom.name), useValue: model },
      { provide: GameRoomsMapper, useValue: mapperStub },
    ],
  }).compile();
  return moduleRef.get(SeaBattleTeamConfigService);
}

import type { Page } from '@playwright/test';
import { mockGameSocket } from './socket-mocks';
import { mockRoomInfo } from './utils/room';

/**
 * Room + session fixtures for the broadcast scene specs. The states are real
 * engine output (tic-tac-toe, hearts) trimmed of logs, so the widgets render
 * exactly what the backend sends to a spectator.
 */

export const STREAM_ROOM_ID = '507f191e810c19729de860ea';

const TTT_STATE = {
  phase: 'playing',
  options: {
    theme: 'adventure',
    boardSize: 3,
    teamMode: false,
    expansionMargin: 3,
    infinityWinLength: 5,
    aiDifficulty: 'medium',
  },
  board: [
    ['O', null, null],
    [null, 'X', null],
    [null, null, null],
  ],
  winLength: 3,
  origin: {
    row: 1,
    col: 1,
  },
  playerOrder: ['bot-a', 'bot-b'],
  currentTurnIndex: 0,
  players: [
    {
      playerId: 'bot-a',
      symbol: 'X',
      alive: true,
    },
    {
      playerId: 'bot-b',
      symbol: 'O',
      alive: true,
    },
  ],
  teams: [],
  winLine: null,
  winnerId: null,
  isDraw: false,
  logs: [],
};

const HEARTS_STATE = {
  phase: 'playing',
  options: {
    passingEnabled: true,
    targetScore: 100,
    aiDifficulty: 'medium',
  },
  handNumber: 0,
  passDirection: 'left',
  hands: {
    'bot-a': [
      '2C',
      '4C',
      'QC',
      'AC',
      '3D',
      '6D',
      'KD',
      '5S',
      '7S',
      '10S',
      '2H',
      'JH',
      'KH',
    ],
    'bot-b': [
      '6C',
      '8C',
      '7D',
      '8D',
      '9D',
      '10D',
      'JD',
      '3S',
      '9S',
      'AS',
      '3H',
      '6H',
      'QH',
    ],
    'bot-c': [
      '5C',
      '7C',
      'JC',
      'KC',
      '2D',
      'QD',
      '4S',
      '8S',
      'JS',
      'QS',
      '7H',
      '10H',
      'AH',
    ],
    'bot-d': [
      '3C',
      '9C',
      '10C',
      '4D',
      '5D',
      'AD',
      '2S',
      '6S',
      'KS',
      '4H',
      '5H',
      '8H',
      '9H',
    ],
  },
  taken: {
    'bot-a': [],
    'bot-b': [],
    'bot-c': [],
    'bot-d': [],
  },
  pendingPasses: {
    'bot-a': [],
    'bot-b': [],
    'bot-c': [],
    'bot-d': [],
  },
  scores: {
    'bot-a': 0,
    'bot-b': 0,
    'bot-c': 0,
    'bot-d': 0,
  },
  handScores: {
    'bot-a': 0,
    'bot-b': 0,
    'bot-c': 0,
    'bot-d': 0,
  },
  currentTrick: {
    plays: [],
    leadSuit: null,
  },
  currentTurnIndex: 0,
  playerOrder: ['bot-a', 'bot-b', 'bot-c', 'bot-d'],
  players: [
    {
      playerId: 'bot-a',
    },
    {
      playerId: 'bot-b',
    },
    {
      playerId: 'bot-c',
    },
    {
      playerId: 'bot-d',
    },
  ],
  heartsBroken: false,
  winnerIds: null,
  winType: null,
  isDraw: false,
  logs: [],
};

export interface StreamFixture {
  gameId: string;
  players: string[];
  state: Record<string, unknown>;
}

export const STREAM_FIXTURES = {
  tic_tac_toe_v1: {
    gameId: 'tic_tac_toe_v1',
    players: ['bot-a', 'bot-b'],
    state: TTT_STATE,
  },
  hearts_v1: {
    gameId: 'hearts_v1',
    players: ['bot-a', 'bot-b', 'bot-c', 'bot-d'],
    state: HEARTS_STATE,
  },
} satisfies Record<string, StreamFixture>;

export interface StreamRoomOptions {
  status?: 'in_progress' | 'completed';
  state?: Record<string, unknown>;
}

export function streamSession(
  fixture: StreamFixture,
  options: StreamRoomOptions = {},
) {
  return {
    id: 'stream-session-1',
    roomId: STREAM_ROOM_ID,
    gameId: fixture.gameId,
    engine: fixture.gameId,
    status: options.status === 'completed' ? 'completed' : 'active',
    state: options.state ?? fixture.state,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:05.000Z',
  };
}

/** Mocks room-info and the games socket for an AI-vs-AI room. */
export async function mockStreamRoom(
  page: Page,
  fixture: StreamFixture,
  options: StreamRoomOptions = {},
): Promise<void> {
  const members = fixture.players.map((id, i) => ({
    id,
    userId: id,
    displayName: `Bot ${i + 1}`,
    isHost: i === 0,
  }));
  const room = {
    id: STREAM_ROOM_ID,
    name: 'AI vs AI',
    gameId: fixture.gameId,
    status: options.status ?? 'in_progress',
    visibility: 'public',
    hostId: fixture.players[0],
    maxPlayers: fixture.players.length,
    playerCount: fixture.players.length,
    members,
    gameOptions: { aiVsAi: true, botDifficulty: 'expert', theme: 'adventure' },
  };
  const session = streamSession(fixture, options);
  await mockRoomInfo(page, { room, session });
  await mockGameSocket(page, STREAM_ROOM_ID, 'viewer', {
    gameId: fixture.gameId,
    roomJoinedPayload: { ...room, session },
  });
}

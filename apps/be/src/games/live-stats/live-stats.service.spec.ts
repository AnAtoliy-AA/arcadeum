import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { LiveStatsService } from './live-stats.service';
import { GameRoom } from '../schemas/game-room.schema';
import { PlayerStatRecord } from '../schemas/player-stat-record.schema';
import { User } from '../../auth/schemas/user.schema';
import { SocialRewardClaim } from '../../social-rewards/schemas/social-reward-claim.schema';
import { GamesRealtimeService } from '../games.realtime.service';
import {
  OCI_CONNECTION,
  ATLAS_CONNECTION,
} from '../../common/providers/mongo-connections.provider';

describe('LiveStatsService', () => {
  let service: LiveStatsService;
  let mockRoomModel: {
    countDocuments: jest.Mock;
    find: jest.Mock;
  };
  let mockPlayerStatModel: {
    countDocuments: jest.Mock;
    estimatedDocumentCount: jest.Mock;
    find: jest.Mock;
    aggregate: jest.Mock;
  };
  let mockUserModel: {
    find: jest.Mock;
    countDocuments: jest.Mock;
    estimatedDocumentCount: jest.Mock;
  };
  let mockClaimModel: {
    countDocuments: jest.Mock;
    estimatedDocumentCount: jest.Mock;
    aggregate: jest.Mock;
  };
  let mockRealtimeService: {
    lobbyChannel: jest.Mock;
    emitToRoom: jest.Mock;
  };

  beforeEach(async () => {
    mockRoomModel = {
      countDocuments: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(5),
      }),
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([
                {
                  _id: 'room-1',
                  gameId: 'chess_v1',
                  name: 'Grandmaster Clash',
                  hostId: '507f1f77bcf86cd799439011',
                  participants: ['507f1f77bcf86cd799439011'],
                  maxPlayers: 2,
                  status: 'lobby',
                  createdAt: new Date().toISOString(),
                },
              ]),
            }),
          }),
        }),
      }),
      aggregate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      }),
    };

    mockPlayerStatModel = {
      countDocuments: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(42),
      }),
      estimatedDocumentCount: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(42),
      }),
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([
                {
                  _id: 'rec-1',
                  gameId: 'chess_v1',
                  userId: '507f1f77bcf86cd799439012',
                  result: 'won',
                  timestamp: Date.now(),
                },
              ]),
            }),
          }),
        }),
      }),
      aggregate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          { _id: 'chess_v1', matches: 20 },
          { _id: 'sea_battle_v1', matches: 15 },
        ]),
      }),
    };

    mockUserModel = {
      countDocuments: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(128),
      }),
      estimatedDocumentCount: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(128),
      }),
      find: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([
              {
                _id: '507f1f77bcf86cd799439011',
                username: 'Alice',
                displayName: 'Alice G',
              },
              {
                _id: '507f1f77bcf86cd799439012',
                username: 'Bob',
                displayName: 'Bob King',
              },
            ]),
          }),
        }),
      }),
    };

    mockClaimModel = {
      countDocuments: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(75),
      }),
      estimatedDocumentCount: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(75),
      }),
      aggregate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          { _id: 'discord', count: 45 },
          { _id: 'telegram', count: 30 },
        ]),
      }),
    };

    mockRealtimeService = {
      lobbyChannel: jest.fn().mockReturnValue('games-lobby'),
      emitToRoom: jest.fn(),
      getConnectedUsersCount: jest.fn().mockReturnValue(12),
      getConnectedSocketsCount: jest.fn().mockReturnValue(15),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LiveStatsService,
        {
          provide: getModelToken(GameRoom.name, OCI_CONNECTION),
          useValue: mockRoomModel,
        },
        {
          provide: getModelToken(PlayerStatRecord.name, OCI_CONNECTION),
          useValue: mockPlayerStatModel,
        },
        {
          provide: getModelToken(User.name, ATLAS_CONNECTION),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(SocialRewardClaim.name),
          useValue: mockClaimModel,
        },
        {
          provide: GamesRealtimeService,
          useValue: mockRealtimeService,
        },
      ],
    }).compile();

    service = module.get<LiveStatsService>(LiveStatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return aggregated live stats', async () => {
    const stats = await service.getLiveStats();
    expect(stats).toBeDefined();
    expect(stats.activeGames).toBe(5);
    expect(stats.waitingRooms).toBe(5);
    expect(stats.waitingPlayers).toBe(0);
    expect(stats.matchesToday).toBe(42);
    expect(stats.totalUsers).toBe(128);
    expect(stats.totalMatches).toBe(42);
    expect(stats.totalSubscribers).toBe(75);
    expect(stats.platformSubscribers.discord).toBe(45);
    expect(stats.platformSubscribers.telegram).toBe(30);
    expect(stats.onlineUsers).toBeGreaterThan(0);
    expect(stats.openRooms).toHaveLength(1);
    expect(stats.openRooms[0].hostName).toBe('Alice G');
    expect(stats.recentActivity).toHaveLength(1);
    expect(stats.recentActivity[0].username).toBe('Bob King');
    expect(stats.popularGames.length).toBeGreaterThan(0);
  });

  it('should broadcast live stats to lobby channel', () => {
    const mockData = {
      onlineUsers: 100,
      totalUsers: 128,
      totalMatches: 42,
      totalSubscribers: 75,
      platformSubscribers: { discord: 45 },
      activeGames: 10,
      waitingRooms: 4,
      waitingPlayers: 0,
      matchesToday: 50,
      popularGames: [],
      openRooms: [],
      recentActivity: [],
    };
    service.broadcastLiveStats(mockData);
    expect(mockRealtimeService.emitToRoom).toHaveBeenCalledWith(
      'games-lobby',
      'games.live_stats',
      mockData,
    );
  });
});

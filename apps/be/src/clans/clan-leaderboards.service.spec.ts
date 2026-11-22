import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ClanLeaderboardsService } from './clan-leaderboards.service';
import { NotFoundException } from '@nestjs/common';

describe('ClanLeaderboardsService', () => {
  let service: ClanLeaderboardsService;

  const mockClanModel = {
    countDocuments: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
  };

  const mockClanMemberModel = {
    find: jest.fn(),
  };

  const mockUserModel = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClanLeaderboardsService,
        { provide: getModelToken('Clan'), useValue: mockClanModel },
        { provide: getModelToken('ClanMember'), useValue: mockClanMemberModel },
        { provide: getModelToken('User'), useValue: mockUserModel },
      ],
    }).compile();

    service = module.get<ClanLeaderboardsService>(ClanLeaderboardsService);
    jest.clearAllMocks();
  });

  describe('getClanLeaderboard', () => {
    it('should return ranked clan entries sorted by wins', async () => {
      mockClanModel.countDocuments.mockResolvedValue(2);
      const clanId1 = new Types.ObjectId();
      const clanId2 = new Types.ObjectId();

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([
          {
            _id: clanId1,
            name: 'Alpha Clan',
            tag: 'ALPH',
            description: 'Top clan',
            avatarUrl: null,
            memberCount: 10,
            totalWins: 50,
            totalGames: 60,
          },
          {
            _id: clanId2,
            name: 'Beta Clan',
            tag: 'BETA',
            description: 'Second clan',
            avatarUrl: null,
            memberCount: 8,
            totalWins: 30,
            totalGames: 45,
          },
        ]),
      };
      mockClanModel.find.mockReturnValue(mockQuery);

      const result = await service.getClanLeaderboard('wins', 20, 0);

      expect(result.total).toBe(2);
      expect(result.entries).toHaveLength(2);
      expect(result.entries[0].rank).toBe(1);
      expect(result.entries[0].name).toBe('Alpha Clan');
      expect(result.entries[0].winRate).toBe(83);
      expect(result.entries[1].rank).toBe(2);
    });

    it('should calculate winRate and sort clans when sortBy is winRate', async () => {
      mockClanModel.countDocuments.mockResolvedValue(2);
      const clanId1 = new Types.ObjectId();
      const clanId2 = new Types.ObjectId();

      mockClanModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          {
            _id: clanId1,
            name: 'Clan Low',
            tag: 'LOW',
            description: '',
            avatarUrl: null,
            memberCount: 5,
            totalWins: 10,
            totalGames: 50,
          },
          {
            _id: clanId2,
            name: 'Clan High',
            tag: 'HIGH',
            description: '',
            avatarUrl: null,
            memberCount: 5,
            totalWins: 40,
            totalGames: 50,
          },
        ]),
      });

      const result = await service.getClanLeaderboard('winRate', 10, 0);

      expect(result.entries[0].name).toBe('Clan High');
      expect(result.entries[0].winRate).toBe(80);
      expect(result.entries[1].name).toBe('Clan Low');
      expect(result.entries[1].winRate).toBe(20);
    });
  });

  describe('getClanMvpMembers', () => {
    it('should throw NotFoundException for invalid clan ID', async () => {
      await expect(service.getClanMvpMembers('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return mvp member ranking', async () => {
      const clanId = new Types.ObjectId();
      const userId1 = new Types.ObjectId();

      mockClanModel.findById.mockResolvedValue({ _id: clanId });

      mockClanMemberModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([
          {
            _id: new Types.ObjectId(),
            userId: userId1,
            role: 'leader',
            wins: 25,
            gamesPlayed: 30,
          },
        ]),
      });

      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([
          {
            _id: userId1,
            username: 'MVPPlayer',
            displayName: 'Top Player',
            equippedAvatarId: 'avatar_1',
          },
        ]),
      });

      const result = await service.getClanMvpMembers(clanId.toString(), 10);

      expect(result).toHaveLength(1);
      expect(result[0].rank).toBe(1);
      expect(result[0].username).toBe('MVPPlayer');
      expect(result[0].wins).toBe(25);
      expect(result[0].winRate).toBe(83);
    });
  });
});

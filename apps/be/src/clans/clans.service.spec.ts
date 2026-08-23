import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ClansService } from './clans.service';
import { ClansGateway } from './clans.gateway';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';

const VALID_USER_ID = new Types.ObjectId().toString();
const VALID_CLAN_ID = new Types.ObjectId().toString();

describe('ClansService', () => {
  let service: ClansService;

  const mockClanModel = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
  };

  const mockClanMemberModel = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndDelete: jest.fn(),
    updateOne: jest.fn(),
  };

  const mockUserModel = {
    find: jest.fn(),
    findById: jest.fn(),
  };

  const mockGateway = {
    emitClanMemberJoined: jest.fn(),
    emitClanMemberLeft: jest.fn(),
    emitClanMemberRemoved: jest.fn(),
    emitClanUpdated: jest.fn(),
    isUserOnline: jest.fn().mockReturnValue(false),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClansService,
        { provide: getModelToken('Clan'), useValue: mockClanModel },
        { provide: getModelToken('ClanMember'), useValue: mockClanMemberModel },
        { provide: getModelToken('User'), useValue: mockUserModel },
        { provide: ClansGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<ClansService>(ClansService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createClan', () => {
    it('should create a clan successfully', async () => {
      mockClanModel.findOne.mockResolvedValue(null);
      mockClanMemberModel.findOne.mockResolvedValue(null);
      mockClanModel.create.mockResolvedValue({
        _id: new Types.ObjectId(),
        name: 'TestClan',
        tag: 'TST',
        description: '',
        avatarUrl: null,
        leaderId: new Types.ObjectId(),
        memberCount: 1,
        memberUserIds: [new Types.ObjectId()],
        visibility: 'public',
        inviteCode: 'abc123',
        totalWins: 0,
        totalGames: 0,
        createdAt: new Date(),
      });
      mockClanMemberModel.create.mockResolvedValue({});

      const result = await service.createClan(VALID_USER_ID, {
        name: 'TestClan',
        tag: 'TST',
      });

      expect(result.name).toBe('TestClan');
      expect(result.tag).toBe('TST');
      expect(mockClanModel.create).toHaveBeenCalled();
      expect(mockClanMemberModel.create).toHaveBeenCalled();
    });

    it('should throw if name/tag already exists', async () => {
      mockClanModel.findOne.mockResolvedValue({ name: 'TestClan' });

      await expect(
        service.createClan(VALID_USER_ID, { name: 'TestClan', tag: 'TST' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw if user is already in a clan', async () => {
      mockClanModel.findOne.mockResolvedValue(null);
      mockClanMemberModel.findOne.mockResolvedValue({ clanId: 'someClan' });

      await expect(
        service.createClan(VALID_USER_ID, { name: 'NewClan', tag: 'NEW' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('joinClan', () => {
    it('should throw if clan not found', async () => {
      mockClanModel.findById.mockResolvedValue(null);

      await expect(
        service.joinClan(VALID_USER_ID, VALID_CLAN_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if clan is full', async () => {
      mockClanModel.findById.mockResolvedValue({
        _id: new Types.ObjectId(),
        memberCount: 50,
        memberUserIds: [],
        save: jest.fn(),
      });

      await expect(
        service.joinClan(VALID_USER_ID, VALID_CLAN_ID),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('leaveClan', () => {
    it('should throw if clan not found', async () => {
      mockClanModel.findById.mockResolvedValue(null);

      await expect(
        service.leaveClan(VALID_USER_ID, VALID_CLAN_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if user is leader', async () => {
      const userId = new Types.ObjectId();
      mockClanModel.findById.mockResolvedValue({
        _id: new Types.ObjectId(),
        leaderId: userId,
      });

      await expect(
        service.leaveClan(userId.toString(), 'clanId'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getClanById', () => {
    it('should return null for non-existent clan', async () => {
      mockClanModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      const result = await service.getClanById('nonexistent');
      expect(result).toBeNull();
    });

    it('should return clan view for existing clan', async () => {
      const clanId = new Types.ObjectId();
      mockClanModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: clanId,
          name: 'TestClan',
          tag: 'TST',
          description: 'A test clan',
          avatarUrl: null,
          leaderId: new Types.ObjectId(),
          memberCount: 5,
          memberUserIds: [],
          visibility: 'public',
          inviteCode: 'abc',
          totalWins: 10,
          totalGames: 20,
          createdAt: new Date(),
        }),
      });

      const result = await service.getClanById(clanId.toString());
      expect(result).not.toBeNull();
      expect(result!.name).toBe('TestClan');
    });
  });
});

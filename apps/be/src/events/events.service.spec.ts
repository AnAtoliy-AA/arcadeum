import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EventsService } from './events.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('EventsService', () => {
  let service: EventsService;

  const sampleEventId = new Types.ObjectId();
  const sampleUserId = new Types.ObjectId();

  const mockLeanEvent = {
    _id: sampleEventId,
    title: 'Friday Night Blitz Chess',
    description: 'Quick matches with double points.',
    gameType: 'chess',
    status: 'upcoming',
    startTime: new Date(Date.now() + 3600 * 1000),
    endTime: new Date(Date.now() + 7200 * 1000),
    prizeBadge: 'champion_crown',
    participants: [
      {
        userId: sampleUserId,
        displayName: 'PlayerOne',
        avatarUrl: null,
        gamesPlayed: 2,
        wins: 1,
        points: 4,
        registeredAt: new Date(),
      },
    ],
    activeGamesCount: 1,
    mvpUserId: sampleUserId,
    mvpDisplayName: 'PlayerOne',
    mvpPoints: 4,
    createdAt: new Date(),
  };

  const mockQuery = {
    select: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([mockLeanEvent]),
  };

  const mockFindOneQuery = {
    select: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(mockLeanEvent),
  };

  const mockFindByIdQuery = {
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(mockLeanEvent),
  };

  const mockEventModel = {
    find: jest.fn().mockReturnValue(mockQuery),
    findOne: jest.fn().mockReturnValue(mockFindOneQuery),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn().mockResolvedValue(1),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getModelToken('GameNightEvent'),
          useValue: mockEventModel,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getEvents', () => {
    it('should return list of event views', async () => {
      mockEventModel.find.mockReturnValue(mockQuery);
      mockQuery.exec.mockResolvedValue([mockLeanEvent]);

      const result = await service.getEvents();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Friday Night Blitz Chess');
      expect(result[0].id).toBe(sampleEventId.toString());
    });
  });

  describe('getFeaturedEvent', () => {
    it('should return first active or upcoming event', async () => {
      mockEventModel.find.mockReturnValue(mockQuery);
      mockQuery.exec.mockResolvedValue([mockLeanEvent]);

      const result = await service.getFeaturedEvent();
      expect(result).not.toBeNull();
      expect(result?.title).toBe('Friday Night Blitz Chess');
    });
  });

  describe('getEventById', () => {
    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.getEventById('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if event does not exist', async () => {
      const validId = new Types.ObjectId().toString();
      mockEventModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getEventById(validId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return event details with sorted leaderboard', async () => {
      mockEventModel.findById.mockReturnValue(mockFindByIdQuery);
      mockFindByIdQuery.exec.mockResolvedValue(mockLeanEvent);

      const result = await service.getEventById(sampleEventId.toString());
      expect(result.id).toBe(sampleEventId.toString());
      expect(result.leaderboard).toHaveLength(1);
      expect(result.leaderboard[0].displayName).toBe('PlayerOne');
    });
  });

  describe('createEvent', () => {
    it('should throw if end time is before start time', async () => {
      await expect(
        service.createEvent({
          title: 'Night 1',
          gameType: 'chess',
          startTime: new Date(Date.now() + 10000).toISOString(),
          endTime: new Date(Date.now()).toISOString(),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create event successfully', async () => {
      mockEventModel.create.mockResolvedValue({
        _id: sampleEventId,
      });
      mockEventModel.findById.mockReturnValue(mockFindByIdQuery);
      mockFindByIdQuery.exec.mockResolvedValue(mockLeanEvent);

      const result = await service.createEvent({
        title: 'Friday Night Blitz Chess',
        gameType: 'chess',
        startTime: new Date(Date.now() + 1000).toISOString(),
        endTime: new Date(Date.now() + 10000).toISOString(),
      });

      expect(result.title).toBe('Friday Night Blitz Chess');
    });
  });

  describe('joinEvent', () => {
    it('should add participant and return updated event detail', async () => {
      const mockDoc = {
        _id: sampleEventId,
        participants: [],
        save: jest.fn().mockResolvedValue(true),
      };
      mockEventModel.findById
        .mockResolvedValueOnce(mockDoc)
        .mockReturnValueOnce(mockFindByIdQuery);
      mockFindByIdQuery.exec.mockResolvedValue(mockLeanEvent);

      const result = await service.joinEvent(
        sampleEventId.toString(),
        sampleUserId.toString(),
        'NewUser',
      );

      expect(mockDoc.save).toHaveBeenCalled();
      expect(result.id).toBe(sampleEventId.toString());
    });
  });

  describe('recordMatchResult', () => {
    it('should update participant score and mvp stats', async () => {
      const mockDoc = {
        _id: sampleEventId,
        participants: [
          {
            userId: sampleUserId,
            displayName: 'PlayerOne',
            avatarUrl: null,
            gamesPlayed: 1,
            wins: 1,
            points: 3,
            registeredAt: new Date(),
          },
        ],
        mvpUserId: null,
        mvpDisplayName: null,
        mvpPoints: 0,
        save: jest.fn().mockResolvedValue(true),
      };

      mockEventModel.findById
        .mockResolvedValueOnce(mockDoc)
        .mockReturnValueOnce(mockFindByIdQuery);
      mockFindByIdQuery.exec.mockResolvedValue(mockLeanEvent);

      const result = await service.recordMatchResult(sampleEventId.toString(), {
        userId: sampleUserId.toString(),
        displayName: 'PlayerOne',
        won: true,
      });

      expect(mockDoc.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });
});

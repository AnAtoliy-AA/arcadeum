import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EngagementService } from './engagement.service';
import { EngagementEvent } from './schemas/engagement-event.schema';

describe('EngagementService', () => {
  let service: EngagementService;
  let mockModel: {
    find: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
  };

  class MockModelInstance {
    userId: string;
    eventType: string;
    targetUserId?: string;
    metadata: Record<string, unknown>;
    isClaimed: boolean;

    constructor(data: {
      userId: string;
      eventType: string;
      targetUserId?: string;
      metadata?: Record<string, unknown>;
      isClaimed?: boolean;
    }) {
      this.userId = data.userId;
      this.eventType = data.eventType;
      this.targetUserId = data.targetUserId;
      this.metadata = data.metadata ?? {};
      this.isClaimed = data.isClaimed ?? false;
    }

    save = jest.fn().mockResolvedValue(this);
  }

  beforeEach(async () => {
    mockModel = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EngagementService,
        {
          provide: getModelToken(EngagementEvent.name),
          useValue: Object.assign(MockModelInstance, mockModel),
        },
      ],
    }).compile();

    service = module.get<EngagementService>(EngagementService);
  });

  it('evaluates winback offers based on inactivity days', () => {
    const active = service.evaluateWinbackOffer(0);
    expect(active).toBeNull();

    const shortInactive = service.evaluateWinbackOffer(2);
    expect(shortInactive?.type).toBe('streak_freeze');
    expect(shortInactive?.rewardCoins).toBe(50);

    const longInactive = service.evaluateWinbackOffer(10);
    expect(longInactive?.type).toBe('mystery_box');
    expect(longInactive?.rewardCoins).toBe(150);
  });

  it('records an engagement trigger event', async () => {
    const event = await service.recordEvent('user-1', {
      eventType: 'rivalry_beat_score',
      targetUserId: 'user-2',
      metadata: { game: 'sea-battle', score: 100 },
    });

    expect(event.userId).toBe('user-1');
    expect(event.eventType).toBe('rivalry_beat_score');
  });
});

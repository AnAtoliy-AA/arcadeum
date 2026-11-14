import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { OCI_CONNECTION } from '../common/providers/mongo-connections.provider';
import { ArcadePetService } from './arcade-pet.service';
import { ArcadePet } from './schemas/arcade-pet.schema';

describe('ArcadePetService', () => {
  let service: ArcadePetService;
  let mockModel: {
    findOne: jest.Mock;
    save: jest.Mock;
  };

  const userId = new Types.ObjectId().toHexString();

  beforeEach(async () => {
    const mockDoc = {
      _id: new Types.ObjectId(),
      userId: new Types.ObjectId(userId),
      name: 'ArcadePet',
      species: 'slime',
      stage: 'baby',
      theme: 'retro',
      stats: {
        hunger: 80,
        happiness: 80,
        energy: 90,
        hygiene: 100,
        discipline: 50,
        health: 90,
        weight: 5,
        level: 1,
        xp: 0,
      },
      timestamps: {
        bornAt: Date.now(),
        lastInteractedAt: Date.now(),
        lastFedAt: Date.now(),
        lastSleptAt: Date.now(),
        lastCleanedAt: Date.now(),
        lastTrainedAt: Date.now(),
      },
      isSleeping: false,
      poopCount: 0,
      isSick: false,
      inventory: new Map([['chess_cookie', 2]]),
      careMistakes: 0,
      mood: 'happy',
      save: jest.fn().mockResolvedValue(true),
    };

    mockModel = {
      findOne: jest.fn().mockResolvedValue(mockDoc),
      save: jest.fn().mockResolvedValue(mockDoc),
    };

    function MockPetModel(this: unknown, data: unknown) {
      Object.assign(this as object, data, {
        save: jest.fn().mockResolvedValue(true),
      });
    }
    MockPetModel.findOne = mockModel.findOne;

    const module = await Test.createTestingModule({
      providers: [
        ArcadePetService,
        {
          provide: getModelToken(ArcadePet.name, OCI_CONNECTION),
          useValue: MockPetModel,
        },
      ],
    }).compile();

    service = module.get<ArcadePetService>(ArcadePetService);
  });

  it('fetches existing pet and returns state', async () => {
    const pet = await service.getOrCreatePet(userId);
    expect(pet).toBeDefined();
    expect(pet.name).toBe('ArcadePet');
    expect(pet.stage).toBe('baby');
  });

  it('executes feeding action successfully', async () => {
    const result = await service.executeAction(userId, {
      action: 'feed_snack',
    });
    expect(result.success).toBe(true);
    expect(result.messageCode).toBe('fed_snack');
  });

  it('rewards treats to inventory', async () => {
    const result = await service.rewardTreat(userId, 'chess_cookie');
    expect(result.inventory.chess_cookie).toBeGreaterThanOrEqual(1);
  });
});

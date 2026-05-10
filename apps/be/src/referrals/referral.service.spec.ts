import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { ReferralService } from './referral.service';
import { Referral } from './schemas/referral.schema';
import { ReferralReward } from './schemas/referral-reward.schema';
import { User } from '../auth/schemas/user.schema';
import { WalletService } from '../wallet/wallet.service';

const makeObjectId = () => new Types.ObjectId().toHexString();

describe('ReferralService', () => {
  let service: ReferralService;
  let walletService: { credit: jest.Mock };

  const referrerId = makeObjectId();
  const referredUserId = makeObjectId();

  // Shared mock model factories — reset between each test
  const referralModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
  };
  const rewardModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
  };
  const userModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    walletService = { credit: jest.fn().mockResolvedValue({}) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferralService,
        { provide: getModelToken(Referral.name), useValue: referralModel },
        { provide: getModelToken(ReferralReward.name), useValue: rewardModel },
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: WalletService, useValue: walletService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(() => undefined),
          },
        },
      ],
    }).compile();

    service = module.get(ReferralService);

    // Default stubs for a valid, non-duplicate referral
    userModel.findOne.mockReturnValue({
      exec: () =>
        Promise.resolve({
          id: referrerId,
          referralCode: 'CODE',
        }),
    });
    referralModel.findOne.mockResolvedValue(null);
    referralModel.create.mockResolvedValue({
      _id: new Types.ObjectId(),
    });
    userModel.findByIdAndUpdate.mockResolvedValue({});
    referralModel.countDocuments.mockResolvedValue(0);
    rewardModel.findOne.mockResolvedValue({ rewardId: 'existing' }); // already granted
    rewardModel.find.mockResolvedValue([]);
    userModel.findById.mockResolvedValue({
      referralCode: 'CODE',
      save: jest.fn().mockResolvedValue(undefined),
    });
  });

  describe('generateReferralCode', () => {
    it('returns an 8-character string from the allowed charset', () => {
      const code = service.generateReferralCode();
      expect(code).toHaveLength(8);
      expect(code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/);
    });
  });

  describe('trackReferral — guards', () => {
    it('returns early on invalid referral code without wallet call', async () => {
      userModel.findOne.mockReturnValueOnce({
        exec: () => Promise.resolve(null),
      });

      await service.trackReferral('BAD', referredUserId);

      expect(walletService.credit).not.toHaveBeenCalled();
    });

    it('returns early on self-referral without wallet call', async () => {
      userModel.findOne.mockReturnValueOnce({
        exec: () =>
          Promise.resolve({
            id: referredUserId, // referrer id === referred id
            referralCode: 'CODE',
          }),
      });

      await service.trackReferral('CODE', referredUserId);

      expect(walletService.credit).not.toHaveBeenCalled();
    });

    it('returns early on duplicate referredUserId without wallet call', async () => {
      referralModel.findOne.mockResolvedValueOnce({ referredUserId });

      await service.trackReferral('CODE', referredUserId);

      expect(walletService.credit).not.toHaveBeenCalled();
    });
  });

  describe('per-referral coin payout', () => {
    it('credits the referrer the configured amount on a successful trackReferral', async () => {
      const referralId = new Types.ObjectId();
      referralModel.create.mockResolvedValueOnce({ _id: referralId });

      await service.trackReferral('CODE', referredUserId);

      expect(walletService.credit).toHaveBeenCalledWith(
        referrerId,
        'coins',
        50,
        'referral_bonus',
        `referral-${referralId.toHexString()}-payout-${referrerId}`,
        expect.objectContaining({
          referralId: referralId.toHexString(),
          referredUserId,
        }),
      );
    });

    it('logs and continues when wallet.credit throws', async () => {
      walletService.credit.mockRejectedValueOnce(new Error('wallet-down'));

      await expect(
        service.trackReferral('CODE', referredUserId),
      ).resolves.not.toThrow();
    });

    it('skips wallet path when REFERRAL_REWARD_COINS_PER is 0', async () => {
      const zeroModule = await Test.createTestingModule({
        providers: [
          ReferralService,
          { provide: getModelToken(Referral.name), useValue: referralModel },
          {
            provide: getModelToken(ReferralReward.name),
            useValue: rewardModel,
          },
          { provide: getModelToken(User.name), useValue: userModel },
          { provide: WalletService, useValue: walletService },
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((k: string) =>
                k === 'REFERRAL_REWARD_COINS_PER' ? '0' : undefined,
              ),
            },
          },
        ],
      }).compile();

      const zeroService = zeroModule.get(ReferralService);

      jest.clearAllMocks();
      userModel.findOne.mockReturnValue({
        exec: () =>
          Promise.resolve({
            id: referrerId,
            referralCode: 'CODE',
          }),
      });
      referralModel.findOne.mockResolvedValue(null);
      referralModel.create.mockResolvedValue({ _id: new Types.ObjectId() });
      userModel.findByIdAndUpdate.mockResolvedValue({});
      referralModel.countDocuments.mockResolvedValue(0);
      rewardModel.findOne.mockResolvedValue({ rewardId: 'existing' });

      await zeroService.trackReferral('CODE', referredUserId);

      const perReferralCalls = walletService.credit.mock.calls.filter(
        (c) => (c as unknown[])[3] === 'referral_bonus',
      );
      expect(perReferralCalls).toHaveLength(0);
    });
  });
});

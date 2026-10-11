import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import {
  UserDataSegregationService,
  ProvisionUserParams,
} from './user-data-segregation.service';
import { UserAuthDocument } from '../schemas/user-auth.schema';
import { UserProfileDocument } from '../schemas/user-profile.schema';
import { UserWalletDocument } from '../schemas/user-wallet.schema';

describe('UserDataSegregationService', () => {
  let service: UserDataSegregationService;
  let mockUserAuthModel: Partial<
    Record<keyof Model<UserAuthDocument>, jest.Mock>
  >;
  let mockUserProfileModel: Partial<
    Record<keyof Model<UserProfileDocument>, jest.Mock>
  >;
  let mockUserWalletModel: Partial<
    Record<keyof Model<UserWalletDocument>, jest.Mock>
  >;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'PII_ENCRYPTION_KEY') {
          return 'test-encryption-key-for-unit-tests-32';
        }
        if (key === 'PII_INDEX_KEY') {
          return 'test-index-key-for-unit-tests-32';
        }
        return undefined;
      }),
    };

    mockUserAuthModel = {
      findOneAndUpdate: jest.fn(),
      findOne: jest.fn(),
      updateOne: jest.fn(),
    };

    mockUserProfileModel = {
      findOneAndUpdate: jest.fn(),
      findOne: jest.fn(),
    };

    mockUserWalletModel = {
      findOneAndUpdate: jest.fn(),
      findOne: jest.fn(),
    };

    service = new UserDataSegregationService(
      mockUserAuthModel as unknown as Model<UserAuthDocument>,
      mockUserProfileModel as unknown as Model<UserProfileDocument>,
      mockUserWalletModel as unknown as Model<UserWalletDocument>,
      mockConfigService as ConfigService,
    );
  });

  describe('envelope encryption & per-user DEK', () => {
    it('creates envelope with per-user DEK and decrypts correctly', () => {
      const email = 'SecurePlayer@Arcadeum.io';
      const envelope = service.createEnvelopeForUser(email);

      expect(envelope.emailEncrypted).toBeDefined();
      expect(envelope.encryptedDek).toBeDefined();
      expect(envelope.emailBlindIndex).toHaveLength(64);

      const decrypted = service.decryptUserEnvelope(
        envelope.emailEncrypted,
        envelope.encryptedDek,
        'user-123',
      );
      expect(decrypted).toBe('secureplayer@arcadeum.io');
    });

    it('falls back to master key decryption when encryptedDek is absent', () => {
      const email = 'legacy@arcadeum.io';
      const legacyEncrypted = service.encryptEmail(email);

      const decrypted = service.decryptUserEnvelope(
        legacyEncrypted.emailEncrypted,
        null,
      );
      expect(decrypted).toBe(email);
    });

    it('returns null if encryptedDek is corrupted', () => {
      const envelope = service.createEnvelopeForUser('test@arcadeum.io');
      const decrypted = service.decryptUserEnvelope(
        envelope.emailEncrypted,
        'corrupted-dek',
      );
      expect(decrypted).toBeNull();
    });
  });

  describe('crypto-shredding', () => {
    it('nullifies encryptedDek to permanently shred PII', async () => {
      const userId = new Types.ObjectId();
      (mockUserAuthModel.updateOne as jest.Mock).mockResolvedValue({
        modifiedCount: 1,
      });

      const success = await service.cryptoShredUser(userId);
      expect(success).toBe(true);

      const updateCalls = (mockUserAuthModel.updateOne as jest.Mock).mock.calls;
      expect(updateCalls.length).toBe(1);
      const firstCall = updateCalls[0] as [
        { userId: Types.ObjectId },
        { $set: { encryptedDek: null; deletedAt: Date } },
      ];
      expect(firstCall[0]).toEqual({ userId });
      expect(firstCall[1].$set.encryptedDek).toBeNull();
      expect(firstCall[1].$set.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('provisionSegregatedUserData', () => {
    it('provisions isolated auth, profile, and wallet records with envelope keys', async () => {
      const userId = new Types.ObjectId();
      const params: ProvisionUserParams = {
        userId,
        email: 'hero@arcadeum.io',
        passwordHash: '$2b$10$hashedpassword',
        username: 'ArcadeHero',
        displayName: 'The Arcade Hero',
        role: 'free',
        countryCode: 'US',
      };

      const mockAuthDoc = {
        userId,
        emailEncrypted: 'enc',
        encryptedDek: 'dek',
        emailBlindIndex: 'idx',
      } as unknown as UserAuthDocument;
      const mockProfileDoc = {
        userId,
        username: 'ArcadeHero',
      } as unknown as UserProfileDocument;
      const mockWalletDoc = {
        userId,
        coins: 0,
        gems: 0,
      } as unknown as UserWalletDocument;

      (mockUserAuthModel.findOneAndUpdate as jest.Mock).mockResolvedValue(
        mockAuthDoc,
      );
      (mockUserProfileModel.findOneAndUpdate as jest.Mock).mockResolvedValue(
        mockProfileDoc,
      );
      (mockUserWalletModel.findOneAndUpdate as jest.Mock).mockResolvedValue(
        mockWalletDoc,
      );

      const result = await service.provisionSegregatedUserData(params);

      const authCalls = (mockUserAuthModel.findOneAndUpdate as jest.Mock).mock
        .calls;
      expect(authCalls.length).toBe(1);
      const firstAuthCall = authCalls[0] as [
        { userId: Types.ObjectId },
        {
          $setOnInsert: {
            userId: Types.ObjectId;
            role: string;
            encryptedDek: string;
          };
        },
        { upsert: boolean; new: boolean },
      ];
      expect(firstAuthCall[0]).toEqual({ userId });
      expect(firstAuthCall[1].$setOnInsert.userId).toEqual(userId);
      expect(firstAuthCall[1].$setOnInsert.role).toEqual('free');
      expect(firstAuthCall[1].$setOnInsert.encryptedDek).toBeDefined();
      expect(firstAuthCall[2]).toEqual({ upsert: true, new: true });

      expect(result.auth).toBe(mockAuthDoc);
      expect(result.profile).toBe(mockProfileDoc);
      expect(result.wallet).toBe(mockWalletDoc);
    });
  });

  describe('domain lookups', () => {
    it('looks up public profile without touching auth credentials', async () => {
      const userId = new Types.ObjectId();
      const mockProfile = {
        userId,
        username: 'PlayerX',
      } as unknown as UserProfileDocument;
      (mockUserProfileModel.findOne as jest.Mock).mockResolvedValue(
        mockProfile,
      );

      const profile: UserProfileDocument | null =
        await service.findProfileByUserId(userId);
      expect(profile).toBe(mockProfile);
      expect(mockUserProfileModel.findOne).toHaveBeenCalledWith({ userId });
      expect(mockUserAuthModel.findOne).not.toHaveBeenCalled();
    });

    it('looks up wallet balances without exposing user profile or auth data', async () => {
      const userId = new Types.ObjectId();
      const mockWallet = {
        userId,
        coins: 100,
        gems: 5,
      } as unknown as UserWalletDocument;
      (mockUserWalletModel.findOne as jest.Mock).mockResolvedValue(mockWallet);

      const wallet: UserWalletDocument | null =
        await service.findWalletByUserId(userId);
      expect(wallet).toBe(mockWallet);
      expect(mockUserWalletModel.findOne).toHaveBeenCalledWith({ userId });
      expect(mockUserAuthModel.findOne).not.toHaveBeenCalled();
    });

    it('looks up auth record by blind index', async () => {
      const email = 'lookup@domain.com';
      const blindIndex = service.computeEmailBlindIndex(email);
      const mockAuth = {
        emailBlindIndex: blindIndex,
        passwordHash: 'hash',
      } as unknown as UserAuthDocument;
      (mockUserAuthModel.findOne as jest.Mock).mockResolvedValue(mockAuth);

      const auth: UserAuthDocument | null =
        await service.findAuthByEmail(email);
      expect(auth).toBe(mockAuth);
      expect(mockUserAuthModel.findOne).toHaveBeenCalledWith({
        emailBlindIndex: blindIndex,
      });
    });
  });

  describe('decryption circuit breaker', () => {
    it('blocks rapid decryption requests when threshold is exceeded', () => {
      const email = 'rate-test@arcadeum.io';
      const envelope = service.createEnvelopeForUser(email);
      const actorId = 'suspicious-actor';

      for (let i = 0; i < 50; i += 1) {
        expect(() =>
          service.decryptUserEnvelope(
            envelope.emailEncrypted,
            envelope.encryptedDek,
            actorId,
          ),
        ).not.toThrow();
      }

      expect(() =>
        service.decryptUserEnvelope(
          envelope.emailEncrypted,
          envelope.encryptedDek,
          actorId,
        ),
      ).toThrow();

      service.resetDecryptionCircuitBreaker(actorId);
      expect(() =>
        service.decryptUserEnvelope(
          envelope.emailEncrypted,
          envelope.encryptedDek,
          actorId,
        ),
      ).not.toThrow();
    });
  });
});

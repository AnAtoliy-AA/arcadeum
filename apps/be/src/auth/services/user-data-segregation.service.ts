import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { UserAuth, UserAuthDocument } from '../schemas/user-auth.schema';
import {
  UserProfile,
  UserProfileDocument,
} from '../schemas/user-profile.schema';
import { UserWallet, UserWalletDocument } from '../schemas/user-wallet.schema';
import type { UserRole } from '../schemas/user.schema';
import {
  encryptPii,
  decryptPii,
  hashPiiBlindIndex,
  resolvePiiEncryptionKey,
  resolvePiiIndexKey,
} from '../../common/utils/pii-cipher.util';
import {
  generateUserDek,
  encryptUserDek,
  decryptUserDek,
  encryptWithUserDek,
  decryptWithUserDek,
  wipeBuffer,
} from '../../common/utils/envelope-cipher.util';
import { DecryptionCircuitBreaker } from '../../common/utils/decryption-circuit-breaker.util';

export interface ProvisionUserParams {
  userId: string | Types.ObjectId;
  email: string;
  passwordHash: string;
  username: string;
  displayName?: string;
  role?: UserRole;
  countryCode?: string | null;
}

export interface ProvisionedUserRecord {
  auth: UserAuthDocument;
  profile: UserProfileDocument;
  wallet: UserWalletDocument;
}

export interface UserEnvelopeResult {
  emailEncrypted: string;
  encryptedDek: string;
  emailBlindIndex: string;
}

@Injectable()
export class UserDataSegregationService {
  private readonly logger = new Logger(UserDataSegregationService.name);
  private readonly circuitBreaker = new DecryptionCircuitBreaker({
    maxRequestsPerWindow: 50,
    windowMs: 60_000,
  });
  private readonly piiKey: Buffer;
  private readonly indexKey: Buffer;

  constructor(
    @InjectModel(UserAuth.name)
    private readonly userAuthModel: Model<UserAuthDocument>,
    @InjectModel(UserProfile.name)
    private readonly userProfileModel: Model<UserProfileDocument>,
    @InjectModel(UserWallet.name)
    private readonly userWalletModel: Model<UserWalletDocument>,
    private readonly config: ConfigService,
  ) {
    this.piiKey = resolvePiiEncryptionKey(this.config);
    this.indexKey = resolvePiiIndexKey(this.config);
  }

  encryptEmail(email: string): {
    emailEncrypted: string;
    emailBlindIndex: string;
  } {
    const normalized = email.trim().toLowerCase();
    return {
      emailEncrypted: encryptPii(normalized, this.piiKey),
      emailBlindIndex: hashPiiBlindIndex(normalized, this.indexKey),
    };
  }

  createEnvelopeForUser(value: string): UserEnvelopeResult {
    const normalized = value.trim().toLowerCase();
    const dek = generateUserDek();
    try {
      const encryptedDek = encryptUserDek(dek, this.piiKey);
      const emailEncrypted = encryptWithUserDek(normalized, dek);
      const emailBlindIndex = hashPiiBlindIndex(normalized, this.indexKey);
      return { emailEncrypted, encryptedDek, emailBlindIndex };
    } finally {
      wipeBuffer(dek);
    }
  }

  decryptUserEnvelope(
    ciphertext: string,
    encryptedDek?: string | null,
    actorContext?: string,
  ): string | null {
    if (!ciphertext) return null;
    this.circuitBreaker.recordAndCheck(actorContext ?? 'system');
    if (!encryptedDek) {
      return decryptPii(ciphertext, this.piiKey);
    }

    const dek = decryptUserDek(encryptedDek, this.piiKey);
    if (!dek) return null;
    try {
      const plaintext = decryptWithUserDek(ciphertext, dek);
      this.logger.log(`PII access audit for actor ${actorContext ?? 'system'}`);
      return plaintext;
    } finally {
      wipeBuffer(dek);
    }
  }

  decryptEmail(emailEncrypted: string, actorContext?: string): string | null {
    this.circuitBreaker.recordAndCheck(actorContext ?? 'system');
    return decryptPii(emailEncrypted, this.piiKey);
  }

  resetDecryptionCircuitBreaker(actorId?: string): void {
    this.circuitBreaker.reset(actorId);
  }

  computeEmailBlindIndex(email: string): string {
    return hashPiiBlindIndex(email, this.indexKey);
  }

  encryptField(value: string): string {
    return encryptPii(value, this.piiKey);
  }

  decryptField(encryptedValue: string): string | null {
    return decryptPii(encryptedValue, this.piiKey);
  }

  async provisionSegregatedUserData(
    params: ProvisionUserParams,
  ): Promise<ProvisionedUserRecord> {
    const objectId =
      typeof params.userId === 'string'
        ? new Types.ObjectId(params.userId)
        : params.userId;

    const envelope = this.createEnvelopeForUser(params.email);

    const [auth, profile, wallet] = await Promise.all([
      this.userAuthModel.findOneAndUpdate(
        { userId: objectId },
        {
          $setOnInsert: {
            userId: objectId,
            emailEncrypted: envelope.emailEncrypted,
            encryptedDek: envelope.encryptedDek,
            emailBlindIndex: envelope.emailBlindIndex,
            passwordHash: params.passwordHash,
            role: params.role ?? 'free',
            isBlocked: false,
            blockedAt: null,
            blockedReasonEncrypted: null,
            deletedAt: null,
          },
        },
        { upsert: true, new: true },
      ),
      this.userProfileModel.findOneAndUpdate(
        { userId: objectId },
        {
          $setOnInsert: {
            userId: objectId,
            username: params.username,
            usernameNormalized: params.username.toLowerCase(),
            displayName: params.displayName,
            role: params.role ?? 'free',
            countryCode: params.countryCode ?? null,
          },
        },
        { upsert: true, new: true },
      ),
      this.userWalletModel.findOneAndUpdate(
        { userId: objectId },
        {
          $setOnInsert: {
            userId: objectId,
            coins: 0,
            gems: 0,
            arcadeum: 0,
            xp: 0,
            prestige: 0,
          },
        },
        { upsert: true, new: true },
      ),
    ]);

    return { auth, profile, wallet };
  }

  async cryptoShredUser(userId: string | Types.ObjectId): Promise<boolean> {
    const objectId =
      typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

    const result = await this.userAuthModel.updateOne(
      { userId: objectId },
      {
        $set: {
          encryptedDek: null,
          deletedAt: new Date(),
        },
      },
    );

    this.logger.warn(
      `Crypto-shred executed for user ${objectId.toHexString()}`,
    );
    return result.modifiedCount > 0;
  }

  decryptAuthEmail(auth: UserAuthDocument): string | null {
    return this.decryptUserEnvelope(
      auth.emailEncrypted,
      auth.encryptedDek,
      auth.userId ? String(auth.userId) : undefined,
    );
  }

  async findProfileByUserId(
    userId: string | Types.ObjectId,
  ): Promise<UserProfileDocument | null> {
    const objectId =
      typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    return this.userProfileModel.findOne({ userId: objectId });
  }

  async findProfileByUsername(
    username: string,
  ): Promise<UserProfileDocument | null> {
    return this.userProfileModel.findOne({
      usernameNormalized: username.trim().toLowerCase(),
    });
  }

  async findWalletByUserId(
    userId: string | Types.ObjectId,
  ): Promise<UserWalletDocument | null> {
    const objectId =
      typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    return this.userWalletModel.findOne({ userId: objectId });
  }

  async findAuthByUserId(
    userId: string | Types.ObjectId,
  ): Promise<UserAuthDocument | null> {
    const objectId =
      typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    return this.userAuthModel.findOne({ userId: objectId });
  }

  async findAuthByBlindIndex(
    blindIndex: string,
  ): Promise<UserAuthDocument | null> {
    return this.userAuthModel.findOne({ emailBlindIndex: blindIndex });
  }

  async findAuthByEmail(email: string): Promise<UserAuthDocument | null> {
    const blindIndex = this.computeEmailBlindIndex(email);
    return this.findAuthByBlindIndex(blindIndex);
  }
}

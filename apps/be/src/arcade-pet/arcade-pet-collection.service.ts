import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  createWelcomePresent,
  type ArcadePetCollectionResponse,
  type PetGiftPresentPayload,
  type SyncArcadePetCollectionResult,
} from '@arcadeum/games-core';
import { OCI_CONNECTION } from '../common/providers/mongo-connections.provider';
import type { SyncCollectionDto } from './dto/arcade-pet-collection.dto';
import {
  ArcadePetCollection,
  type ArcadePetCollectionDocument,
} from './schemas/arcade-pet-collection.schema';

const DUPLICATE_KEY_ERROR = 11000;

function isDuplicateKey(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: number }).code === DUPLICATE_KEY_ERROR
  );
}

@Injectable()
export class ArcadePetCollectionService {
  constructor(
    @InjectModel(ArcadePetCollection.name, OCI_CONNECTION)
    private readonly model: Model<ArcadePetCollectionDocument>,
  ) {}

  toResponse(
    doc: ArcadePetCollectionDocument | null,
  ): ArcadePetCollectionResponse {
    if (!doc) {
      return {
        revision: 0,
        pets: [],
        activePetId: null,
        gemBalance: 300,
        coinBalance: 50,
        adoptionCount: 0,
        homeCapacity: 1,
        queuedThemeForNextPet: null,
        presents: [createWelcomePresent(Date.now())],
        hasConfirmedCare: false,
        isAtHome: false,
        dailyStreak: 0,
        lastDailyClaimDay: null,
        claimedMilestones: [],
      };
    }
    return {
      revision: doc.revision,
      pets: doc.pets,
      activePetId: doc.activePetId,
      gemBalance: doc.gemBalance,
      coinBalance: doc.coinBalance,
      adoptionCount: doc.adoptionCount,
      homeCapacity: doc.homeCapacity,
      queuedThemeForNextPet: doc.queuedThemeForNextPet,
      presents: doc.presents,
      hasConfirmedCare: doc.hasConfirmedCare,
      isAtHome: doc.isAtHome,
      dailyStreak: doc.dailyStreak ?? 0,
      lastDailyClaimDay: doc.lastDailyClaimDay ?? null,
      claimedMilestones: doc.claimedMilestones ?? [],
    };
  }

  async getCollection(userId: string): Promise<ArcadePetCollectionResponse> {
    const doc = await this.model.findOne({
      userId: { $eq: new Types.ObjectId(userId) },
    });
    return this.toResponse(doc);
  }

  /**
   * Optimistic-concurrency write: succeeds only when `baseRevision` matches
   * the stored revision, otherwise returns the server copy as a conflict.
   */
  async syncCollection(
    userId: string,
    dto: SyncCollectionDto,
  ): Promise<SyncArcadePetCollectionResult> {
    const userObjectId = new Types.ObjectId(userId);
    const current = await this.model.findOne({ userId: { $eq: userObjectId } });
    const currentRevision = current?.revision ?? 0;

    if (dto.baseRevision !== currentRevision) {
      return { status: 'conflict', collection: this.toResponse(current) };
    }

    // Pets can only be created through economy actions, so a client write may
    // only update pets the server already knows. Balances, capacity, presents
    // and rewards are server-owned and never taken from the client.
    const serverPets = current?.pets ?? [];
    const clientById = new Map(dto.pets.map((p) => [p.id, p]));
    const pets = serverPets.map((p) => clientById.get(p.id) ?? p);
    const activePetId = pets.some((p) => p.id === dto.activePetId)
      ? dto.activePetId
      : (current?.activePetId ?? null);

    if (!current) {
      return { status: 'conflict', collection: this.toResponse(null) };
    }

    const fields = { pets, activePetId, isAtHome: dto.isAtHome };

    try {
      const saved = await this.model.findOneAndUpdate(
        { userId: { $eq: userObjectId }, revision: { $eq: currentRevision } },
        { $set: fields, $inc: { revision: 1 } },
        { new: true },
      );
      if (!saved) {
        const latest = await this.model.findOne({
          userId: { $eq: userObjectId },
        });
        return { status: 'conflict', collection: this.toResponse(latest) };
      }
      return { status: 'ok', collection: this.toResponse(saved) };
    } catch (error) {
      if (!isDuplicateKey(error)) throw error;
      const latest = await this.model.findOne({
        userId: { $eq: userObjectId },
      });
      return { status: 'conflict', collection: this.toResponse(latest) };
    }
  }

  /**
   * Delivers a gift present into a user's collection. Idempotent per present
   * id, so retried bulk operations never double-gift.
   */
  async grantPresent(
    userId: string,
    present: PetGiftPresentPayload,
  ): Promise<boolean> {
    try {
      const result = await this.model.findOneAndUpdate(
        {
          userId: { $eq: new Types.ObjectId(userId) },
          'presents.id': { $ne: present.id },
        },
        { $push: { presents: present }, $inc: { revision: 1 } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      return result !== null;
    } catch (error) {
      // Duplicate userId on upsert means the present already exists.
      if (isDuplicateKey(error)) return false;
      throw error;
    }
  }
}

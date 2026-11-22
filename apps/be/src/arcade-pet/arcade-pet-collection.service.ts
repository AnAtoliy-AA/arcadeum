import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ARCADE_PET_SCHEMA_VERSION,
  MAX_PRESENTS,
  MAX_RECENT_ACTION_IDS,
  MAX_TREAT_STOCK,
  WELCOME_PRESENT_ID,
  createEmptyCollection,
  createWelcomePresent,
  mergeClientPet,
  migrateCollection,
  needsMigration,
  type GameTreatId,
  type ArcadePetCollectionPayload,
  type ArcadePetCollectionResponse,
  type PetGiftPresentPayload,
  type SyncArcadePetCollectionResult,
} from '@arcadeum/games-core';
import { OCI_CONNECTION } from '../common/providers/mongo-connections.provider';
import { isDuplicateKeyError } from '../common/utils/mongo-errors.util';
import type { SyncCollectionDto } from './dto/arcade-pet-collection.dto';
import {
  ArcadePetCollection,
  type ArcadePetCollectionDocument,
} from './schemas/arcade-pet-collection.schema';

const MAX_GRANT_ATTEMPTS = 5;

export type GrantPresentResult = 'granted' | 'duplicate' | 'full';
export type AwardTreatResult =
  'awarded' | 'duplicate' | 'no_pet' | 'stock_full';

@Injectable()
export class ArcadePetCollectionService {
  constructor(
    @InjectModel(ArcadePetCollection.name, OCI_CONNECTION)
    private readonly model: Model<ArcadePetCollectionDocument>,
  ) {}

  /** Response for a stored document, or the pristine default when none exists. */
  toResponse(
    doc: ArcadePetCollectionDocument | null,
  ): ArcadePetCollectionResponse {
    if (!doc) return { revision: 0, ...createEmptyCollection() };
    const stored = {
      schemaVersion: doc.schemaVersion,
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
    const payload = needsMigration(stored) ? migrateCollection(stored) : stored;
    return {
      revision: doc.revision,
      pets: payload.pets,
      activePetId: payload.activePetId,
      gemBalance: payload.gemBalance,
      coinBalance: payload.coinBalance,
      adoptionCount: payload.adoptionCount,
      homeCapacity: payload.homeCapacity,
      queuedThemeForNextPet: payload.queuedThemeForNextPet,
      presents: payload.presents,
      hasConfirmedCare: payload.hasConfirmedCare,
      isAtHome: payload.isAtHome,
      dailyStreak: payload.dailyStreak,
      lastDailyClaimDay: payload.lastDailyClaimDay,
      claimedMilestones: payload.claimedMilestones,
    };
  }

  async getCollection(userId: string): Promise<ArcadePetCollectionResponse> {
    const doc = await this.model.findOne({
      userId: { $eq: new Types.ObjectId(userId) },
    });
    return this.toResponse(doc);
  }

  /**
   * Optimistic-concurrency write. Last-writer rules: the write succeeds only
   * when `baseRevision` matches the stored revision; otherwise the server
   * copy is returned as a conflict and the client adopts it (the client's
   * unsynced care edits for pets the server knows are re-applied by the
   * client on top). Users who never adopted have no document, so a sync for
   * them is a no-op conflict that returns the pristine default (revision 0),
   * which the client already holds, so it does not loop.
   */
  async syncCollection(
    userId: string,
    dto: SyncCollectionDto,
    now: number = Date.now(),
  ): Promise<SyncArcadePetCollectionResult> {
    const userObjectId = new Types.ObjectId(userId);
    const current = await this.model.findOne({ userId: { $eq: userObjectId } });
    if (!current) {
      return { status: 'conflict', collection: this.toResponse(null) };
    }
    if (dto.baseRevision !== current.revision) {
      return { status: 'conflict', collection: this.toResponse(current) };
    }

    // Pets can only be created through economy actions, so a client write may
    // only update pets the server already knows, and only through the
    // whitelisted merge. Balances, capacity, presents and rewards are
    // server-owned and never taken from the client.
    const clientById = new Map(dto.pets.map((p) => [p.id, p]));
    const pets = this.toResponse(current).pets.map((serverPet) => {
      const clientPet = clientById.get(serverPet.id);
      return clientPet ? mergeClientPet(serverPet, clientPet, now) : serverPet;
    });
    const activePetId =
      dto.activePetId && pets.some((p) => p.id === dto.activePetId)
        ? dto.activePetId
        : current.activePetId;

    const fields = {
      pets,
      activePetId,
      isAtHome: dto.isAtHome,
      schemaVersion: ARCADE_PET_SCHEMA_VERSION,
    };

    try {
      const saved = await this.model.findOneAndUpdate(
        { userId: { $eq: userObjectId }, revision: { $eq: current.revision } },
        { $set: fields, $inc: { revision: 1 } },
        { new: true },
      );
      if (saved) return { status: 'ok', collection: this.toResponse(saved) };
    } catch (error) {
      if (!isDuplicateKeyError(error)) throw error;
    }
    const latest = await this.model.findOne({ userId: { $eq: userObjectId } });
    return { status: 'conflict', collection: this.toResponse(latest) };
  }

  /**
   * Delivers a gift present into a user's collection. Idempotent per present
   * id, so retried operations never double-gift. Recipients without a
   * document get one seeded with the welcome present as well, so it is not
   * lost. Rejects when the inbox is full.
   */
  async grantPresent(
    userId: string,
    present: PetGiftPresentPayload,
    attempt = 0,
  ): Promise<GrantPresentResult> {
    const userObjectId = new Types.ObjectId(userId);
    const filter = { userId: { $eq: userObjectId } };

    const pushed = await this.model.updateOne(
      {
        ...filter,
        'presents.id': { $ne: present.id },
        [`presents.${MAX_PRESENTS - 1}`]: { $exists: false },
      },
      { $push: { presents: present }, $inc: { revision: 1 } },
    );
    if (pushed.modifiedCount === 1) return 'granted';

    const existing = await this.model.findOne(filter).select('presents');
    if (existing) {
      if (existing.presents.some((p) => p.id === present.id)) {
        return 'duplicate';
      }
      if (existing.presents.length >= MAX_PRESENTS) return 'full';
      // Room is left, so the push lost a race with a concurrent first write
      // or inbox change: deliver again against the current document.
      if (attempt >= MAX_GRANT_ATTEMPTS) {
        throw new Error('ArcadePet present delivery contention');
      }
      return this.grantPresent(userId, present, attempt + 1);
    }

    const presents: PetGiftPresentPayload[] =
      present.id === WELCOME_PRESENT_ID
        ? [present]
        : [createWelcomePresent(), present];
    const base: ArcadePetCollectionPayload = createEmptyCollection();
    try {
      await this.model.create({
        ...base,
        userId: userObjectId,
        presents,
        revision: 1,
      });
      return 'granted';
    } catch (error) {
      if (!isDuplicateKeyError(error)) throw error;
      // A concurrent first write created the document: deliver against it.
      return this.grantPresent(userId, present, attempt + 1);
    }
  }

  /**
   * Awards one treat to the user's active pet for a verified match win.
   * Idempotent per `awardKey` (e.g. `treat:<sessionId>`): the key is recorded
   * in the same atomic update, so a replayed match result never double-awards.
   * Users without a pet get nothing. Never callable from a client.
   */
  async awardTreat(
    userId: string,
    treatId: GameTreatId,
    awardKey: string,
  ): Promise<AwardTreatResult> {
    const userObjectId = new Types.ObjectId(userId);
    const doc = await this.model.findOne({ userId: { $eq: userObjectId } });
    const petId = doc?.activePetId;
    if (!doc || !petId) return 'no_pet';
    if (doc.recentActionIds?.includes(awardKey)) return 'duplicate';

    const pet = this.toResponse(doc).pets.find((p) => p.id === petId);
    if (!pet) return 'no_pet';
    if ((pet.inventory[treatId] ?? 0) >= MAX_TREAT_STOCK) return 'stock_full';

    const stockPath = `inventory.${treatId}`;
    const res = await this.model.updateOne(
      {
        userId: { $eq: userObjectId },
        recentActionIds: { $ne: awardKey },
      },
      {
        $inc: { [`pets.$[pet].${stockPath}`]: 1, revision: 1 },
        $push: {
          recentActionIds: {
            $each: [awardKey],
            $slice: -MAX_RECENT_ACTION_IDS,
          },
        },
      },
      {
        arrayFilters: [
          {
            'pet.id': { $eq: petId },
            [`pet.${stockPath}`]: { $not: { $gte: MAX_TREAT_STOCK } },
          },
        ],
      },
    );
    return res.modifiedCount === 1 ? 'awarded' : 'duplicate';
  }
}

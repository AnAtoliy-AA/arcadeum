import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type {
  ArcadePetCollectionResponse,
  PetGiftPresentPayload,
  SyncArcadePetCollectionResult,
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

/**
 * Union of server and client presents by id. Presents only the server knows
 * about (e.g. admin gifts delivered between syncs) are preserved, and a
 * present opened on either side stays opened.
 */
export function mergePresents(
  server: PetGiftPresentPayload[],
  client: PetGiftPresentPayload[],
): PetGiftPresentPayload[] {
  const serverById = new Map(server.map((p) => [p.id, p]));
  const merged = client.map((p) => ({
    ...p,
    isOpened: p.isOpened || serverById.get(p.id)?.isOpened === true,
  }));
  const clientIds = new Set(client.map((p) => p.id));
  for (const p of server) {
    if (!clientIds.has(p.id)) merged.push(p);
  }
  return merged;
}

@Injectable()
export class ArcadePetCollectionService {
  constructor(
    @InjectModel(ArcadePetCollection.name, OCI_CONNECTION)
    private readonly model: Model<ArcadePetCollectionDocument>,
  ) {}

  private toResponse(
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
        presents: [],
        hasConfirmedCare: false,
        isAtHome: false,
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
    };
  }

  async getCollection(userId: string): Promise<ArcadePetCollectionResponse> {
    const doc = await this.model.findOne({
      userId: new Types.ObjectId(userId),
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
    const current = await this.model.findOne({ userId: userObjectId });
    const currentRevision = current?.revision ?? 0;

    if (dto.baseRevision !== currentRevision) {
      return { status: 'conflict', collection: this.toResponse(current) };
    }

    const { baseRevision: _baseRevision, ...snapshot } = dto;
    const fields = {
      ...snapshot,
      activePetId: snapshot.activePetId ?? null,
      queuedThemeForNextPet: snapshot.queuedThemeForNextPet ?? null,
      presents: mergePresents(current?.presents ?? [], snapshot.presents),
    };

    try {
      const saved = current
        ? await this.model.findOneAndUpdate(
            { userId: userObjectId, revision: currentRevision },
            { $set: fields, $inc: { revision: 1 } },
            { new: true },
          )
        : await this.model.create({
            userId: userObjectId,
            ...fields,
            revision: 1,
          });
      if (!saved) {
        const latest = await this.model.findOne({ userId: userObjectId });
        return { status: 'conflict', collection: this.toResponse(latest) };
      }
      return { status: 'ok', collection: this.toResponse(saved) };
    } catch (error) {
      if (!isDuplicateKey(error)) throw error;
      const latest = await this.model.findOne({ userId: userObjectId });
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
          userId: new Types.ObjectId(userId),
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

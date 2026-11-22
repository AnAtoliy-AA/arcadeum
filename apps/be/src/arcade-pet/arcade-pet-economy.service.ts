import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ARCADE_PET_SCHEMA_VERSION,
  MAX_RECENT_ACTION_IDS,
  reduceEconomy,
  type ArcadePetCollectionPayload,
  type ArcadePetEconomyAction,
  type ArcadePetEconomyError,
  type ArcadePetEconomyResult,
} from '@arcadeum/games-core';
import { isDuplicateKeyError } from '../common/utils/mongo-errors.util';
import { OCI_CONNECTION } from '../common/providers/mongo-connections.provider';
import { User, type UserDocument } from '../auth/schemas/user.schema';
import { ArcadePetCollectionService } from './arcade-pet-collection.service';
import type { EconomyActionDto } from './dto/arcade-pet-collection.dto';
import {
  ArcadePetCollection,
  type ArcadePetCollectionDocument,
} from './schemas/arcade-pet-collection.schema';

const MAX_ATTEMPTS = 3;

/** Narrows the flat validated DTO into the discriminated action union. */
export function toEconomyAction(
  dto: EconomyActionDto,
): ArcadePetEconomyAction | null {
  const str = (v: string | undefined): string => v ?? '';
  switch (dto.type) {
    case 'adopt_random':
    case 'adopt_selected':
      if (!dto.species) return null;
      return {
        type: dto.type,
        petId: str(dto.petId),
        species: dto.species,
        theme: str(dto.theme),
        name: str(dto.name),
      };
    case 'upgrade_home':
      return dto.currency
        ? { type: 'upgrade_home', currency: dto.currency }
        : null;
    case 'feed_snack':
      return { type: 'feed_snack', petId: str(dto.petId) };
    case 'claim_present':
      return {
        type: 'claim_present',
        presentId: str(dto.presentId),
        petId: str(dto.petId),
      };
    case 'send_gift':
      if (!dto.species) return null;
      return {
        type: 'send_gift',
        recipientUsername: str(dto.recipientUsername),
        species: dto.species,
        theme: str(dto.theme),
        petName: str(dto.petName),
        message: dto.message,
      };
    case 'claim_daily':
    case 'claim_milestones':
      return { type: dto.type };
    case 'queue_theme':
      return { type: 'queue_theme', themeId: str(dto.themeId) };
  }
}

/**
 * Server-authoritative economy: every balance-affecting action is validated
 * and applied here with optimistic concurrency on the collection revision.
 */
@Injectable()
export class ArcadePetEconomyService {
  constructor(
    @InjectModel(ArcadePetCollection.name, OCI_CONNECTION)
    private readonly model: Model<ArcadePetCollectionDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly collections: ArcadePetCollectionService,
  ) {}

  /**
   * Applies one action. With an `actionId`, a retry of an already applied
   * action answers with the current collection instead of applying it twice.
   */
  async perform(
    userId: string,
    action: ArcadePetEconomyAction,
    actionId?: string,
  ): Promise<ArcadePetEconomyResult> {
    const userObjectId = new Types.ObjectId(userId);
    const sender = await this.userModel
      .findById(userId)
      .select('username role')
      .lean<{ username?: string; role?: string } | null>();

    let recipientId: string | null = null;
    if (action.type === 'send_gift') {
      const recipient = await this.userModel
        .findOne({
          usernameNormalized: action.recipientUsername.trim().toLowerCase(),
          deletedAt: null,
        })
        .select('_id')
        .lean<{ _id: Types.ObjectId } | null>();
      if (!recipient) return this.rejected(userId, 'RECIPIENT_NOT_FOUND');
      if (recipient._id.toString() === userId) {
        return this.rejected(userId, 'SELF_GIFT');
      }
      recipientId = recipient._id.toString();
    }

    // Revision used for the gift id once the gift was delivered, so a retry
    // after a lost commit race re-uses the same id instead of gifting twice.
    let deliveredAtRevision: number | null = null;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const current = await this.model.findOne({
        userId: { $eq: userObjectId },
      });
      const collection = this.collections.toResponse(current);
      if (actionId && current?.recentActionIds?.includes(actionId)) {
        return { ok: true, collection };
      }
      const { revision, ...state } = collection;

      const result = reduceEconomy(state, action, {
        now: Date.now(),
        userId,
        revision: deliveredAtRevision ?? revision,
        actionId,
        senderName: sender?.username ?? 'Friend',
        isAdmin: sender?.role === 'admin',
      });
      if (!result.ok) {
        return { ok: false, error: result.error, collection };
      }

      // Deliver the gift first: it is idempotent per deterministic id, so a
      // failure or retry can never double-gift, and the sender is only
      // debited once the recipient has it.
      if (result.outgoingGift && recipientId) {
        const delivery = await this.collections.grantPresent(
          recipientId,
          result.outgoingGift,
        );
        if (delivery === 'full') return this.rejected(userId, 'INBOX_FULL');
        if (
          delivery === 'duplicate' &&
          deliveredAtRevision === null &&
          !actionId
        ) {
          // Revision-derived id collided with a concurrent send of ours: retry.
          // Action-derived ids are unique per action, so a duplicate means an
          // earlier attempt of this same action already delivered the gift.
          continue;
        }
        deliveredAtRevision ??= revision;
      }

      const saved = await this.commit(
        userObjectId,
        current !== null,
        revision,
        result.state,
        actionId,
      );
      if (!saved) continue;

      return { ok: true, collection: this.collections.toResponse(saved) };
    }

    // Persistent write contention: surface the latest state to the client.
    return this.rejected(userId, 'CONTENTION');
  }

  private async commit(
    userId: Types.ObjectId,
    exists: boolean,
    revision: number,
    state: ArcadePetCollectionPayload,
    actionId?: string,
  ): Promise<ArcadePetCollectionDocument | null> {
    try {
      if (exists) {
        return await this.model.findOneAndUpdate(
          { userId: { $eq: userId }, revision: { $eq: revision } },
          {
            $set: { ...state, schemaVersion: ARCADE_PET_SCHEMA_VERSION },
            $inc: { revision: 1 },
            ...(actionId
              ? {
                  $push: {
                    recentActionIds: {
                      $each: [actionId],
                      $slice: -MAX_RECENT_ACTION_IDS,
                    },
                  },
                }
              : {}),
          },
          { new: true },
        );
      }
      return await this.model.create({
        userId,
        ...state,
        revision: 1,
        recentActionIds: actionId ? [actionId] : [],
      });
    } catch (error) {
      // A concurrent first write created the record: retry against it.
      if (isDuplicateKeyError(error)) return null;
      throw error;
    }
  }

  private async rejected(
    userId: string,
    error: ArcadePetEconomyError,
  ): Promise<ArcadePetEconomyResult> {
    return {
      ok: false,
      error,
      collection: await this.collections.getCollection(userId),
    };
  }
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  ARCADE_PET_SCHEMA_VERSION,
  INITIAL_COIN_BALANCE,
  INITIAL_GEM_BALANCE,
} from '@arcadeum/games-core';
import type { PetGiftPresentPayload, PetState } from '@arcadeum/games-core';

@Schema({ collection: 'arcade_pet_collections', timestamps: true })
export class ArcadePetCollection extends Document {
  declare _id: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  })
  userId: Types.ObjectId;

  /**
   * Stored-shape version. Older documents are migrated on read (see
   * migrateCollection) and rewritten at the current version on the next save.
   */
  @Prop({ type: Number, default: ARCADE_PET_SCHEMA_VERSION })
  schemaVersion: number;

  /** Bounded list of recent action ids; makes retried actions idempotent. */
  @Prop({ type: [String], default: [] })
  recentActionIds: string[];

  @Prop({ type: Number, default: 0, min: 0 })
  revision: number;

  // Mixed arrays: shape is enforced by the DTO + games-core merge, and the
  // list sizes are bounded (MAX_PETS / MAX_PRESENTS) so a document stays far
  // below the 16MB limit.
  @Prop({ type: [Object], default: [] })
  pets: PetState[];

  @Prop({ type: String, default: null })
  activePetId: string | null;

  @Prop({ type: Number, default: INITIAL_GEM_BALANCE, min: 0 })
  gemBalance: number;

  @Prop({ type: Number, default: INITIAL_COIN_BALANCE, min: 0 })
  coinBalance: number;

  @Prop({ type: Number, default: 0, min: 0 })
  adoptionCount: number;

  @Prop({ type: Number, default: 1, min: 1 })
  homeCapacity: number;

  @Prop({ type: String, default: null })
  queuedThemeForNextPet: string | null;

  @Prop({ type: [Object], default: [] })
  presents: PetGiftPresentPayload[];

  @Prop({ type: Boolean, default: false })
  hasConfirmedCare: boolean;

  @Prop({ type: Boolean, default: false })
  isAtHome: boolean;

  @Prop({ type: Number, default: 0, min: 0 })
  dailyStreak: number;

  @Prop({ type: String, default: null })
  lastDailyClaimDay: string | null;

  @Prop({ type: [String], default: [] })
  claimedMilestones: string[];
}

export type ArcadePetCollectionDocument = ArcadePetCollection;

export const ArcadePetCollectionSchema =
  SchemaFactory.createForClass(ArcadePetCollection);

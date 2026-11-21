import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import type { PetGiftPresentPayload, PetState } from '@arcadeum/games-core';

@Schema({ collection: 'arcade_pet_collections', timestamps: true })
export class ArcadePetCollection extends Document {
  declare _id: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({ type: Number, default: 0, min: 0 })
  revision: number;

  @Prop({ type: [Object], default: [] })
  pets: PetState[];

  @Prop({ type: String, default: null })
  activePetId: string | null;

  @Prop({ type: Number, default: 300, min: 0 })
  gemBalance: number;

  @Prop({ type: Number, default: 50, min: 0 })
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
}

export type ArcadePetCollectionDocument = ArcadePetCollection;

export const ArcadePetCollectionSchema =
  SchemaFactory.createForClass(ArcadePetCollection);

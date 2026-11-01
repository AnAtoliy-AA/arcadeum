import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import type {
  GameTreatId,
  PetMood,
  PetSpecies,
  PetStage,
} from '@arcadeum/games-core';

@Schema({ _id: false })
export class PetStatsSubdocument {
  @Prop({ type: Number, default: 80, min: 0, max: 100 })
  hunger: number;

  @Prop({ type: Number, default: 80, min: 0, max: 100 })
  happiness: number;

  @Prop({ type: Number, default: 90, min: 0, max: 100 })
  energy: number;

  @Prop({ type: Number, default: 100, min: 0, max: 100 })
  hygiene: number;

  @Prop({ type: Number, default: 50, min: 0, max: 100 })
  discipline: number;

  @Prop({ type: Number, default: 90, min: 0, max: 100 })
  health: number;

  @Prop({ type: Number, default: 5, min: 1 })
  weight: number;

  @Prop({ type: Number, default: 1, min: 1 })
  level: number;

  @Prop({ type: Number, default: 0, min: 0 })
  xp: number;
}

@Schema({ _id: false })
export class PetTimestampsSubdocument {
  @Prop({ type: Number, required: true })
  bornAt: number;

  @Prop({ type: Number, required: true })
  lastInteractedAt: number;

  @Prop({ type: Number, required: true })
  lastFedAt: number;

  @Prop({ type: Number, required: true })
  lastSleptAt: number;

  @Prop({ type: Number, required: true })
  lastCleanedAt: number;

  @Prop({ type: Number, required: true })
  lastTrainedAt: number;
}

@Schema({ collection: 'arcade_pets', timestamps: true })
export class ArcadePet extends Document {
  declare _id: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true, default: 'ArcadePet' })
  name: string;

  @Prop({ type: String, required: true, default: 'slime' })
  species: PetSpecies;

  @Prop({ type: String, required: true, default: 'egg' })
  stage: PetStage;

  @Prop({ type: String, required: true, default: 'retro' })
  theme: string;

  @Prop({ type: PetStatsSubdocument, default: () => ({}) })
  stats: PetStatsSubdocument;

  @Prop({ type: PetTimestampsSubdocument, required: true })
  timestamps: PetTimestampsSubdocument;

  @Prop({ type: Boolean, default: false })
  isSleeping: boolean;

  @Prop({ type: Number, default: 0, min: 0, max: 4 })
  poopCount: number;

  @Prop({ type: Boolean, default: false })
  isSick: boolean;

  @Prop({
    type: Map,
    of: Number,
    default: () => ({
      chess_cookie: 2,
      sea_battle_fish: 1,
      hearts_candy: 1,
      critical_pepper: 1,
      pachisi_spice: 1,
    }),
  })
  inventory: Map<GameTreatId, number>;

  @Prop({ type: Number, default: 0, min: 0 })
  careMistakes: number;

  @Prop({ type: String, default: 'neutral' })
  mood: PetMood;

  createdAt: Date;
  updatedAt: Date;
}

export type ArcadePetDocument = ArcadePet;

export const ArcadePetSchema = SchemaFactory.createForClass(ArcadePet);

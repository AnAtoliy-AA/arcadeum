import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { VISIBILITY_TIERS, type VisibilityTier } from '../../auth/lib/roles';

@Schema({ timestamps: true, collection: 'game_visibility' })
export class GameVisibility extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: true, trim: true, index: true })
  gameId!: string;

  @Prop({ type: String, default: null })
  variantId!: string | null;

  @Prop({ required: true, type: String, enum: VISIBILITY_TIERS })
  tier!: VisibilityTier;

  @Prop({ required: true, trim: true })
  updatedBy!: string;
}

export type GameVisibilityDocument = GameVisibility;
export const GameVisibilitySchema =
  SchemaFactory.createForClass(GameVisibility);
GameVisibilitySchema.index({ gameId: 1, variantId: 1 }, { unique: true });

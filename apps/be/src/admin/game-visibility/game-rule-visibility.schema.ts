import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'game_rule_visibility' })
export class GameRuleVisibility extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: true, trim: true, index: true })
  gameId!: string;

  @Prop({ required: true, trim: true })
  ruleId!: string;

  @Prop({ required: true, default: true })
  enabled!: boolean;

  @Prop({ required: true, trim: true })
  updatedBy!: string;
}

export type GameRuleVisibilityDocument = GameRuleVisibility;
export const GameRuleVisibilitySchema =
  SchemaFactory.createForClass(GameRuleVisibility);
GameRuleVisibilitySchema.index({ gameId: 1, ruleId: 1 }, { unique: true });

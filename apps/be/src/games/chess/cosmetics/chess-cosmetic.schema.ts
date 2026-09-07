import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChessCosmeticDocument = HydratedDocument<ChessCosmetic>;

export type CosmeticType = 'board' | 'pieces' | 'frame' | 'emote' | 'victory';
export type CosmeticRarity = 'common' | 'rare' | 'epic' | 'legendary';

@Schema({ timestamps: true, collection: 'chess_cosmetics' })
export class ChessCosmetic {
  @Prop({ required: true })
  id!: string;

  @Prop({
    type: String,
    required: true,
    enum: ['board', 'pieces', 'frame', 'emote', 'victory'],
  })
  type!: CosmeticType;

  @Prop({ required: true })
  name!: string;

  @Prop({ default: '' })
  description!: string;

  @Prop({ required: true })
  price!: number;

  @Prop({
    type: String,
    required: true,
    enum: ['common', 'rare', 'epic', 'legendary'],
  })
  rarity!: CosmeticRarity;

  @Prop({ default: '' })
  preview!: string;

  @Prop({ type: Object, default: {} })
  data!: Record<string, unknown>;
}

export const ChessCosmeticSchema = SchemaFactory.createForClass(ChessCosmetic);

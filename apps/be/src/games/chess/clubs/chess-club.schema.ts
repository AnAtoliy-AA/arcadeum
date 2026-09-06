import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChessClubDocument = HydratedDocument<ChessClub>;

@Schema({ timestamps: true, collection: 'chess_clubs' })
export class ChessClub {
  @Prop({ required: true })
  name!: string;

  @Prop({ default: '' })
  description!: string;

  @Prop({ required: true })
  ownerId!: string;

  @Prop({ type: [String], default: [] })
  memberIds!: string[];

  @Prop({ type: [String], default: [] })
  adminIds!: string[];

  @Prop({ type: String, default: 'public', enum: ['public', 'private'] })
  visibility!: 'public' | 'private';

  @Prop({ default: 0 })
  memberCount!: number;

  @Prop({ default: '' })
  avatar!: string;
}

export const ChessClubSchema = SchemaFactory.createForClass(ChessClub);

import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Squad {
  @Prop({ required: true, unique: true })
  squadId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  tag!: string;

  @Prop({ required: true, default: 0 })
  rating!: number;

  @Prop({ required: true, default: 0 })
  memberCount!: number;

  @Prop({ type: [String], default: [] })
  memberUserIds!: string[];

  // Cached rank within current season for fast reads.
  @Prop({ type: Number })
  rank?: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export type SquadDocument = Squad & Document;
export const SquadSchema = SchemaFactory.createForClass(Squad);

SquadSchema.index({ rating: -1 });

import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Cup {
  @Prop({ required: true, unique: true })
  cupId!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  startsAt!: Date;

  @Prop({ required: true, index: true })
  endsAt!: Date;

  @Prop({ required: true })
  prizePoolUSD!: number;

  @Prop({ required: true, default: 0 })
  participantCount!: number;

  @Prop({ type: [String], default: [] })
  qualifiedUserIds!: string[];

  @Prop({ default: true, index: true })
  active!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export type CupDocument = Cup & Document;
export const CupSchema = SchemaFactory.createForClass(Cup);

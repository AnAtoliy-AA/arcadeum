import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FriendshipDocument = Friendship & Document;

@Schema({ timestamps: true })
export class Friendship {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  requesterId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  addresseeId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
    required: true,
  })
  status!: 'pending' | 'accepted' | 'declined';
}

export const FriendshipSchema = SchemaFactory.createForClass(Friendship);

FriendshipSchema.index({ requesterId: 1, addresseeId: 1 }, { unique: true });
FriendshipSchema.index({ addresseeId: 1, requesterId: 1 });
FriendshipSchema.index({ requesterId: 1, status: 1 });
FriendshipSchema.index({ addresseeId: 1, status: 1 });

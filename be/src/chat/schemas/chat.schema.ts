import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Chat extends Document {
  @Prop({ required: true })
  chatId: string;

  // If you already have a User scehma, please update user1 and user2 to reference your User schema.
  @Prop({ required: true })
  user1: string; // ID of the first user

  @Prop({ required: true })
  user2: string; // ID of the second user
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

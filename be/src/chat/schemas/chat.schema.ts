import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Chat extends Document {
  @Prop({ required: true })
  chatId: string;

  @Prop({ type: [String], required: true })
  users: string[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

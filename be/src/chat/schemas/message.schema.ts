import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Message extends Document {
  @Prop({ required: true })
  chatId: string;

  // If you already have a User scehma, please update senderId and receiverId to reference your User schema.
  @Prop({ required: true })
  senderId: string; // ID of the sender

  @Prop({ required: true })
  receiverId: string; // ID of the receiver

  @Prop({ required: true })
  content: string; // The message text

  @Prop({ required: true, default: Date.now })
  timestamp: Date; // Time the message was sent
}

export const MessageSchema = SchemaFactory.createForClass(Message);

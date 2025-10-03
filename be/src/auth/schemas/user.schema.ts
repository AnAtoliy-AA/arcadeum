import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true })
  username!: string;

  @Prop({ required: true, unique: true })
  usernameNormalized!: string;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<UserDocument>('save', function setNormalizedUsername(next) {
  if (this.isModified('username') && this.username) {
    this.usernameNormalized = this.username.toLowerCase();
  }
  next();
});

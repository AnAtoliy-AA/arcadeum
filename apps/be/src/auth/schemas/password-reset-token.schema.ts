import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * Single-use password-reset token.
 *
 * `tokenHash` is `sha256(plaintext)`. Plaintext is high-entropy
 * (32 random bytes, base64url-encoded), so the hash is effectively a unique
 * identifier — no rainbow-table risk and lookup is an indexed equality match.
 *
 * `expiresAt` carries a TTL index so MongoDB drops expired rows automatically;
 * the runtime also rejects expired tokens defensively.
 *
 * `consumedAt` flips when the reset endpoint accepts the token. A non-null
 * value means the token cannot be reused, even if it is still within its TTL.
 */
@Schema({ timestamps: true })
export class PasswordResetToken {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  tokenHash!: string;

  @Prop({ required: true, type: Date, index: { expireAfterSeconds: 0 } })
  expiresAt!: Date;

  @Prop({ type: Date, default: null })
  consumedAt?: Date | null;
}

export type PasswordResetTokenDocument = PasswordResetToken & Document;
export const PasswordResetTokenSchema =
  SchemaFactory.createForClass(PasswordResetToken);

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserDocument } from '../schemas/user.schema';
import {
  PasswordResetToken,
  PasswordResetTokenDocument,
} from '../schemas/password-reset-token.schema';
import { MailerService } from '../../support/lib/mailer.service';

const TOKEN_BYTES = 32;
const TOKEN_TTL_MS = 15 * 60 * 1000;
const PASSWORD_SALT_ROUNDS = 12;

/** sha256 of plaintext, hex-encoded. Indexed equality lookup. */
function hashToken(plaintext: string): string {
  return crypto.createHash('sha256').update(plaintext).digest('hex');
}

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(PasswordResetToken.name)
    private readonly tokenModel: Model<PasswordResetTokenDocument>,
    private readonly mailer: MailerService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Issue a reset token for the email if the account exists, and email the
   * reset link. Always resolves successfully — the response must not reveal
   * whether the email maps to an account (enumeration defense).
   */
  async requestReset(email: string): Promise<void> {
    const normalized = email.trim().toLowerCase();
    const user = await this.userModel
      .findOne({ email: normalized })
      .select('_id email')
      .lean();
    if (!user) {
      // Unknown email — exit silently. Same latency profile as the happy
      // path is non-trivial; this is acceptable for an MVP and matches what
      // most consumer apps ship.
      return;
    }

    // Invalidate any outstanding tokens for this user so previously emailed
    // links stop working the moment a new one is issued.
    await this.tokenModel
      .updateMany(
        { userId: user._id, consumedAt: null },
        { $set: { consumedAt: new Date() } },
      )
      .exec();

    const plaintext = crypto.randomBytes(TOKEN_BYTES).toString('base64url');
    const tokenHash = hashToken(plaintext);
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    await this.tokenModel.create({
      userId: user._id,
      tokenHash,
      expiresAt,
    });

    const baseUrl = this.resolveWebBaseUrl();
    const resetUrl = `${baseUrl}/auth/reset?token=${encodeURIComponent(plaintext)}`;
    const ttlMinutes = Math.round(TOKEN_TTL_MS / 60000);

    const result = await this.mailer.sendTo({
      to: user.email,
      subject: 'Reset your Arcadeum password',
      text: [
        'We received a request to reset your Arcadeum password.',
        '',
        `Use this link within ${ttlMinutes} minutes to choose a new one:`,
        resetUrl,
        '',
        "If you did not request this, you can ignore this email — your password will not change.",
      ].join('\n'),
    });

    if (result.status === 'failed') {
      this.logger.error(
        `Password-reset email failed for ${normalized}: ${result.error}`,
      );
    }
  }

  /**
   * Consume a reset token and update the user's password. Returns true on
   * success; throws nothing on the failure path so the controller can
   * decide how to surface the error to the client.
   */
  async consumeReset(
    token: string,
    newPassword: string,
  ): Promise<{ ok: boolean }> {
    const tokenHash = hashToken(token);
    const record = await this.tokenModel
      .findOne({ tokenHash, consumedAt: null, expiresAt: { $gt: new Date() } })
      .exec();
    if (!record) {
      return { ok: false };
    }

    const passwordHash = await bcrypt.hash(newPassword, PASSWORD_SALT_ROUNDS);
    await this.userModel
      .updateOne({ _id: record.userId }, { $set: { passwordHash } })
      .exec();

    record.consumedAt = new Date();
    await record.save();

    return { ok: true };
  }

  private resolveWebBaseUrl(): string {
    const candidate =
      this.config.get<string>('WEB_BASE_URL') ??
      this.config.get<string>('NEXT_PUBLIC_WEB_URL');
    if (candidate && /^https?:\/\//i.test(candidate)) {
      return candidate.replace(/\/$/, '');
    }
    // Local-dev default so the flow is usable without extra env wiring.
    const port = this.config.get<string>('WEB_PORT') ?? '3000';
    return `http://127.0.0.1:${port}`;
  }
}

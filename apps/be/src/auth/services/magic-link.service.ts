/**
 * Magic link authentication service.
 * Handles magic link token generation, validation, and consumption.
 */
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { MagicLink, MagicLinkDocument } from '../schemas/magic-link.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenService } from './refresh-token.service';
import { buildAuthUserProfile } from '../auth-helpers';
import type { AuthTokensResponse } from '../lib/types';

const MAGIC_LINK_EXPIRY_MINUTES = 15;
const MAGIC_LINK_TOKEN_LENGTH = 32;

@Injectable()
export class MagicLinkService {
  private readonly logger = new Logger(MagicLinkService.name);

  constructor(
    @InjectModel(MagicLink.name)
    private readonly magicLinkModel: Model<MagicLinkDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly jwt: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  /**
   * Generate a magic link token for the given email.
   * Returns 200 for both existing and unknown emails to prevent account enumeration.
   */
  async requestMagicLink(email: string): Promise<{ success: boolean }> {
    const normalizedEmail = email.toLowerCase().trim();

    const token = crypto
      .randomBytes(MAGIC_LINK_TOKEN_LENGTH)
      .toString('base64url');

    const expiresAt = new Date(
      Date.now() + MAGIC_LINK_EXPIRY_MINUTES * 60 * 1000,
    );

    // Find existing user if any
    // lgtm[js/sql-injection]
    const user = await this.userModel.findOne({ email: normalizedEmail });

    // Invalidate any existing unused magic links for this email
    await this.magicLinkModel.updateMany(
      { email: normalizedEmail, used: false },
      { $set: { used: true } },
    );

    // Create new magic link
    await this.magicLinkModel.create({
      email: normalizedEmail,
      token,
      expiresAt,
      userId: user?._id,
    });

    // TODO: Send magic link email via mailer
    // For now, log only the token prefix for debugging (never log full token in production)
    const tokenPrefix = token.substring(0, 8);
    this.logger.debug(
      `Magic link requested for ${normalizedEmail} (token: ${tokenPrefix}...)`,
    );

    return { success: true };
  }

  /**
   * Verify a magic link token and return auth tokens.
   */
  async verifyMagicLink(token: string): Promise<AuthTokensResponse> {
    const magicLink = await this.magicLinkModel.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!magicLink) {
      throw new UnauthorizedException('Invalid or expired magic link');
    }

    // Mark as used
    magicLink.used = true;
    await magicLink.save();

    // Find or create user
    let user = magicLink.userId
      ? await this.userModel.findById(magicLink.userId)
      : await this.userModel.findOne({ email: magicLink.email });

    if (!user) {
      // Create new user with magic link
      const username = magicLink.email.split('@')[0] || 'user';
      const baseUsername = username.replace(/[^a-zA-Z0-9_-]/g, '');
      let candidate =
        baseUsername.length >= 3
          ? baseUsername
          : `user${crypto.randomInt(1000, 10000)}`;
      let normalized = candidate.toLowerCase();
      let suffix = 1;

      while (await this.userModel.exists({ usernameNormalized: normalized })) {
        candidate = `${baseUsername}${suffix}`;
        normalized = candidate.toLowerCase();
        suffix += 1;
      }

      const bcrypt = await import('bcrypt');
      const placeholderPassword = await bcrypt.hash(crypto.randomUUID(), 10);

      user = await this.userModel.create({
        email: magicLink.email,
        passwordHash: placeholderPassword,
        username: candidate,
        usernameNormalized: normalized,
      });
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('Account is blocked');
    }

    if (user.deletedAt) {
      throw new UnauthorizedException('Account has been removed');
    }

    const payload: { sub: string; email: string; username: string } = {
      sub: String(user.id),
      email: user.email,
      username: user.username,
    };

    const accessToken = await this.jwt.signAsync(payload);
    const accessTokenExpiresAt =
      this.refreshTokenService.deriveAccessTokenExpiration(accessToken);
    const refresh = await this.refreshTokenService.issueRefreshToken(
      String(user.id),
      null,
    );

    return {
      accessToken,
      accessTokenExpiresAt,
      refreshToken: refresh.token,
      refreshTokenExpiresAt: refresh.expiresAt,
      user: buildAuthUserProfile(user),
    };
  }
}

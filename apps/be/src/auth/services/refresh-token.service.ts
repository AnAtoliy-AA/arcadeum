/**
 * Refresh token management service.
 * Handles refresh token issuance, validation, and rotation.
 */
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { BCRYPT_SALT_ROUNDS } from '../../common/constants/bcrypt';
import {
  RefreshToken,
  RefreshTokenDocument,
} from '../schemas/refresh-token.schema';
import { User, UserDocument } from '../schemas/user.schema';
import type {
  AuthTokensResponse,
  AuthUserProfile,
  IssuedRefreshToken,
} from '../lib/types';

/** Cap for the legacy-format fallback scan: ~50 bcrypt compares worst case. */
const LEGACY_TOKEN_SCAN_LIMIT = 50;

@Injectable()
export class RefreshTokenService {
  private readonly logger = new Logger(RefreshTokenService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectModel(RefreshToken.name)
    private readonly refreshModel: Model<RefreshTokenDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Issue a new refresh token for a user.
   */
  async issueRefreshToken(
    userId: string,
    parentId: string | null,
    rememberMe: boolean = false,
  ): Promise<IssuedRefreshToken> {
    const raw = crypto.randomUUID() + '.' + crypto.randomUUID();
    const tokenId = this.extractRefreshTokenId(raw);
    const hash = await bcrypt.hash(raw, BCRYPT_SALT_ROUNDS);
    const baseTtlDays = Number(
      this.config.get<string>('REFRESH_TOKEN_TTL_DAYS') || '7',
    );
    // Extend TTL to 30 days when rememberMe is true
    const ttlDays = rememberMe ? 30 : baseTtlDays;
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
    const rotationParentId = parentId || 'root';
    const doc = await this.refreshModel.create({
      userId,
      ...(tokenId ? { tokenId } : {}),
      tokenHash: hash,
      expiresAt,
      rotationParentId,
    });
    return { token: raw, expiresAt, id: String(doc.id) };
  }

  /**
   * Extract the token ID from a raw refresh token.
   */
  extractRefreshTokenId(raw: string): string | null {
    if (!raw) return null;
    const delimiterIndex = raw.indexOf('.');
    if (delimiterIndex === -1) {
      return raw;
    }
    const tokenId = raw.slice(0, delimiterIndex);
    return tokenId || null;
  }

  /**
   * Find a refresh token document by raw token value.
   *
   * Modern tokens embed their indexed tokenId in the first segment, so the
   * lookup above resolves them in O(1). A miss on a dotted (modern-format)
   * token means it was never issued — no scan can match. Only legacy
   * format-less tokens fall through to a bcrypt comparison, which is bounded
   * to the newest live tokens so worst-case latency stays flat as sessions
   * grow.
   */
  async findRefreshTokenDocument(
    raw: string,
  ): Promise<RefreshTokenDocument | null> {
    const tokenId = this.extractRefreshTokenId(raw);
    if (tokenId) {
      const byId = await this.refreshModel.findOne({ tokenId });
      if (byId) {
        return byId;
      }
      if (raw.includes('.')) {
        return null;
      }
    }

    const candidates = await this.refreshModel
      .find({
        revoked: false,
        expiresAt: { $gt: new Date() },
      })
      .sort({ createdAt: -1 })
      .limit(LEGACY_TOKEN_SCAN_LIMIT)
      .exec();
    for (const candidate of candidates) {
      if (await bcrypt.compare(raw, candidate.tokenHash)) {
        return candidate;
      }
    }

    return null;
  }

  /**
   * Revoke every live refresh token for a user (token-family kill switch).
   * Used when reuse/theft of a revoked token is detected or when the
   * account becomes ineligible to hold sessions.
   */
  private async revokeAllForUser(userId: string): Promise<void> {
    await this.refreshModel.updateMany(
      { userId: new Types.ObjectId(userId), revoked: false },
      { $set: { revoked: true } },
    );
  }

  /**
   * Derive access token expiration from JWT payload.
   */
  deriveAccessTokenExpiration(token: string): Date | null {
    const decoded: unknown = this.jwt.decode(token);
    if (!decoded || typeof decoded !== 'object') {
      return null;
    }
    const payload = decoded as Record<string, unknown>;
    const expValue = payload['exp'];
    if (typeof expValue !== 'number') {
      return null;
    }
    return new Date(expValue * 1000);
  }

  /**
   * Refresh an access token using a refresh token.
   * Implements token rotation.
   */
  async refreshToken(
    rawToken: string,
    buildUserProfile: (user: UserDocument) => AuthUserProfile,
    ensureUserUsername: (user: UserDocument) => Promise<UserDocument>,
  ): Promise<AuthTokensResponse> {
    const candidate = rawToken?.trim();
    if (!candidate) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const stored = await this.findRefreshTokenDocument(candidate);
    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.revoked) {
      // Presenting an already-rotated/revoked token means it was copied —
      // assume theft and kill the whole token family for this user.
      this.logger.warn(
        `Refresh token reuse detected for user ${String(stored.userId)} — revoking all sessions`,
      );
      await this.revokeAllForUser(String(stored.userId));
      throw new UnauthorizedException('Refresh token revoked');
    }

    if (stored.expiresAt.getTime() <= Date.now()) {
      stored.revoked = true;
      await stored.save();
      throw new UnauthorizedException('Refresh token expired');
    }

    const matches = await bcrypt.compare(candidate, stored.tokenHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const userId = String(stored.userId);
    if (!Types.ObjectId.isValid(userId)) {
      stored.revoked = true;
      await stored.save();
      throw new UnauthorizedException(
        'Invalid user ID format in refresh token',
      );
    }
    const userDoc = await this.userModel.findById(userId);
    if (!userDoc) {
      stored.revoked = true;
      await stored.save();
      throw new UnauthorizedException('User not found for refresh token');
    }

    // Blocked or deleted accounts must not be able to mint new sessions —
    // the per-request RolesGuard only protects admin surfaces.
    if (userDoc.isBlocked || userDoc.deletedAt) {
      await this.revokeAllForUser(userId);
      throw new UnauthorizedException('Account is no longer active');
    }

    const user = await ensureUserUsername(userDoc);
    const accessToken = await this.jwt.signAsync({
      sub: userId,
      email: user.email,
      username: user.username,
    });
    const accessTokenExpiresAt = this.deriveAccessTokenExpiration(accessToken);

    const rotated = await this.issueRefreshToken(userId, String(stored.id));
    stored.revoked = true;
    await stored.save();

    return {
      accessToken,
      accessTokenExpiresAt,
      refreshToken: rotated.token,
      refreshTokenExpiresAt: rotated.expiresAt,
      user: buildUserProfile(user),
    };
  }
}

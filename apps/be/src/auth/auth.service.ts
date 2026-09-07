import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '../common/constants/bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { OAuthLoginDto } from './dtos/oauth-login.dto';
import {
  OAuthClientService,
  RefreshTokenService,
  GoogleOAuthService,
  AppleOAuthService,
  DiscordOAuthService,
} from './services';
import { LoginLockoutService } from './services/login-lockout.service';
import { escapeRegExp } from '../common/utils/escape-regexp';
import {
  buildAuthUserProfile,
  ensureUserUsername,
  resolveDisplayName,
} from './auth-helpers';
import type {
  AuthUserProfile,
  AuthTokensResponse,
  OAuthTokenResponse,
  UserRole,
} from './lib/types';
import { ReferralService } from '../referrals/referral.service';
import { InventoryService } from '../shop/services/inventory.service';
import { SignupRewardService } from './services';
import { ModuleRef } from '@nestjs/core';
import { GeoLookupService } from '../common/geo/geo-lookup.service';
import {
  Friendship,
  FriendshipDocument,
} from '../friends/schemas/friendship.schema';
import { AuthOAuthHandler } from './auth-oauth.handler';

export type {
  OAuthTokenResponse,
  AuthUserProfile,
  AuthTokensResponse,
} from './lib/types';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Friendship.name)
    private readonly friendshipModel: Model<FriendshipDocument>,
    private readonly jwt: JwtService,
    private readonly oauthClient: OAuthClientService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly googleOAuth: GoogleOAuthService,
    private readonly appleOAuth: AppleOAuthService,
    private readonly discordOAuth: DiscordOAuthService,
    @Inject(forwardRef(() => ReferralService))
    private readonly referralService: ReferralService,
    private readonly signupReward: SignupRewardService,
    private readonly moduleRef: ModuleRef,
    private readonly lockoutService: LoginLockoutService,
    private readonly geoLookup: GeoLookupService,
  ) {}

  private async grantStarterItems(userId: string): Promise<void> {
    try {
      const inv = this.moduleRef.get(InventoryService, { strict: false });
      await inv.grantStarter(userId);
    } catch {
      // ShopInventoryBootstrap is the safety net.
    }
  }

  /**
   * Best-effort: resolve the country from the request IP and persist it on
   * the user so the leaderboard can show a real flag/region. Never blocks
   * or fails the auth flow — failures are swallowed.
   */
  private async attachCountryFromIp(
    userId: string,
    ip: string | null | undefined,
  ): Promise<void> {
    if (!ip) return;
    try {
      const countryCode = await this.geoLookup.getCountry(ip);
      if (!countryCode) return;
      await this.userModel.updateOne(
        { _id: userId },
        { $set: { countryCode } },
      );
    } catch {
      // Non-critical
    }
  }

  async exchangeCode(params: {
    code: string;
    codeVerifier?: string;
    redirectUri?: string;
    requestOrigin?: string;
  }): Promise<OAuthTokenResponse> {
    return this.googleOAuth.exchangeCode(params);
  }

  async register(
    data: RegisterDto,
    ip?: string | null,
  ): Promise<AuthUserProfile> {
    const email = data.email.toLowerCase();
    const username = data.username.trim();
    const usernameNormalized = username.toLowerCase();

    const [existingEmail, existingUsername] = await Promise.all([
      this.userModel.exists({ email }),
      this.userModel.exists({ usernameNormalized }),
    ]);

    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);
    const created = await this.userModel.create({
      email,
      passwordHash,
      username,
      usernameNormalized,
    });

    if (data.referralCode) {
      try {
        const referrerId = await this.referralService.trackReferral(
          data.referralCode,
          (created as UserDocument).id as string,
        );
        if (referrerId) {
          await this.friendshipModel.create({
            requesterId: new Types.ObjectId(referrerId),
            addresseeId: new Types.ObjectId(
              (created as UserDocument).id as string,
            ),
            status: 'accepted',
          });
        }
      } catch {
        // Non-critical
      }
    }

    await this.grantStarterItems((created as UserDocument).id as string);
    await this.signupReward.grant((created as UserDocument).id as string);

    void this.attachCountryFromIp((created as UserDocument).id as string, ip);

    return buildAuthUserProfile(created);
  }

  async checkUsernameAvailable(
    username: string,
  ): Promise<{ available: boolean }> {
    const normalized = username.trim().toLowerCase();
    if (!normalized || normalized.length < 3) {
      return { available: false };
    }
    const exists = await this.userModel.exists({
      usernameNormalized: normalized,
    });
    return { available: !exists };
  }

  async checkEmailAvailable(email: string): Promise<{ available: boolean }> {
    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      return { available: false };
    }
    const exists = await this.userModel.exists({ email: normalized });
    return { available: !exists };
  }

  async login(data: LoginDto, ip?: string | null): Promise<AuthTokensResponse> {
    const email = data.email.toLowerCase();

    if (await this.lockoutService.isLocked(email)) {
      const remainingMs =
        await this.lockoutService.getLockoutRemainingMs(email);
      const remainingMin = Math.ceil(remainingMs / 60_000);
      throw new UnauthorizedException(
        `Account locked due to too many failed attempts. Try again in ${remainingMin} minute${remainingMin > 1 ? 's' : ''}.`,
      );
    }

    const userDoc = await this.userModel.findOne({ email });
    if (!userDoc) {
      await this.lockoutService.recordFailure(email);
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await ensureUserUsername(userDoc, this.userModel);

    if (user.isBlocked) {
      throw new UnauthorizedException('Account is blocked');
    }

    if (user.deletedAt) {
      throw new UnauthorizedException('Account has been removed');
    }

    const passwordOk = await bcrypt.compare(data.password, user.passwordHash);
    if (!passwordOk) {
      await this.lockoutService.recordFailure(email);
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.lockoutService.recordSuccess(email);

    // Existing accounts predate country capture — backfill on login.
    if (!user.countryCode) {
      void this.attachCountryFromIp(String(user.id), ip);
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
      data.rememberMe,
    );
    return {
      accessToken,
      accessTokenExpiresAt,
      refreshToken: refresh.token,
      refreshTokenExpiresAt: refresh.expiresAt,
      user: buildAuthUserProfile(user),
    };
  }

  async loginWithOAuth(
    data: OAuthLoginDto,
    ip?: string | null,
  ): Promise<AuthTokensResponse> {
    // Delegate to the OAuth handler which manages all providers
    const oauthHandler = new AuthOAuthHandler(
      this.userModel,
      this.jwt,
      this.googleOAuth,
      this.appleOAuth,
      this.discordOAuth,
      this.refreshTokenService,
      this.lockoutService,
      this.geoLookup,
    );
    return oauthHandler.loginWithOAuth(data, ip);
  }

  async refreshToken(rawToken: string): Promise<AuthTokensResponse> {
    return this.refreshTokenService.refreshToken(
      rawToken,
      (user) => buildAuthUserProfile(user),
      (user) => ensureUserUsername(user, this.userModel),
    );
  }

  async searchUsers(params: {
    query: string;
    requestingUserId: string;
    limit?: number;
    includeSelf?: boolean;
  }): Promise<
    Array<{
      id: string;
      email: string;
      username: string;
      displayName: string;
      role: UserRole;
    }>
  > {
    const trimmed = params.query?.trim();
    if (!trimmed) {
      return [];
    }

    const limit = Math.min(Math.max(params.limit ?? 10, 1), 25);
    const pattern = new RegExp(escapeRegExp(trimmed), 'i');
    const orConditions: Record<string, unknown>[] = [
      { username: pattern },
      { usernameNormalized: pattern },
      { email: pattern },
      { displayName: pattern },
    ];

    if (Types.ObjectId.isValid(trimmed)) {
      orConditions.push({ _id: new Types.ObjectId(trimmed) });
    }

    const query: Record<string, unknown> = {
      $or: orConditions,
    };
    if (!params.includeSelf) {
      query._id = { $ne: params.requestingUserId };
    }

    const users = await this.userModel
      .find(query)
      .select('username email usernameNormalized displayName role')
      .sort({ usernameNormalized: 1 })
      .limit(limit)
      .lean()
      .exec();

    return users.map((user) => ({
      id: String(user._id),
      email: user.email,
      username: user.username,
      displayName: resolveDisplayName(user),
      role: user.role ?? 'free',
    }));
  }

  async getUserProfileById(userId: string): Promise<AuthUserProfile> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new UnauthorizedException('User not found');
    }
    const doc = await this.userModel.findById(userId);
    if (!doc) {
      throw new UnauthorizedException('User not found');
    }
    const ensured = await ensureUserUsername(doc, this.userModel);
    return buildAuthUserProfile(ensured);
  }

  async getPublicProfile(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('User not found');
    }
    const doc = await this.userModel
      .findById(userId)
      .select(
        'username displayName role xp equippedAvatarId equippedBadgeId equippedNameColorId equippedFrameId equippedAuraId equippedBannerId countryCode createdAt',
      )
      .lean();
    if (!doc) {
      throw new NotFoundException('User not found');
    }
    return {
      id: String(doc._id),
      username: doc.username,
      displayName: (doc as { displayName?: string }).displayName ?? null,
      role: doc.role ?? 'free',
      xp: (doc as { xp?: number }).xp ?? 0,
      equippedAvatarId:
        (doc as { equippedAvatarId?: string | null }).equippedAvatarId ?? null,
      equippedBadgeId:
        (doc as { equippedBadgeId?: string | null }).equippedBadgeId ?? null,
      equippedNameColorId:
        (doc as { equippedNameColorId?: string | null }).equippedNameColorId ??
        null,
      equippedFrameId:
        (doc as { equippedFrameId?: string | null }).equippedFrameId ?? null,
      equippedAuraId:
        (doc as { equippedAuraId?: string | null }).equippedAuraId ?? null,
      equippedBannerId:
        (doc as { equippedBannerId?: string | null }).equippedBannerId ?? null,
      countryCode: (doc as { countryCode?: string | null }).countryCode ?? null,
      createdAt: (doc as { createdAt?: Date }).createdAt?.toISOString() ?? null,
    };
  }

  async blockUser(userId: string, blockedUserId: string): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      { $addToSet: { blockedUsers: blockedUserId } },
    );
  }

  async unblockUser(userId: string, blockedUserId: string): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      { $pull: { blockedUsers: blockedUserId } },
    );
  }

  async isUserBlocked(
    userId: string,
    potentiallyBlockedUserId: string,
  ): Promise<boolean> {
    if (!Types.ObjectId.isValid(userId)) return false;
    const user = await this.userModel
      .findById(userId)
      .select('blockedUsers')
      .lean();
    return user
      ? (user.blockedUsers || []).includes(potentiallyBlockedUserId)
      : false;
  }

  async getBlockedUsers(userId: string): Promise<string[]> {
    if (!Types.ObjectId.isValid(userId)) return [];
    const user = await this.userModel
      .findById(userId)
      .select('blockedUsers')
      .lean();
    return user?.blockedUsers || [];
  }

  async getBlockedUsersWithDetails(
    userId: string,
  ): Promise<Array<{ id: string; displayName: string; username: string }>> {
    if (!Types.ObjectId.isValid(userId)) return [];
    const user = await this.userModel
      .findById(userId)
      .select('blockedUsers')
      .lean();
    if (!user?.blockedUsers?.length) return [];
    const blocked = await this.userModel
      .find({ _id: { $in: user.blockedUsers } })
      .select('displayName username email')
      .lean();
    return blocked.map((u) => ({
      id: u._id.toString(),
      displayName: u.displayName || u.username || u.email || 'Unknown',
      username: u.username || '',
    }));
  }
}

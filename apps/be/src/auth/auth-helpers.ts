import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Model } from 'mongoose';
import { BCRYPT_SALT_ROUNDS } from '../common/constants/bcrypt';
import type { User, UserDocument } from './schemas/user.schema';
import type {
  GoogleUserProfile,
  AppleUserProfile,
  DiscordUserProfile,
  AuthUserProfile,
} from './lib/types';

/**
 * Extract common profile fields from any OAuth provider profile.
 */
function extractOAuthProfileFields(
  profile: GoogleUserProfile | AppleUserProfile | DiscordUserProfile,
): { sub: string; email: string; emailVerified: boolean; name?: string } {
  return {
    sub: profile.sub,
    email: profile.email.toLowerCase(),
    emailVerified: profile.emailVerified,
    // Discord uses username instead of name
    name: 'name' in profile ? profile.name : undefined,
  };
}

export function sanitizeUsernameCandidate(source: string): string {
  const base = source.replace(/[^a-zA-Z0-9_-]/g, '');
  if (base.length >= 3) return base;
  return `user${crypto.randomInt(1000, 10000)}`;
}

export async function ensureUserUsername(
  user: UserDocument,
  userModel: Model<UserDocument>,
): Promise<UserDocument> {
  if (user.username && user.usernameNormalized) {
    return user;
  }

  const emailLocal = user.email.split('@')[0] ?? 'user';
  const base = sanitizeUsernameCandidate(emailLocal);
  let candidate = base;
  let normalized = candidate.toLowerCase();
  let suffix = 1;

  while (
    await userModel.exists({
      usernameNormalized: normalized,
      _id: { $ne: user._id },
    })
  ) {
    candidate = `${base}${suffix}`;
    normalized = candidate.toLowerCase();
    suffix += 1;
  }

  user.username = candidate;
  user.usernameNormalized = normalized;
  await user.save();
  return user;
}

export async function getOrCreateOAuthUser(
  profile: GoogleUserProfile | AppleUserProfile | DiscordUserProfile,
  userModel: Model<UserDocument>,
  grantStarterItems: (userId: string) => Promise<void>,
  grantSignupReward: (userId: string) => Promise<void>,
): Promise<UserDocument> {
  const { email, name } = extractOAuthProfileFields(profile);
  const existing = await userModel.findOne({ email });
  if (existing) {
    const ensured = await ensureUserUsername(existing, userModel);
    const preferredDisplay = name?.trim();
    if (preferredDisplay && ensured.displayName !== preferredDisplay) {
      ensured.displayName = preferredDisplay;
      await ensured.save();
    }
    return ensured;
  }

  const preferredName = name?.trim() || email.split('@')[0] || 'user';
  const base = sanitizeUsernameCandidate(preferredName);
  let candidate = base;
  let normalized = candidate.toLowerCase();
  let suffix = 1;

  while (await userModel.exists({ usernameNormalized: normalized })) {
    candidate = `${base}${suffix}`;
    normalized = candidate.toLowerCase();
    suffix += 1;
  }

  const placeholderPassword = await bcrypt.hash(
    crypto.randomUUID(),
    BCRYPT_SALT_ROUNDS,
  );

  const created = await userModel.create({
    email,
    passwordHash: placeholderPassword,
    username: candidate,
    usernameNormalized: normalized,
    displayName: name?.trim() || undefined,
  });

  await grantStarterItems((created as UserDocument).id as string);
  await grantSignupReward((created as UserDocument).id as string);

  return created;
}

export function resolveDisplayName(
  user: Pick<User, 'displayName' | 'username' | 'email'>,
): string {
  const preferred = user.displayName?.trim?.();
  if (preferred) return preferred;
  const username = user.username?.trim?.();
  if (username) return username;
  const [localPart] = user.email?.split?.('@') ?? [];
  const local = localPart?.trim?.();
  if (local) return local;
  return user.email;
}

export function buildAuthUserProfile(user: UserDocument): AuthUserProfile {
  const profile: AuthUserProfile = {
    id: String(user.id),
    email: user.email,
    username: user.username,
    displayName: resolveDisplayName(user),
    role: user.role ?? 'free',
    xp: user.xp ?? 0,
    equippedAvatarId: user.equippedAvatarId ?? null,
    equippedBadgeId: user.equippedBadgeId ?? null,
    equippedNameColorId: user.equippedNameColorId ?? null,
    equippedFrameId: user.equippedFrameId ?? null,
    equippedAuraId: user.equippedAuraId ?? null,
    equippedBannerId: user.equippedBannerId ?? null,
    equippedGameSkinId: user.equippedGameSkinId ?? null,
    equippedBackgroundId: user.equippedBackgroundId ?? null,
  };

  const createdAt = (user as Partial<{ createdAt: Date }>).createdAt;
  if (createdAt instanceof Date) profile.createdAt = createdAt;
  return profile;
}

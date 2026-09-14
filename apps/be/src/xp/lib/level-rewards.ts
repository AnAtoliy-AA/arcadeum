import { Types, type Model } from 'mongoose';
import type { UserInventoryItemDocument } from '../../shop/schemas/user-inventory-item.schema';

export interface LevelBadgeReward {
  level: number;
  badgeId: string;
}

export const LEVEL_BADGE_REWARDS: readonly LevelBadgeReward[] = [
  { level: 1, badgeId: 'badge-newcomer' },
  { level: 5, badgeId: 'badge-scout' },
  { level: 10, badgeId: 'badge-veteran' },
  { level: 15, badgeId: 'badge-gladiator' },
  { level: 20, badgeId: 'badge-guardian' },
  { level: 25, badgeId: 'badge-champion' },
  { level: 30, badgeId: 'badge-conqueror' },
  { level: 35, badgeId: 'badge-paladin' },
  { level: 40, badgeId: 'badge-warlord' },
  { level: 45, badgeId: 'badge-juggernaut' },
  { level: 50, badgeId: 'badge-vanguard' },
  { level: 55, badgeId: 'badge-paragon' },
  { level: 60, badgeId: 'badge-grandmaster' },
  { level: 65, badgeId: 'badge-titan' },
  { level: 70, badgeId: 'badge-ascendant' },
  { level: 75, badgeId: 'badge-elite' },
  { level: 80, badgeId: 'badge-archon' },
  { level: 85, badgeId: 'badge-sovereign' },
  { level: 90, badgeId: 'badge-legend' },
  { level: 95, badgeId: 'badge-nexus' },
  { level: 99, badgeId: 'badge-mythic' },
] as const;

export function getBadgesUnlockedAtLevel(level: number): string[] {
  return LEVEL_BADGE_REWARDS.filter((r) => r.level <= level).map(
    (r) => r.badgeId,
  );
}

export function getRewardForExactLevel(
  level: number,
): LevelBadgeReward | undefined {
  return LEVEL_BADGE_REWARDS.find((r) => r.level === level);
}

export function getCoinsForLevel(level: number): number {
  return level * 50;
}

export async function grantLevelBadges(
  userId: string | Types.ObjectId,
  level: number,
  inventoryModel: Model<UserInventoryItemDocument>,
): Promise<void> {
  const eligibleBadges = getBadgesUnlockedAtLevel(level);
  if (eligibleBadges.length === 0) return;

  const userObjId =
    userId instanceof Types.ObjectId
      ? userId
      : Types.ObjectId.isValid(userId)
        ? new Types.ObjectId(userId)
        : new Types.ObjectId('000000000000000000000000');

  const ops = eligibleBadges.map((badgeId) => ({
    updateOne: {
      filter: {
        userId: userObjId,
        itemId: badgeId,
      },
      update: {
        $setOnInsert: {
          userId: userObjId,
          itemId: badgeId,
          purchaseId: `level-reward-${String(userObjId)}-${badgeId}`,
          acquiredVia: 'grant' as const,
          paidAmount: null,
          paidCurrency: null,
          soldAt: null,
        },
      },
      upsert: true,
    },
  }));

  try {
    await inventoryModel.bulkWrite(ops, { ordered: false });
  } catch {
    return;
  }
}

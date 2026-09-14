export interface LevelBadgeReward {
  level: number;
  badgeId: string;
  assetUrl: string;
  nameKey: string;
  descKey: string;
}

export const LEVEL_BADGE_REWARDS: readonly LevelBadgeReward[] = [
  {
    level: 1,
    badgeId: 'badge-newcomer',
    assetUrl: '/shop/badges/newcomer.png',
    nameKey: 'items.badge.newcomer.name',
    descKey: 'items.badge.newcomer.desc',
  },
  {
    level: 5,
    badgeId: 'badge-scout',
    assetUrl: '/shop/badges/scout.png',
    nameKey: 'items.badge.scout.name',
    descKey: 'items.badge.scout.desc',
  },
  {
    level: 10,
    badgeId: 'badge-veteran',
    assetUrl: '/shop/badges/veteran.png',
    nameKey: 'items.badge.veteran.name',
    descKey: 'items.badge.veteran.desc',
  },
  {
    level: 15,
    badgeId: 'badge-gladiator',
    assetUrl: '/shop/badges/gladiator.png',
    nameKey: 'items.badge.gladiator.name',
    descKey: 'items.badge.gladiator.desc',
  },
  {
    level: 20,
    badgeId: 'badge-guardian',
    assetUrl: '/shop/badges/guardian.png',
    nameKey: 'items.badge.guardian.name',
    descKey: 'items.badge.guardian.desc',
  },
  {
    level: 25,
    badgeId: 'badge-champion',
    assetUrl: '/shop/badges/champion.png',
    nameKey: 'items.badge.champion.name',
    descKey: 'items.badge.champion.desc',
  },
  {
    level: 30,
    badgeId: 'badge-conqueror',
    assetUrl: '/shop/badges/conqueror.png',
    nameKey: 'items.badge.conqueror.name',
    descKey: 'items.badge.conqueror.desc',
  },
  {
    level: 35,
    badgeId: 'badge-paladin',
    assetUrl: '/shop/badges/paladin.png',
    nameKey: 'items.badge.paladin.name',
    descKey: 'items.badge.paladin.desc',
  },
  {
    level: 40,
    badgeId: 'badge-warlord',
    assetUrl: '/shop/badges/warlord.png',
    nameKey: 'items.badge.warlord.name',
    descKey: 'items.badge.warlord.desc',
  },
  {
    level: 45,
    badgeId: 'badge-juggernaut',
    assetUrl: '/shop/badges/juggernaut.png',
    nameKey: 'items.badge.juggernaut.name',
    descKey: 'items.badge.juggernaut.desc',
  },
  {
    level: 50,
    badgeId: 'badge-vanguard',
    assetUrl: '/shop/badges/vanguard.png',
    nameKey: 'items.badge.vanguard.name',
    descKey: 'items.badge.vanguard.desc',
  },
  {
    level: 55,
    badgeId: 'badge-paragon',
    assetUrl: '/shop/badges/paragon.png',
    nameKey: 'items.badge.paragon.name',
    descKey: 'items.badge.paragon.desc',
  },
  {
    level: 60,
    badgeId: 'badge-grandmaster',
    assetUrl: '/shop/badges/grandmaster.png',
    nameKey: 'items.badge.grandmaster.name',
    descKey: 'items.badge.grandmaster.desc',
  },
  {
    level: 65,
    badgeId: 'badge-titan',
    assetUrl: '/shop/badges/titan.png',
    nameKey: 'items.badge.titan.name',
    descKey: 'items.badge.titan.desc',
  },
  {
    level: 70,
    badgeId: 'badge-ascendant',
    assetUrl: '/shop/badges/ascendant.png',
    nameKey: 'items.badge.ascendant.name',
    descKey: 'items.badge.ascendant.desc',
  },
  {
    level: 75,
    badgeId: 'badge-elite',
    assetUrl: '/shop/badges/elite.png',
    nameKey: 'items.badge.elite.name',
    descKey: 'items.badge.elite.desc',
  },
  {
    level: 80,
    badgeId: 'badge-archon',
    assetUrl: '/shop/badges/archon.png',
    nameKey: 'items.badge.archon.name',
    descKey: 'items.badge.archon.desc',
  },
  {
    level: 85,
    badgeId: 'badge-sovereign',
    assetUrl: '/shop/badges/sovereign.png',
    nameKey: 'items.badge.sovereign.name',
    descKey: 'items.badge.sovereign.desc',
  },
  {
    level: 90,
    badgeId: 'badge-legend',
    assetUrl: '/shop/badges/legend.png',
    nameKey: 'items.badge.legend.name',
    descKey: 'items.badge.legend.desc',
  },
  {
    level: 95,
    badgeId: 'badge-nexus',
    assetUrl: '/shop/badges/nexus.png',
    nameKey: 'items.badge.nexus.name',
    descKey: 'items.badge.nexus.desc',
  },
  {
    level: 99,
    badgeId: 'badge-mythic',
    assetUrl: '/shop/badges/mythic.png',
    nameKey: 'items.badge.mythic.name',
    descKey: 'items.badge.mythic.desc',
  },
] as const;

export function getRewardForLevel(level: number): LevelBadgeReward | undefined {
  return LEVEL_BADGE_REWARDS.find((r) => r.level === level);
}

export function getRewardForBadge(
  badgeId: string,
): LevelBadgeReward | undefined {
  return LEVEL_BADGE_REWARDS.find((r) => r.badgeId === badgeId);
}

export function getLevelForBadge(badgeId: string): number | null {
  const reward = getRewardForBadge(badgeId);
  return reward ? reward.level : null;
}

export function getCoinsForLevel(level: number): number {
  return level * 50;
}

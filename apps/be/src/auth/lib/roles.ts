/**
 * User Roles Configuration
 *
 * This file defines all available user roles in the system.
 * Each role has a unique identifier, display properties, and feature access levels.
 */

/** Available user roles */
export const USER_ROLES = [
  'free',
  'premium',
  'vip',
  'supporter',
  'moderator',
  'tester',
  'developer',
  'admin',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

/**
 * Role metadata and descriptions
 */
export interface RoleInfo {
  /** Role identifier */
  id: UserRole;
  /** Priority for display ordering (higher = more prominent) */
  priority: number;
  /** Role description */
  description: string;
  /** Features/perks included with this role */
  features: string[];
}

/**
 * Complete role definitions with descriptions and features
 */
export const ROLE_INFO: Record<UserRole, RoleInfo> = {
  free: {
    id: 'free',
    priority: 0,
    description: 'Default account with basic access',
    features: [
      'Create and join public game rooms',
      'Basic chat functionality',
      'View game history',
    ],
  },
  premium: {
    id: 'premium',
    priority: 10,
    description: 'Paid subscription with enhanced features',
    features: [
      'All free features',
      'Create private game rooms',
      'Priority matchmaking',
      'Custom avatars',
      'Ad-free experience',
    ],
  },
  vip: {
    id: 'vip',
    priority: 20,
    description: 'Top-tier subscription with exclusive perks',
    features: [
      'All premium features',
      'Exclusive VIP badge',
      'Early access to new games',
      'VIP-only game rooms',
      'Priority customer support',
    ],
  },
  supporter: {
    id: 'supporter',
    priority: 15,
    description: 'Community supporters and donors',
    features: [
      'All free features',
      'Supporter badge recognition',
      'Access to supporter channels',
      'Special in-game cosmetics',
    ],
  },
  moderator: {
    id: 'moderator',
    priority: 50,
    description: 'Community moderators with moderation tools',
    features: [
      'All free features',
      'Mute/kick players from rooms',
      'Access to moderation logs',
      'Report management tools',
    ],
  },
  tester: {
    id: 'tester',
    priority: 30,
    description: 'Beta testers with early access',
    features: [
      'All free features',
      'Access to beta features',
      'Early access to new games',
      'Bug reporting tools',
      'Tester-only feedback channels',
    ],
  },
  developer: {
    id: 'developer',
    priority: 80,
    description: 'Development team members',
    features: [
      'All features',
      'Debug tools access',
      'Game state manipulation',
      'Developer badge',
    ],
  },
  admin: {
    id: 'admin',
    priority: 100,
    description: 'Full administrative access',
    features: [
      'All features',
      'User management',
      'System configuration',
      'Analytics access',
      'Full moderation powers',
    ],
  },
};

/**
 * Get role info by role ID
 */
export function getRoleInfo(role: UserRole): RoleInfo {
  return ROLE_INFO[role];
}

/**
 * Check if a role has higher priority than another
 */
export function hasHigherPriority(role1: UserRole, role2: UserRole): boolean {
  return ROLE_INFO[role1].priority > ROLE_INFO[role2].priority;
}

/**
 * Get sorted roles by priority (highest first)
 */
export function getRolesByPriority(): UserRole[] {
  return [...USER_ROLES].sort(
    (a, b) => ROLE_INFO[b].priority - ROLE_INFO[a].priority,
  );
}

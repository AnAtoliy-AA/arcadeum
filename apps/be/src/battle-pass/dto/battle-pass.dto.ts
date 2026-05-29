import { IsInt, Min } from 'class-validator';
import type {
  BattlePassReward,
  BattlePassTier,
} from '../battle-pass.constants';

/** Full Battle Pass state for the requesting player. */
export type BattlePassStateDto = {
  season: {
    id: string;
    title: string;
    startsAt: string;
    endsAt: string;
    tiers: BattlePassTier[];
  };
  /** Derived season XP. */
  xp: number;
  /** Highest unlocked tier (0 when below tier 1's threshold). */
  currentTier: number;
  /** Tiers the player has already claimed. */
  claimedTiers: number[];
  /** Whether the player's role unlocks the premium reward lane. */
  isPremium: boolean;
};

/** Result of claiming a tier's rewards. */
export type ClaimResultDto = {
  tier: number;
  claimedTiers: number[];
  rewards: BattlePassReward[];
};

export class ClaimTierDto {
  @IsInt()
  @Min(1)
  tier!: number;
}

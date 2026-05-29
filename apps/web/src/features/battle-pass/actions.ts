'use server';

import { revalidatePath } from 'next/cache';
import { claimBattlePassTier } from './server/battle-pass.server';
import type { ClaimResult } from './server/battle-pass.types';

/**
 * Server action: claim a Battle Pass tier's rewards. Re-validates the page so
 * the rail reflects the new claimed state. Errors propagate to the caller for
 * inline handling.
 */
export async function claimTierAction(tier: number): Promise<ClaimResult> {
  const result = await claimBattlePassTier(tier);
  revalidatePath('/[locale]/battle-pass', 'page');
  return result;
}

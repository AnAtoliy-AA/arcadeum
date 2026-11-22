import type { ArcadePetEconomyError, PetSpecies } from '@arcadeum/games-core';
import { GIFT_PET_COST_GEMS } from '@arcadeum/games-core';
import { sendEconomyAction } from './arcade-pet-server-actions';
import type { ArcadePetStoreState } from './arcade-pet-store-types';

type Getter = () => ArcadePetStoreState;
type Setter = (partial: Partial<ArcadePetStoreState>) => void;

export interface GiftSpec {
  species: PetSpecies;
  theme: string;
  petName: string;
  message?: string;
}

/** Server rejection codes plus client-side failures (offline / transport). */
export type SendGiftError = ArcadePetEconomyError | 'OFFLINE' | 'FAILED';

export interface SendGiftResult {
  success: boolean;
  error?: SendGiftError;
}

/**
 * The gift is delivered to the recipient's collection by the server, which
 * also charges the sender and decides admin pricing. There is no offline
 * fallback: a gift only makes sense when it can reach another player.
 */
export async function sendGiftPet(
  get: Getter,
  set: Setter,
  recipientName: string,
  gift: GiftSpec,
  isAdmin: boolean,
): Promise<SendGiftResult> {
  const { gemBalance, serverBacked } = get();
  const giftCost = isAdmin ? 0 : GIFT_PET_COST_GEMS;
  if (gemBalance < giftCost) {
    return { success: false, error: 'INSUFFICIENT_GEMS' };
  }

  if (!serverBacked) return { success: false, error: 'OFFLINE' };

  const result = await sendEconomyAction(get, set, {
    type: 'send_gift',
    recipientUsername: recipientName,
    ...gift,
  });
  if (!result) return { success: false, error: 'FAILED' };
  return result.ok
    ? { success: true }
    : { success: false, error: result.error };
}

import type { PetSpecies } from '@arcadeum/games-core';
import { GIFT_PET_COST_GEMS } from '@arcadeum/games-core';
import type { PetGiftPresent } from '../lib/arcade-pet-economy';
import { persistStore } from './arcade-pet-storage';
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

export interface SendGiftResult {
  success: boolean;
  error?: 'INSUFFICIENT_GEMS' | 'RECIPIENT_NOT_FOUND' | 'SELF_GIFT' | 'FAILED';
}

/**
 * Server-backed: the gift is delivered to the recipient's collection by the
 * server (which also charges the sender and decides admin pricing).
 * Local-only fallback: the gift lands in the player's own presents.
 */
export async function sendGiftPet(
  get: Getter,
  set: Setter,
  recipientName: string,
  gift: GiftSpec,
  isAdmin: boolean,
): Promise<SendGiftResult> {
  const { gemBalance, presents, serverBacked } = get();
  const giftCost = isAdmin ? 0 : GIFT_PET_COST_GEMS;
  if (gemBalance < giftCost) {
    return { success: false, error: 'INSUFFICIENT_GEMS' };
  }

  if (serverBacked) {
    const result = await sendEconomyAction(get, set, {
      type: 'send_gift',
      recipientUsername: recipientName,
      ...gift,
    });
    if (result?.ok) return { success: true };
    const error = result?.error;
    if (
      error === 'INSUFFICIENT_GEMS' ||
      error === 'RECIPIENT_NOT_FOUND' ||
      error === 'SELF_GIFT'
    ) {
      return { success: false, error };
    }
    return { success: false, error: 'FAILED' };
  }

  const nextGems = gemBalance - giftCost;
  const newPresent: PetGiftPresent = {
    id: `gift-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    senderId: isAdmin ? 'admin' : 'friend',
    senderName: isAdmin ? '👑 Arcadeum Admin' : 'Friend',
    species: gift.species,
    theme: gift.theme,
    petName: gift.petName,
    message:
      gift.message ||
      (isAdmin ? 'Official Administrator Gift' : 'A special gift!'),
    createdAt: Date.now(),
    isOpened: false,
  };
  const nextPresents = [newPresent, ...presents];
  set({ gemBalance: nextGems, presents: nextPresents });
  persistStore({ ...get(), gemBalance: nextGems, presents: nextPresents });
  return { success: true };
}

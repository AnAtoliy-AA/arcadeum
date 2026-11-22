import { sanitizePetName } from '@arcadeum/games-core';
import { persistStore } from './arcade-pet-storage';
import type { ArcadePetStoreState } from './arcade-pet-store-types';

type Getter = () => ArcadePetStoreState;
type Setter = (partial: Partial<ArcadePetStoreState>) => void;

export function renamePet(
  get: Getter,
  set: Setter,
  petId: string,
  rawName: string,
): { success: boolean; error?: 'INVALID_NAME' | 'NOT_FOUND' } {
  const name = sanitizePetName(rawName);
  if (!name) return { success: false, error: 'INVALID_NAME' };

  const { pets, pet } = get();
  if (!pets.some((p) => p.id === petId)) {
    return { success: false, error: 'NOT_FOUND' };
  }

  const nextPets = pets.map((p) => (p.id === petId ? { ...p, name } : p));
  set({
    pets: nextPets,
    pet: pet && pet.id === petId ? { ...pet, name } : pet,
  });
  persistStore({ ...get(), pets: nextPets });
  return { success: true };
}

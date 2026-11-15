import { describe, expect, it } from 'vitest';
import { createInitialPet, type PetState } from '@arcadeum/games-core';
import { getPetAttention } from './arcade-pet-attention';

function makePet(overrides: Partial<PetState> = {}): PetState {
  const base = createInitialPet({ id: 'p1', name: 'Bit', species: 'dragon' });
  return { ...base, stage: 'baby', isSleeping: false, ...overrides };
}

describe('getPetAttention', () => {
  it('is empty for a healthy, fed pet', () => {
    const pet = makePet();
    pet.stats = { ...pet.stats, hunger: 80, hygiene: 90 };
    expect(getPetAttention(pet, false)).toEqual([]);
  });

  it('lists needs in urgency order', () => {
    const pet = makePet({ isSick: true, poopCount: 1 });
    pet.stats = { ...pet.stats, hunger: 10 };
    expect(getPetAttention(pet, false)).toEqual(['sick', 'hungry', 'dirty']);
  });

  it('asks for nothing at home, asleep, or as an egg', () => {
    const needy = makePet({ isSick: true });
    expect(getPetAttention(needy, true)).toEqual([]);
    expect(getPetAttention({ ...needy, isSleeping: true }, false)).toEqual([]);
    expect(getPetAttention({ ...needy, stage: 'egg' }, false)).toEqual([]);
  });
});

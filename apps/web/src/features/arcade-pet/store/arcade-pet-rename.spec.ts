import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialPet } from '@arcadeum/games-core';
import { renamePet } from './arcade-pet-rename';
import { useArcadePetStore } from './useArcadePetStore';

function rename(id: string, name: string) {
  return renamePet(
    () => useArcadePetStore.getState(),
    (partial) => useArcadePetStore.setState(partial),
    id,
    name,
  );
}

describe('renamePet', () => {
  beforeEach(() => {
    localStorage.clear();
    const pet = createInitialPet({ id: 'p1', name: 'Bit', species: 'dragon' });
    useArcadePetStore.setState({
      pet,
      pets: [pet],
      activePetId: 'p1',
      hasConfirmedCare: true,
    });
  });

  it('renames the pet and keeps the active pet in sync', () => {
    expect(rename('p1', '  Nova  ')).toEqual({ success: true });
    const state = useArcadePetStore.getState();
    expect(state.pets[0].name).toBe('Nova');
    expect(state.pet?.name).toBe('Nova');
  });

  it('rejects invalid names and unknown pets without changes', () => {
    expect(rename('p1', 'x')).toEqual({
      success: false,
      error: 'INVALID_NAME',
    });
    expect(rename('nope', 'Nova')).toEqual({
      success: false,
      error: 'NOT_FOUND',
    });
    expect(useArcadePetStore.getState().pet?.name).toBe('Bit');
  });
});

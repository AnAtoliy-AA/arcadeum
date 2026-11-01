import { describe, expect, it } from 'vitest';
import {
  applyDeterministicDecay,
  createInitialPet,
  executePetAction,
} from './arcade-pet.utils';

describe('ArcadePet Engine', () => {
  it('creates an initial egg pet with full base stats', () => {
    const pet = createInitialPet({ id: 'pet-1', name: 'PixelBuddy' });
    expect(pet.id).toBe('pet-1');
    expect(pet.name).toBe('PixelBuddy');
    expect(pet.stage).toBe('egg');
    expect(pet.stats.hunger).toBe(80);
    expect(pet.stats.happiness).toBe(80);
    expect(pet.inventory.chess_cookie).toBe(2);
  });

  it('hatches an egg into a baby', () => {
    const egg = createInitialPet({ id: 'pet-1', name: 'PixelBuddy' });
    const result = executePetAction(egg, 'hatch', { species: 'dragon', theme: 'cyberpunk' });
    expect(result.success).toBe(true);
    expect(result.state.stage).toBe('baby');
    expect(result.state.species).toBe('dragon');
    expect(result.state.theme).toBe('cyberpunk');
  });

  it('rejects feeding when still an egg', () => {
    const egg = createInitialPet({ id: 'pet-1', name: 'PixelBuddy' });
    const result = executePetAction(egg, 'feed_meal');
    expect(result.success).toBe(false);
    expect(result.messageCode).toBe('is_egg');
  });

  it('applies deterministic decay over elapsed time', () => {
    const egg = createInitialPet({ id: 'pet-1', name: 'PixelBuddy', now: 1000 });
    const hatched = executePetAction(egg, 'hatch', { now: 1000 }).state;

    const twoHoursLater = 1000 + 2 * 60 * 60 * 1000;
    const decayed = applyDeterministicDecay(hatched, twoHoursLater);

    expect(decayed.stats.hunger).toBeLessThan(hatched.stats.hunger);
    expect(decayed.stats.happiness).toBeLessThan(hatched.stats.happiness);
    expect(decayed.stats.energy).toBeLessThan(hatched.stats.energy);
    expect(decayed.stats.hygiene).toBeLessThan(hatched.stats.hygiene);
  });

  it('feeds meals and increases weight and hunger score', () => {
    const egg = createInitialPet({ id: 'pet-1', name: 'PixelBuddy', now: 1000 });
    const hatched = executePetAction(egg, 'hatch', { now: 1000 }).state;
    hatched.stats.hunger = 40;

    const result = executePetAction(hatched, 'feed_meal', { now: 1000 });
    expect(result.success).toBe(true);
    expect(result.state.stats.hunger).toBe(70);
    expect(result.state.stats.weight).toBe(hatched.stats.weight + 1);
  });

  it('plays with pet to increase happiness and cost energy', () => {
    const egg = createInitialPet({ id: 'pet-1', name: 'PixelBuddy', now: 1000 });
    const hatched = executePetAction(egg, 'hatch', { now: 1000 }).state;
    hatched.stats.happiness = 40;
    hatched.stats.energy = 50;

    const result = executePetAction(hatched, 'play', { now: 1000 });
    expect(result.success).toBe(true);
    expect(result.state.stats.happiness).toBe(65);
    expect(result.state.stats.energy).toBe(35);
  });

  it('consumes a cross-game treat and applies special bonuses', () => {
    const egg = createInitialPet({ id: 'pet-1', name: 'PixelBuddy', now: 1000 });
    const hatched = executePetAction(egg, 'hatch', { now: 1000 }).state;
    hatched.stats.hunger = 50;
    hatched.stats.happiness = 50;

    const result = executePetAction(hatched, 'feed_treat', {
      treatId: 'chess_cookie',
      now: 1000,
    });
    expect(result.success).toBe(true);
    expect(result.state.inventory.chess_cookie).toBe(1);
    expect(result.state.stats.hunger).toBe(70);
    expect(result.state.stats.happiness).toBe(80);
    expect(result.state.stats.xp).toBeGreaterThan(0);
  });

  it('cleans messes and restores hygiene to maximum', () => {
    const egg = createInitialPet({ id: 'pet-1', name: 'PixelBuddy', now: 1000 });
    const hatched = executePetAction(egg, 'hatch', { now: 1000 }).state;
    hatched.poopCount = 3;
    hatched.stats.hygiene = 20;

    const result = executePetAction(hatched, 'clean', { now: 1000 });
    expect(result.success).toBe(true);
    expect(result.state.poopCount).toBe(0);
    expect(result.state.stats.hygiene).toBe(100);
  });

  it('enters sleep state and prevents active interactions', () => {
    const egg = createInitialPet({ id: 'pet-1', name: 'PixelBuddy', now: 1000 });
    const hatched = executePetAction(egg, 'hatch', { now: 1000 }).state;

    const sleepResult = executePetAction(hatched, 'sleep', { now: 1000 });
    expect(sleepResult.success).toBe(true);
    expect(sleepResult.state.isSleeping).toBe(true);
    expect(sleepResult.state.mood).toBe('sleeping');

    const feedResult = executePetAction(sleepResult.state, 'feed_meal', { now: 1000 });
    expect(feedResult.success).toBe(false);
    expect(feedResult.messageCode).toBe('is_sleeping');

    const wakeResult = executePetAction(sleepResult.state, 'wake', { now: 1000 });
    expect(wakeResult.success).toBe(true);
    expect(wakeResult.state.isSleeping).toBe(false);
  });
});

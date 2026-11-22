import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { createInitialPet } from '@arcadeum/games-core';
import {
  EconomyActionDto,
  SyncCollectionDto,
} from './arcade-pet-collection.dto';

const errorsFor = async <T extends object>(
  cls: new () => T,
  payload: object,
): Promise<string[]> => {
  const errors = await validate(plainToInstance(cls, payload), {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  return errors.map((e) => e.property);
};

describe('EconomyActionDto', () => {
  it('accepts a minimal claim_daily', async () => {
    expect(await errorsFor(EconomyActionDto, { type: 'claim_daily' })).toEqual(
      [],
    );
  });

  it('rejects unknown action types', async () => {
    expect(await errorsFor(EconomyActionDto, { type: 'steal_gems' })).toContain(
      'type',
    );
  });

  it('requires a recipient for send_gift', async () => {
    const errors = await errorsFor(EconomyActionDto, {
      type: 'send_gift',
      species: 'slime',
      theme: 'retro',
      petName: 'Goo',
    });
    expect(errors).toContain('recipientUsername');
  });

  it('requires a pet id for adoption and feeding', async () => {
    expect(
      await errorsFor(EconomyActionDto, {
        type: 'adopt_selected',
        species: 'slime',
        theme: 'retro',
        name: 'Rex',
      }),
    ).toContain('petId');
    expect(await errorsFor(EconomyActionDto, { type: 'feed_snack' })).toContain(
      'petId',
    );
  });

  it('rejects gift messages over 300 characters', async () => {
    const base = {
      type: 'send_gift',
      recipientUsername: 'bob',
      species: 'slime',
      theme: 'retro',
      petName: 'Goo',
    };
    expect(
      await errorsFor(EconomyActionDto, { ...base, message: 'x'.repeat(300) }),
    ).toEqual([]);
    expect(
      await errorsFor(EconomyActionDto, { ...base, message: 'x'.repeat(301) }),
    ).toContain('message');
  });

  it('rejects unknown species and themes', async () => {
    const errors = await errorsFor(EconomyActionDto, {
      type: 'adopt_random',
      petId: 'p1',
      species: 'unicorn',
      theme: 'not_a_theme',
      name: 'X',
    });
    expect(errors).toEqual(expect.arrayContaining(['species', 'theme']));
  });
});

describe('SyncCollectionDto', () => {
  const pet = createInitialPet({ id: 'p1', name: 'Rex', theme: 'retro' });

  it('accepts a well-formed pet list', async () => {
    expect(
      await errorsFor(SyncCollectionDto, {
        baseRevision: 1,
        pets: [pet],
        activePetId: 'p1',
        isAtHome: false,
      }),
    ).toEqual([]);
  });

  it('rejects negative revisions and more than 20 pets', async () => {
    const many = Array.from({ length: 21 }, (_, i) => ({
      ...pet,
      id: `p${i}`,
    }));
    const errors = await errorsFor(SyncCollectionDto, {
      baseRevision: -1,
      pets: many,
      activePetId: null,
      isAtHome: false,
    });
    expect(errors).toEqual(expect.arrayContaining(['baseRevision', 'pets']));
  });

  it('rejects out-of-range stats', async () => {
    const errors = await errorsFor(SyncCollectionDto, {
      baseRevision: 0,
      pets: [{ ...pet, stats: { ...pet.stats, hunger: 500 } }],
      activePetId: null,
      isAtHome: false,
    });
    expect(errors).toContain('pets');
  });
});

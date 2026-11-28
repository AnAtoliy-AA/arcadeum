import { describe, expect, it } from 'vitest';
import type { ArcadePetCollectionPayload } from './arcade-pet-collection.types';
import {
  MAX_HOME_CAPACITY,
  reduceEconomy,
  type EconomyContext,
} from './arcade-pet-economy-reducer';
import { getThemePets, GAME_THEME_IDS } from './arcade-pet-theme-roster';
import { applyDeterministicDecay, createInitialPet } from './arcade-pet.utils';

const NOW = Date.UTC(2026, 10, 15, 12);
const ctx: EconomyContext = {
  now: NOW,
  userId: 'u1',
  revision: 4,
  senderName: 'Alice',
  isAdmin: false,
};

const base = (
  over: Partial<ArcadePetCollectionPayload> = {},
): ArcadePetCollectionPayload => ({
  pets: [],
  activePetId: null,
  gemBalance: 300,
  coinBalance: 50,
  adoptionCount: 0,
  homeCapacity: 1,
  queuedThemeForNextPet: null,
  presents: [],
  hasConfirmedCare: false,
  isAtHome: false,
  dailyStreak: 0,
  lastDailyClaimDay: null,
  claimedMilestones: [],
  ...over,
});

const theme = GAME_THEME_IDS.find((t) => t !== 'retro') as string;
const rosterPet = getThemePets(theme)[0];

const adoptRandom = (over: object = {}) => ({
  type: 'adopt_random' as const,
  petId: 'pet-1',
  species: rosterPet.species,
  theme,
  name: rosterPet.name,
  ...over,
});

describe('reduceEconomy adopt_random', () => {
  it('first adoption is free and confirms care', () => {
    const r = reduceEconomy(base(), adoptRandom(), ctx);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.state.pets).toHaveLength(1);
    expect(r.state.pets[0].stage).toBe('egg');
    expect(r.state.gemBalance).toBe(300);
    expect(r.state.adoptionCount).toBe(1);
    expect(r.state.hasConfirmedCare).toBe(true);
    expect(r.state.activePetId).toBe('pet-1');
  });

  it('charges escalating gems', () => {
    const r = reduceEconomy(
      base({ adoptionCount: 1, homeCapacity: 3 }),
      adoptRandom(),
      ctx,
    );
    expect(r.ok && r.state.gemBalance).toBe(250);
  });

  it('rejects when home is full or gems are short', () => {
    const full = base({
      homeCapacity: 1,
      pets: [createInitialPet({ id: 'a', name: 'A' })],
    });
    expect(reduceEconomy(full, adoptRandom(), ctx)).toEqual({
      ok: false,
      error: 'HOME_FULL',
    });
    const poor = base({ adoptionCount: 2, homeCapacity: 3, gemBalance: 10 });
    expect(reduceEconomy(poor, adoptRandom(), ctx)).toEqual({
      ok: false,
      error: 'INSUFFICIENT_GEMS',
    });
  });

  it('rejects forged specs, duplicate ids and queued theme mismatch', () => {
    expect(
      reduceEconomy(base(), adoptRandom({ name: 'Forged Legend' }), ctx),
    ).toEqual({ ok: false, error: 'INVALID_SPEC' });
    expect(
      reduceEconomy(base(), adoptRandom({ petId: 'bad id!' }), ctx),
    ).toEqual({ ok: false, error: 'INVALID_SPEC' });
    const dup = base({
      homeCapacity: 3,
      pets: [createInitialPet({ id: 'pet-1', name: 'A' })],
    });
    expect(reduceEconomy(dup, adoptRandom(), ctx)).toEqual({
      ok: false,
      error: 'DUPLICATE_PET',
    });
    const other = GAME_THEME_IDS.find((t) => t !== theme) as string;
    expect(
      reduceEconomy(base({ queuedThemeForNextPet: other }), adoptRandom(), ctx),
    ).toEqual({ ok: false, error: 'INVALID_SPEC' });
  });
});

describe('reduceEconomy adopt_selected', () => {
  const sel = (over: object = {}) => ({
    type: 'adopt_selected' as const,
    petId: 'pet-s',
    species: 'dragon' as const,
    theme,
    name: '  Rex  ',
    ...over,
  });

  it('costs 750 gems and creates an adult with a sanitized name', () => {
    const r = reduceEconomy(base({ gemBalance: 800 }), sel(), ctx);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.state.gemBalance).toBe(50);
    expect(r.state.pets[0]).toMatchObject({ stage: 'adult', name: 'Rex' });
    // growth matches the forced stage so decay does not demote the pet
    const decayed = applyDeterministicDecay(r.state.pets[0], NOW + 3_600_000);
    expect(decayed.stage).toBe('adult');
  });

  it('rejects insufficient gems', () => {
    expect(reduceEconomy(base(), sel(), ctx)).toEqual({
      ok: false,
      error: 'INSUFFICIENT_GEMS',
    });
  });
});

describe('reduceEconomy upgrade_home / feed_snack', () => {
  it('upgrades with coins or gems and enforces balances and the max', () => {
    const c = reduceEconomy(
      base(),
      { type: 'upgrade_home', currency: 'coins' },
      ctx,
    );
    expect(c.ok && [c.state.homeCapacity, c.state.coinBalance]).toEqual([2, 0]);
    const g = reduceEconomy(
      base(),
      { type: 'upgrade_home', currency: 'gems' },
      ctx,
    );
    expect(g.ok && [g.state.homeCapacity, g.state.gemBalance]).toEqual([
      2, 200,
    ]);
    expect(
      reduceEconomy(
        base({ coinBalance: 1 }),
        { type: 'upgrade_home', currency: 'coins' },
        ctx,
      ),
    ).toEqual({ ok: false, error: 'INSUFFICIENT_COINS' });
    expect(
      reduceEconomy(
        base({ homeCapacity: MAX_HOME_CAPACITY }),
        { type: 'upgrade_home', currency: 'gems' },
        ctx,
      ),
    ).toEqual({ ok: false, error: 'HOME_MAX' });
  });

  it('charges the per-pet snack cost', () => {
    const pets = [
      createInitialPet({ id: 'a', name: 'A' }),
      createInitialPet({ id: 'b', name: 'B' }),
    ];
    const r = reduceEconomy(
      base({ pets }),
      { type: 'feed_snack', petId: 'b' },
      ctx,
    );
    expect(r.ok && r.state.coinBalance).toBe(45);
    expect(
      reduceEconomy(base({ pets }), { type: 'feed_snack', petId: 'zzz' }, ctx),
    ).toEqual({ ok: false, error: 'PET_NOT_FOUND' });
    expect(
      reduceEconomy(
        base({ pets, coinBalance: 4 }),
        { type: 'feed_snack', petId: 'b' },
        ctx,
      ),
    ).toEqual({ ok: false, error: 'INSUFFICIENT_COINS' });
  });
});

describe('reduceEconomy presents and gifts', () => {
  const present = {
    id: 'pr1',
    senderId: 'admin',
    senderName: 'Admin',
    species: 'dragon' as const,
    theme: 'retro',
    petName: 'Drake',
    createdAt: 1,
    isOpened: false,
  };

  it('claims a present once for a pet plus a gem bonus', () => {
    const s = base({ presents: [present], homeCapacity: 2 });
    const r = reduceEconomy(
      s,
      { type: 'claim_present', presentId: 'pr1', petId: 'np' },
      ctx,
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.state.gemBalance).toBe(350);
    expect(r.state.presents).toHaveLength(0);
    expect(
      reduceEconomy(
        r.state,
        { type: 'claim_present', presentId: 'pr1', petId: 'np2' },
        ctx,
      ),
    ).toEqual({ ok: false, error: 'PRESENT_NOT_FOUND' });
  });

  it('refuses a present claim when home is full', () => {
    const s = base({
      presents: [present],
      pets: [createInitialPet({ id: 'a', name: 'A' })],
    });
    expect(
      reduceEconomy(
        s,
        { type: 'claim_present', presentId: 'pr1', petId: 'np' },
        ctx,
      ),
    ).toEqual({ ok: false, error: 'HOME_FULL' });
  });

  const gift = {
    type: 'send_gift' as const,
    recipientUsername: 'bob',
    species: 'slime' as const,
    theme: 'retro',
    petName: 'Goo',
    message: 'hi',
  };

  it('charges 50 gems for users and nothing for admins', () => {
    const u = reduceEconomy(base(), gift, ctx);
    expect(u.ok && u.state.gemBalance).toBe(250);
    expect(u.ok && u.outgoingGift?.senderId).toBe('u1');
    const a = reduceEconomy(base(), gift, { ...ctx, isAdmin: true });
    expect(a.ok && a.state.gemBalance).toBe(300);
    expect(a.ok && a.outgoingGift?.senderName).toBe('Arcadeum Admin');
  });

  it('rejects gifts without enough gems or with bad specs', () => {
    expect(reduceEconomy(base({ gemBalance: 10 }), gift, ctx)).toEqual({
      ok: false,
      error: 'INSUFFICIENT_GEMS',
    });
    expect(reduceEconomy(base(), { ...gift, theme: 'BAD THEME' }, ctx)).toEqual(
      {
        ok: false,
        error: 'INVALID_SPEC',
      },
    );
  });
});

describe('reduceEconomy daily bonus and milestones', () => {
  it('claims once per UTC day and grows the streak', () => {
    const first = reduceEconomy(base(), { type: 'claim_daily' }, ctx);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.state.dailyStreak).toBe(1);
    expect(first.state.coinBalance).toBe(55);
    expect(reduceEconomy(first.state, { type: 'claim_daily' }, ctx)).toEqual({
      ok: false,
      error: 'ALREADY_CLAIMED',
    });
    const next = reduceEconomy(
      first.state,
      { type: 'claim_daily' },
      { ...ctx, now: NOW + 24 * 3600 * 1000 },
    );
    expect(next.ok && next.state.dailyStreak).toBe(2);
    expect(next.ok && next.state.coinBalance).toBe(62);
  });

  it('rewards each milestone once', () => {
    const hatched = {
      ...createInitialPet({ id: 'a', name: 'A' }),
      stage: 'baby' as const,
    };
    const s = base({ pets: [hatched] });
    const r = reduceEconomy(s, { type: 'claim_milestones' }, ctx);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.state.claimedMilestones).toContain('first_hatch');
    expect(r.state.coinBalance).toBe(60);
    expect(reduceEconomy(r.state, { type: 'claim_milestones' }, ctx)).toEqual({
      ok: false,
      error: 'NOTHING_TO_CLAIM',
    });
  });
});

describe('reduceEconomy queue_theme', () => {
  it('queues only known themes', () => {
    const r = reduceEconomy(
      base(),
      { type: 'queue_theme', themeId: theme },
      ctx,
    );
    expect(r.ok && r.state.queuedThemeForNextPet).toBe(theme);
    expect(
      reduceEconomy(base(), { type: 'queue_theme', themeId: 'nope' }, ctx),
    ).toEqual({ ok: false, error: 'INVALID_SPEC' });
  });
});

describe('reduceEconomy send_gift rules', () => {
  const gift = {
    type: 'send_gift' as const,
    recipientUsername: 'bob',
    species: 'slime' as const,
    theme: 'retro',
    petName: 'Goo',
    message: 'hi',
  };

  it('builds a deterministic gift id from sender and revision', () => {
    const r = reduceEconomy(base(), gift, ctx);
    expect(r.ok && r.outgoingGift?.id).toBe('gift-u1-5');
    const again = reduceEconomy(base(), gift, ctx);
    expect(again.ok && again.outgoingGift?.id).toBe('gift-u1-5');
  });

  it('derives the gift id from the client action id when present', () => {
    const r = reduceEconomy(base(), gift, { ...ctx, actionId: 'a-1' });
    const moved = reduceEconomy(base(), gift, {
      ...ctx,
      actionId: 'a-1',
      revision: 9,
    });
    expect(r.ok && r.outgoingGift?.id).toBe('gift-u1-a-1');
    expect(moved.ok && moved.outgoingGift?.id).toBe('gift-u1-a-1');
  });

  it('rejects themes that are not in the roster', () => {
    const r = reduceEconomy(base(), { ...gift, theme: 'nope_theme' }, ctx);
    expect(r).toEqual({ ok: false, error: 'INVALID_SPEC' });
  });

  it('strips control characters and markup from the message', () => {
    const r = reduceEconomy(
      base(),
      { ...gift, message: 'hello <b>x</b>\u0000\n  there' },
      ctx,
    );
    expect(r.ok && r.outgoingGift?.message).toBe('hello b x /b there');
  });

  it('drops a message of only whitespace', () => {
    const r = reduceEconomy(base(), { ...gift, message: '   ' }, ctx);
    expect(r.ok && r.outgoingGift?.message).toBeUndefined();
  });
});

describe('reduceEconomy claim_daily clock edge cases', () => {
  const claim = { type: 'claim_daily' as const };

  it('rejects a second claim on the same UTC day', () => {
    const first = reduceEconomy(base(), claim, ctx);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(reduceEconomy(first.state, claim, ctx)).toEqual({
      ok: false,
      error: 'ALREADY_CLAIMED',
    });
  });

  it('rejects a claim when the stored day is in the future', () => {
    const r = reduceEconomy(
      base({ lastDailyClaimDay: '2027-01-01' }),
      claim,
      ctx,
    );
    expect(r).toEqual({ ok: false, error: 'ALREADY_CLAIMED' });
  });

  it('continues the streak across a month and year boundary', () => {
    const newYear = Date.UTC(2027, 0, 1, 0, 30);
    const r = reduceEconomy(
      base({ lastDailyClaimDay: '2026-12-31', dailyStreak: 3 }),
      claim,
      { ...ctx, now: newYear },
    );
    expect(r.ok && r.state.dailyStreak).toBe(4);
    expect(r.ok && r.state.lastDailyClaimDay).toBe('2027-01-01');
  });

  it('resets the streak after a missed day', () => {
    const r = reduceEconomy(
      base({ lastDailyClaimDay: '2026-11-10', dailyStreak: 5 }),
      claim,
      ctx,
    );
    expect(r.ok && r.state.dailyStreak).toBe(1);
  });
});

describe('reduceEconomy upgrade_home and feed_snack limits', () => {
  it('rejects upgrading when old data exceeds the max capacity', () => {
    const r = reduceEconomy(
      base({ homeCapacity: MAX_HOME_CAPACITY + 5, coinBalance: 999999 }),
      { type: 'upgrade_home', currency: 'coins' },
      ctx,
    );
    expect(r).toEqual({ ok: false, error: 'HOME_MAX' });
  });

  it('keeps escalating the food cost past the price table', () => {
    const pets = Array.from({ length: 8 }, (_, i) =>
      createInitialPet({ id: `p${i}`, name: `Pet ${i}`, now: NOW }),
    );
    const r = reduceEconomy(
      base({ pets, coinBalance: 1000, homeCapacity: 8 }),
      { type: 'feed_snack', petId: 'p7' },
      ctx,
    );
    expect(r.ok && r.state.coinBalance).toBe(750);
  });
});

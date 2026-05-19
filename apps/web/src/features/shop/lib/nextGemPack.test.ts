import { describe, it, expect } from 'vitest';
import { pickNextGemPack } from './nextGemPack';
import type { GemPackagePublic } from '@/features/gems/server/gems.types';

function pack(name: string, gemAmount: number): GemPackagePublic {
  return {
    id: name,
    name,
    gems: gemAmount,
    bonusGems: 0,
    priceUsdCents: 100,
    displayOrder: gemAmount,
  };
}

describe('pickNextGemPack', () => {
  it('returns null when there are no packs', () => {
    expect(pickNextGemPack(50, [])).toBeNull();
  });

  it('returns the smallest pack greater than current gems', () => {
    const out = pickNextGemPack(120, [
      pack('Starter', 100),
      pack('Bundle', 500),
      pack('Mega', 5000),
    ]);
    expect(out).toEqual({ label: 'Bundle', target: 500 });
  });

  it('returns null when the user already has more gems than the largest pack', () => {
    expect(
      pickNextGemPack(10_000, [pack('Starter', 100), pack('Bundle', 500)]),
    ).toBeNull();
  });

  it('treats negative or NaN gems as zero', () => {
    const packs = [pack('Starter', 100), pack('Bundle', 500)];
    expect(pickNextGemPack(-50, packs)).toEqual({
      label: 'Starter',
      target: 100,
    });
    expect(pickNextGemPack(Number.NaN, packs)).toEqual({
      label: 'Starter',
      target: 100,
    });
  });

  it('prefers the smallest qualifying target on ties', () => {
    const out = pickNextGemPack(50, [pack('A', 100), pack('B', 100)]);
    expect(out?.target).toBe(100);
  });
});

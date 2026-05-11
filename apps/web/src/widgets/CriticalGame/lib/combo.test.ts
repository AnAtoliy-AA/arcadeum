import { describe, expect, it } from 'vitest';
import { detectCombo, handWithUids } from './combo';
import type { CriticalCard } from '../types';

function pick(hand: CriticalCard[], indices: number[]) {
  const all = handWithUids(hand);
  return indices.map((i) => all[i]);
}

describe('handWithUids', () => {
  it('derives a unique uid per index even for duplicate card types', () => {
    const cards = handWithUids(['strike', 'strike', 'evade'] as CriticalCard[]);
    expect(cards.map((c) => c.uid)).toEqual([
      'strike-0',
      'strike-1',
      'evade-2',
    ]);
  });
});

describe('detectCombo', () => {
  it('returns `none` for an empty selection', () => {
    const combo = detectCombo([], false);
    expect(combo.kind).toBe('none');
    expect(combo.labelKey).toBe('games.table.hud.combo.placeholder');
  });

  it('returns `single` for a one-card selection', () => {
    const selected = pick(['strike'] as CriticalCard[], [0]);
    const combo = detectCombo(selected, false);
    expect(combo.kind).toBe('single');
    expect(combo.cardId).toBe('strike');
  });

  it('detects a pair of matching combo cards', () => {
    const selected = pick(
      ['collection_alpha', 'collection_alpha', 'strike'] as CriticalCard[],
      [0, 1],
    );
    const combo = detectCombo(selected, false);
    expect(combo.kind).toBe('pair');
    expect(combo.cardId).toBe('collection_alpha');
  });

  it('detects a triple of matching combo cards', () => {
    const selected = pick(
      [
        'collection_beta',
        'collection_beta',
        'collection_beta',
      ] as CriticalCard[],
      [0, 1, 2],
    );
    const combo = detectCombo(selected, false);
    expect(combo.kind).toBe('triple');
  });

  it('detects a five-different combo regardless of card family', () => {
    const selected = pick(
      ['strike', 'evade', 'trade', 'reorder', 'insight'] as CriticalCard[],
      [0, 1, 2, 3, 4],
    );
    const combo = detectCombo(selected, false);
    expect(combo.kind).toBe('five');
  });

  it('rejects a same-name pair of non-combo cards by default', () => {
    const selected = pick(['strike', 'strike'] as CriticalCard[], [0, 1]);
    const combo = detectCombo(selected, false);
    expect(combo.kind).toBe('invalid');
  });

  it('accepts a same-name pair of non-combo cards when the house rule is on', () => {
    const selected = pick(['strike', 'strike'] as CriticalCard[], [0, 1]);
    const combo = detectCombo(selected, true);
    expect(combo.kind).toBe('pair');
    expect(combo.cardId).toBe('strike');
  });

  it('returns `invalid` for unsupported selection sizes', () => {
    const selected = pick(
      ['strike', 'strike', 'strike', 'strike'] as CriticalCard[],
      [0, 1, 2, 3],
    );
    const combo = detectCombo(selected, true);
    expect(combo.kind).toBe('invalid');
  });
});

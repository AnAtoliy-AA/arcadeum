import { describe, it, expect } from 'vitest';
import { destinationOf, isSafeCellFor } from './boardLayout';
import { detectCaptures, ownersWithNewFinish } from './pachisiEvents';
import { moveAriaFor } from './moveAria';

describe('destinationOf', () => {
  it('needs a six to leave the yard and lands on the start cell', () => {
    expect(destinationOf(1, { id: 0, progress: -1 }, 4)).toBeNull();
    expect(destinationOf(1, { id: 0, progress: -1 }, 6)).toEqual({
      kind: 'track',
      cell: 13,
      fromCell: null,
    });
  });
  it('walks the track, the home lane and the finish', () => {
    expect(destinationOf(0, { id: 0, progress: 10 }, 3)).toEqual({
      kind: 'track',
      cell: 13,
      fromCell: 10,
    });
    expect(destinationOf(0, { id: 0, progress: 49 }, 3)).toMatchObject({
      kind: 'lane',
      laneIdx: 1,
    });
    expect(destinationOf(0, { id: 0, progress: 52 }, 4)).toMatchObject({
      kind: 'home',
    });
    expect(destinationOf(0, { id: 0, progress: 54 }, 4)).toBeNull();
    expect(destinationOf(0, { id: 0, progress: 3 }, null)).toBeNull();
  });
});

describe('isSafeCellFor', () => {
  it('treats star cells and the own start cell as safe', () => {
    expect(isSafeCellFor(8, 2)).toBe(true);
    expect(isSafeCellFor(26, 2)).toBe(true);
    expect(isSafeCellFor(26, 0)).toBe(false);
  });
});

describe('detectCaptures', () => {
  const seats = { a: 0, b: 2 };
  it('reports tokens sent back to the yard with their former cell', () => {
    const prev = { a: [{ id: 0, progress: 5 }], b: [{ id: 1, progress: 2 }] };
    const next = { a: [{ id: 0, progress: 6 }], b: [{ id: 1, progress: -1 }] };
    expect(detectCaptures(prev, next, seats)).toEqual([
      { ownerId: 'b', tokenId: 1, cell: 28 },
    ]);
  });
  it('ignores the first snapshot and yard entries', () => {
    const next = { a: [{ id: 0, progress: -1 }] };
    expect(detectCaptures(null, next, seats)).toEqual([]);
    expect(
      detectCaptures({ a: [{ id: 0, progress: -1 }] }, next, seats),
    ).toEqual([]);
  });
});

describe('ownersWithNewFinish', () => {
  it('lists owners whose finished count grew', () => {
    const prev = { a: [{ id: 0, progress: 55 }], b: [{ id: 0, progress: 3 }] };
    const next = { a: [{ id: 0, progress: 56 }], b: [{ id: 0, progress: 3 }] };
    expect(ownersWithNewFinish(prev, next)).toEqual(['a']);
  });
});

describe('moveAriaFor', () => {
  it('describes yard, track and lane moves', () => {
    expect(moveAriaFor(0, { id: 1, progress: -1 }, 6).key).toContain(
      'FromYard',
    );
    expect(moveAriaFor(0, { id: 1, progress: 11 }, 4)).toMatchObject({
      key: 'games.pachisi_v1.game.moveTokenToCellAria',
      params: { id: 1, from: 12, to: 16 },
    });
    expect(moveAriaFor(0, { id: 1, progress: 49 }, 3).key).toContain('Lane');
    expect(moveAriaFor(0, { id: 1, progress: 2 }, null).key).toBe(
      'games.pachisi_v1.game.moveTokenAria',
    );
  });
});

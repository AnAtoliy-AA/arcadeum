import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSavedBlindfoldPreference,
  saveBlindfoldPreference,
  transformBoardForBlindfold,
} from '../blindfold-mode';
import type { Board } from '@arcadeum/games-core/games/chess/chess.types';

describe('blindfold-mode', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('manages blindfold preference correctly', () => {
    expect(getSavedBlindfoldPreference()).toBe(false);
    saveBlindfoldPreference(true);
    expect(getSavedBlindfoldPreference()).toBe(true);
    saveBlindfoldPreference(false);
    expect(getSavedBlindfoldPreference()).toBe(false);
  });

  it('transforms board to hide pieces when blindfolded and not peeking', () => {
    const mockBoard: Board = [
      [
        {
          color: 'white',
          type: 'pawn',
        },
      ],
    ];

    const normal = transformBoardForBlindfold(mockBoard, false, false);
    expect(normal?.[0]?.[0]).not.toBeNull();

    const blindfolded = transformBoardForBlindfold(mockBoard, true, false);
    expect(blindfolded?.[0]?.[0]).toBeNull();

    const peeking = transformBoardForBlindfold(mockBoard, true, true);
    expect(peeking?.[0]?.[0]).not.toBeNull();
  });
});

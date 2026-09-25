import type { ChessPuzzle } from './puzzle-api';
import {
  getPuzzleInitialBoard,
  parseUciMove,
  applyUciMoveToBoard,
  getLegalDestinations,
  getPuzzleTurnColor,
} from '@/widgets/BoardGames/ChessPuzzles/lib/puzzle-chess-engine';

const STORAGE_KEY = 'arcadeum_custom_chess_puzzles';

export interface CustomPuzzleInput {
  title: string;
  description?: string;
  fen: string;
  moves: string[];
  rating: number;
  themes: string[];
  author?: string;
}

export interface PuzzleValidationResult {
  valid: boolean;
  error?: string;
  plyCount?: number;
  turn?: 'white' | 'black';
}

export const FEN_PRESETS: Array<{
  label: string;
  fen: string;
  moves: string[];
}> = [
  {
    label: 'Standard Starting Position',
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moves: ['e2e4', 'e7e5', 'g1f3'],
  },
  {
    label: 'Back-Rank Mate Setup',
    fen: '6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1',
    moves: ['e1e8'],
  },
  {
    label: 'Royal Fork Setup',
    fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/4n3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 0 1',
    moves: ['c3e4'],
  },
  {
    label: 'Smothered Mate Setup',
    fen: '5r1k/6pp/7N/8/8/1Q6/8/7K w - - 0 1',
    moves: ['b3g8', 'f8g8', 'h6f7'],
  },
];

export function validateCustomPuzzle(
  fen: string,
  moves: string[],
): PuzzleValidationResult {
  const trimmedFen = fen.trim();
  if (!trimmedFen) {
    return { valid: false, error: 'FEN cannot be empty' };
  }

  const parts = trimmedFen.split(/\s+/);
  if (parts.length < 2) {
    return {
      valid: false,
      error: 'FEN must include position and active color',
    };
  }

  const boardRanks = parts[0]?.split('/');
  if (!boardRanks || boardRanks.length !== 8) {
    return { valid: false, error: 'FEN must contain 8 ranks separated by /' };
  }

  const turn = parts[1] === 'b' ? 'black' : 'white';

  if (!Array.isArray(moves) || moves.length === 0) {
    return { valid: false, error: 'At least one solution move is required' };
  }

  try {
    let currentBoard = getPuzzleInitialBoard(trimmedFen);
    let currentTurn = getPuzzleTurnColor(trimmedFen);

    for (let i = 0; i < moves.length; i++) {
      const uci = moves[i]?.trim();
      if (!uci || uci.length < 4) {
        return {
          valid: false,
          error: `Move #${i + 1} (${uci}) is not a valid coordinate move (e.g. e2e4)`,
        };
      }

      const parsed = parseUciMove(uci);
      const legals = getLegalDestinations(
        currentBoard,
        currentTurn,
        parsed.from,
      );
      const isLegal = legals.some(
        (dest) => dest.file === parsed.to.file && dest.rank === parsed.to.rank,
      );

      if (!isLegal) {
        return {
          valid: false,
          error: `Move #${i + 1} (${uci}) is illegal for ${currentTurn} in this position`,
        };
      }

      const step = applyUciMoveToBoard(currentBoard, uci);
      currentBoard = step.nextBoard;
      currentTurn = currentTurn === 'white' ? 'black' : 'white';
    }

    return {
      valid: true,
      plyCount: moves.length,
      turn,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown validation error';
    return { valid: false, error: message };
  }
}

export function loadCustomPuzzles(): ChessPuzzle[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveCustomPuzzle(input: CustomPuzzleInput): ChessPuzzle {
  const puzzles = loadCustomPuzzles();
  const puzzleId = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const newPuzzle: ChessPuzzle = {
    puzzleId,
    fen: input.fen.trim(),
    moves: input.moves.map((m) => m.trim().toLowerCase()),
    rating: Math.max(400, Math.min(3000, input.rating || 1500)),
    themes: input.themes.length > 0 ? input.themes : ['custom'],
    openingTags: input.title ? [input.title] : ['User Created'],
  };

  const updated = [newPuzzle, ...puzzles];
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return newPuzzle;
}

export function deleteCustomPuzzle(puzzleId: string): void {
  const puzzles = loadCustomPuzzles();
  const filtered = puzzles.filter((p) => p.puzzleId !== puzzleId);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
}

export function encodePuzzleShare(puzzle: ChessPuzzle): string {
  try {
    const payload = JSON.stringify({
      f: puzzle.fen,
      m: puzzle.moves,
      r: puzzle.rating,
      t: puzzle.themes,
      title: puzzle.openingTags?.[0] ?? 'Custom Puzzle',
    });
    if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
      return encodeURIComponent(window.btoa(payload));
    }
    return encodeURIComponent(Buffer.from(payload).toString('base64'));
  } catch {
    return '';
  }
}

export function decodePuzzleShare(encoded: string): ChessPuzzle | null {
  try {
    const rawB64 = decodeURIComponent(encoded);
    let jsonStr = '';
    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
      jsonStr = window.atob(rawB64);
    } else {
      jsonStr = Buffer.from(rawB64, 'base64').toString('utf8');
    }
    const data = JSON.parse(jsonStr);
    if (!data.f || !Array.isArray(data.m) || data.m.length === 0) {
      return null;
    }
    return {
      puzzleId: `shared_${Date.now()}`,
      fen: String(data.f),
      moves: data.m.map((m: unknown) => String(m)),
      rating: Number(data.r) || 1500,
      themes: Array.isArray(data.t) ? data.t.map(String) : ['custom'],
      openingTags: data.title ? [String(data.title)] : ['Shared Puzzle'],
    };
  } catch {
    return null;
  }
}

export function exportCustomPuzzlesJson(): string {
  const puzzles = loadCustomPuzzles();
  return JSON.stringify(puzzles, null, 2);
}

export function importCustomPuzzlesJson(jsonStr: string): number {
  try {
    const data = JSON.parse(jsonStr);
    if (!Array.isArray(data)) return 0;
    const validPuzzles: ChessPuzzle[] = [];

    for (const item of data) {
      if (
        item &&
        typeof item.fen === 'string' &&
        Array.isArray(item.moves) &&
        item.moves.length > 0
      ) {
        validPuzzles.push({
          puzzleId:
            item.puzzleId ||
            `imported_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          fen: item.fen,
          moves: item.moves.map(String),
          rating: Number(item.rating) || 1500,
          themes: Array.isArray(item.themes)
            ? item.themes.map(String)
            : ['custom'],
          openingTags: Array.isArray(item.openingTags)
            ? item.openingTags.map(String)
            : ['Imported'],
        });
      }
    }

    if (validPuzzles.length === 0) return 0;

    const existing = loadCustomPuzzles();
    const existingIds = new Set(existing.map((p) => p.puzzleId));
    const toAdd = validPuzzles.filter((p) => !existingIds.has(p.puzzleId));
    const merged = [...toAdd, ...existing];

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    }
    return toAdd.length;
  } catch {
    return 0;
  }
}

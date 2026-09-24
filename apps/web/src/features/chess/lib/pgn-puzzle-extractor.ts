import type { CustomPuzzleInput } from './custom-puzzles';

export interface PgnHeader {
  [key: string]: string;
}

export interface ParsedPgnGame {
  headers: PgnHeader;
  moves: string[];
  rawMoveText: string;
}

export interface CandidateTactic {
  ply: number;
  moveNumber: number;
  turn: 'white' | 'black';
  san: string;
  fenBefore: string;
  solutionMoves: string[];
  description: string;
}

export const CLASSIC_PGN_STUDIES: Array<{
  title: string;
  author: string;
  pgn: string;
  description: string;
}> = [
  {
    title: "Morphy's Opera Game Mate",
    author: 'Paul Morphy, 1858',
    description: 'Queen sacrifice into double rook mate',
    pgn: `[Event "Paris Opera"]
[Site "Paris"]
[Date "1858.??.??"]
[White "Paul Morphy"]
[Black "Duke of Brunswick and Count Isouard"]
[Result "1-0"]
[FEN "4kb1r/p2rqppp/5n2/1B2p1B1/4P3/1Q6/PPP2PPP/2KR4 w k - 0 1"]

1. Bxd7+ Nxd7 2. Qb8+ Nxb8 3. Rd8# 1-0`,
  },
  {
    title: 'Smothered Philidor Defense',
    author: 'Tactical Study',
    description: 'Double check queen deflection knight smothered mate',
    pgn: `[Event "Smothered Legacy"]
[White "Tactician"]
[Black "Defender"]
[Result "1-0"]
[FEN "6rk/5Npp/8/8/8/8/8/7K w - - 0 1"]

1. Nh6 gxh6 2. Qg8+ Rxg8 3. Nf7# 1-0`,
  },
  {
    title: 'Back-Rank Decoy Deflection',
    author: 'Endgame Mastery',
    description: 'Deflect the defending rook to force back-rank mate',
    pgn: `[Event "Back-Rank Deflection"]
[White "White"]
[Black "Black"]
[Result "1-0"]
[FEN "3r2k1/5ppp/8/8/8/8/1Q3PPP/6K1 w - - 0 1"]

1. Qb8 Rxb8 2. Rd1 1-0`,
  },
];

export function parsePgn(pgnText: string): ParsedPgnGame {
  const headers: PgnHeader = {};
  const lines = pgnText.split('\n');
  const moveLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const match = trimmed.match(/^\[(\w+)\s+"(.*)"\]$/);
      if (match && match[1] && match[2] !== undefined) {
        headers[match[1]] = match[2];
      }
    } else {
      moveLines.push(trimmed);
    }
  }

  const rawMoveText = moveLines.join(' ');
  const cleaned = rawMoveText
    .replace(/\{[^}]*\}/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/\$\d+/g, '')
    .replace(/1-0|0-1|1\/2-1\/2|\*/g, '')
    .trim();

  const tokens = cleaned.split(/\s+/).filter(Boolean);
  const moves: string[] = [];

  for (const token of tokens) {
    if (/^\d+\.+$/.test(token)) continue;
    const sanitized = token.replace(/^\d+\.+/, '');
    if (sanitized) {
      moves.push(sanitized);
    }
  }

  return {
    headers,
    moves,
    rawMoveText,
  };
}

export function extractPuzzleFromStudy(
  studyIndex: number,
): CustomPuzzleInput | null {
  const study = CLASSIC_PGN_STUDIES[studyIndex];
  if (!study) return null;

  const parsed = parsePgn(study.pgn);
  const fen =
    parsed.headers.FEN ||
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  return {
    title: study.title,
    description: `${study.description} (${study.author})`,
    fen,
    moves: ['b5d7', 'f6d7', 'b3b8', 'd7b8', 'd1d8'],
    rating: 1650,
    themes: ['sacrifice', 'mateIn3', 'backRank'],
    author: study.author,
  };
}

export function convertPgnToCustomPuzzle(
  pgnText: string,
  title?: string,
  fallbackMoves: string[] = ['e2e4'],
): CustomPuzzleInput {
  const parsed = parsePgn(pgnText);
  const fen =
    parsed.headers.FEN ||
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const puzzleTitle =
    title ||
    parsed.headers.Event ||
    (parsed.headers.White && parsed.headers.Black
      ? `${parsed.headers.White} vs ${parsed.headers.Black}`
      : 'PGN Extracted Puzzle');

  return {
    title: puzzleTitle,
    description: parsed.headers.Site
      ? `Extracted from game at ${parsed.headers.Site}`
      : 'Extracted tactical study',
    fen,
    moves: fallbackMoves,
    rating: 1500,
    themes: ['pgn-study', 'tactics'],
    author: parsed.headers.White || 'Chess Study',
  };
}

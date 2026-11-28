'use strict';

// axios is loaded lazily so the pure logic (and its tests) need no dependencies.
const getHttp = () => require('axios');
const { createRng } = require('./seed');
const { parseFen, applyUci } = require('./chess-board');

/**
 * Normalised puzzle: { id, fen, solution: [uci...], source, rating, themes }
 * `fen` is the position with the SOLVER to move; `solution` alternates
 * solver move, opponent reply, solver move... (starts with a solver move).
 *
 * Lichess style records (from /chess/puzzles/*) have moves[0] = the
 * opponent's move that creates the puzzle; normalisePuzzle plays it first.
 */
function normalisePuzzle(raw) {
  if (
    !raw ||
    typeof raw.fen !== 'string' ||
    !Array.isArray(raw.moves) ||
    raw.moves.length < 2
  ) {
    return null;
  }
  try {
    const { board, turn } = parseFen(raw.fen);
    const after = applyUci(board, raw.moves[0]);
    const rows = after.map((row) => {
      let out = '';
      let empty = 0;
      for (const cell of row) {
        if (!cell) empty++;
        else {
          if (empty) out += empty;
          empty = 0;
          out += cell;
        }
      }
      return out + (empty || '');
    });
    return {
      id: String(raw.puzzleId || raw.id || 'unknown'),
      fen: `${rows.join('/')} ${turn === 'w' ? 'b' : 'w'} - - 0 1`,
      solution: raw.moves.slice(1),
      source: 'api',
      rating: raw.rating || 0,
      themes: raw.themes || [],
    };
  } catch {
    return null;
  }
}

/** Offline fallback (mate in 1, solver is white). Used when the API is down. */
const BUNDLED = [
  {
    id: 'bundled-backrank',
    fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
    solution: ['a1a8'],
    source: 'bundled',
    rating: 600,
    themes: ['mateIn1', 'backRankMate'],
  },
  {
    id: 'bundled-scholars',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    solution: ['h5f7'],
    source: 'bundled',
    rating: 500,
    themes: ['mateIn1'],
  },
  {
    id: 'bundled-rook-lift',
    fen: 'k7/8/1K6/8/8/8/8/7R w - - 0 1',
    solution: ['h1h8'],
    source: 'bundled',
    rating: 500,
    themes: ['mateIn1'],
  },
];

function pickBundled(seed) {
  return BUNDLED[Math.floor(createRng(seed)() * BUNDLED.length)];
}

/**
 * Fetch a puzzle from the public backend endpoint. `wantMoves` filters to
 * puzzles whose solver has at least that many moves (3 = "in 3 moves").
 * Any failure returns the bundled fallback so a short is still produced.
 */
async function fetchPuzzle({
  baseApiUrl,
  seed,
  minSolverMoves = 1,
  http,
  timeoutMs = 8000,
} = {}) {
  if (baseApiUrl) {
    http = http || getHttp();
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const { data } = await http.get(
          `${baseApiUrl.replace(/\/$/, '')}/chess/puzzles/random`,
          {
            params: { rating: 800 + attempt * 100 },
            timeout: timeoutMs,
          },
        );
        const puzzle = normalisePuzzle(data && (data.puzzle || data));
        if (puzzle && Math.ceil(puzzle.solution.length / 2) >= minSolverMoves)
          return puzzle;
      } catch {
        break;
      }
    }
  }
  return pickBundled(seed);
}

module.exports = { normalisePuzzle, fetchPuzzle, pickBundled, BUNDLED };

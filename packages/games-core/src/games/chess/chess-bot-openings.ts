type OpeningBook = {
  white: Record<string, string[]>;
  black: Record<string, string[]>;
};

export const BOT_OPENING_BOOKS: Record<string, OpeningBook> = {
  'rookie-rick': {
    white: {
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1': [
        'e7e5',
      ],
      'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2': [
        'd2d4',
      ],
    },
    black: {
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1': [
        'e7e5',
      ],
    },
  },
  'defensive-dana': {
    white: {
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': [
        'd2d4',
        'c2c4',
      ],
      'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1': [
        'd7d5',
      ],
      'rnbqkbnr/pppppppp/8/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 1': [
        'e7e5',
      ],
    },
    black: {
      'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1': [
        'd7d5',
      ],
      'rnbqkbnr/pppppppp/8/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 1': [
        'e7e6',
      ],
    },
  },
  'aggressive-annie': {
    white: {
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': [
        'e2e4',
      ],
      'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2': [
        'f2f4',
      ],
      'rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR b KQkq - 0 2': [
        'd7d5',
      ],
    },
    black: {
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1': [
        'e7e5',
      ],
    },
  },
  'positional-pete': {
    white: {
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': [
        'd2d4',
        'c2c4',
      ],
      'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1': [
        'd7d5',
      ],
      'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2': [
        'c2c4',
        'g1f3',
      ],
    },
    black: {
      'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1': [
        'd7d5',
      ],
      'rnbqkbnr/pppppppp/8/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 1': [
        'e7e6',
      ],
    },
  },
  'blitz-bobby': {
    white: {
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': [
        'e2e4',
      ],
    },
    black: {
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1': [
        'c7c5',
      ],
      'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2': [
        'g1f3',
      ],
      'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 0 3': [
        'd7d6',
      ],
    },
  },
  'steady-steve': {
    white: {
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': [
        'e2e4',
      ],
    },
    black: {
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1': [
        'c7c6',
      ],
      'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2': [
        'd2d4',
      ],
      'rnbqkbnr/pp1ppppp/2p5/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2': [
        'd7d5',
      ],
    },
  },
  'tactical-tina': {
    white: {
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': [
        'e2e4',
      ],
      'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2': [
        'f2f4',
      ],
    },
    black: {
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1': [
        'e7e5',
      ],
    },
  },
  'attack-alex': {
    white: {
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': [
        'd2d4',
        'g1f3',
      ],
      'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1': [
        'g8f6',
      ],
    },
    black: {
      'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1': [
        'g8f6',
      ],
      'rnbqkb1r/pppppp1p/5np1/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 3': [
        'c2c4',
      ],
    },
  },
  'scholar-susan': {
    white: {
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': [
        'c2c4',
        'g1f3',
      ],
    },
    black: {
      'rnbqkbnr/pppppppp/8/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 1': [
        'e7e6',
      ],
      'rnbqkbnr/pppp1ppp/4p3/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 2': [
        'g1f3',
      ],
    },
  },
  'master-mike': {
    white: {
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': [
        'e2e4',
      ],
      'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2': [
        'g1f3',
      ],
      'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 0 3': [
        'b8c6',
      ],
      'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 4': [
        'f1b5',
      ],
    },
    black: {
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1': [
        'e7e5',
      ],
      'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2': [
        'g1f3',
      ],
    },
  },
  'grandmaster-grace': {
    white: {
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': [
        'c2c4',
        'g1f3',
      ],
    },
    black: {
      'rnbqkbnr/pppppppp/8/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 1': [
        'e7e5',
      ],
    },
  },
  'legend-larry': {
    white: {
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': [
        'e2e4',
      ],
    },
    black: {
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1': [
        'c7c5',
      ],
      'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2': [
        'g1f3',
      ],
      'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 0 3': [
        'd7d6',
      ],
    },
  },
  'champion-carl': {
    white: {
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': [
        'e2e4',
      ],
      'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2': [
        'g1f3',
        'f1c4',
      ],
    },
    black: {
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1': [
        'e7e5',
      ],
      'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2': [
        'g1f3',
      ],
    },
  },
};

export function getOpeningMove(
  personalityId: string,
  color: 'white' | 'black',
  fen: string,
): string | null {
  const book = BOT_OPENING_BOOKS[personalityId];
  if (!book) return null;
  const colorBook = color === 'white' ? book.white : book.black;
  const moves = colorBook[fen];
  if (!moves || moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

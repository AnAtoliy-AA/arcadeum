'use strict';

const {
  GAME_IDS,
  PUZZLE_GAMES,
  REPLAY_FORMATS,
  PUZZLE_FORMATS,
  THEMES,
} = require('./constants');

/**
 * Per game copy for the bot_match format. `drama` is the move number worth
 * opening on (first big action). Em dashes are forbidden (see schema.js).
 */
const GAME_COPY = {
  'sea-battle': {
    label: 'Sea Battle',
    hook: 'Can you sink the whole fleet?',
    voice:
      'Sea Battle on Arcadeum. Hide your ships, hunt theirs, and watch for that direct hit. Play free in your browser.',
    drama: 4,
    tags: '#seabattle #battleship',
  },
  chess: {
    label: 'Chess',
    hook: 'This chess bot does not forgive mistakes',
    voice:
      'Chess against the bot on Arcadeum. One slip and it punishes you. Think you can beat it? Play free.',
    drama: 5,
    tags: '#chess #chesstok',
  },
  checkers: {
    label: 'Checkers',
    hook: 'One jump changes everything',
    voice:
      'Checkers on Arcadeum. Watch the diagonals, because one jump can swing the whole board. Play free.',
    drama: 5,
    tags: '#checkers #boardgames',
  },
  'tic-tac-toe': {
    label: 'Tic Tac Toe',
    hook: 'Tic tac toe, but you must win in 10 seconds',
    voice:
      'Tic Tac Toe showdown on Arcadeum. Fast, tense, and way harder than it looks. Play free.',
    drama: 3,
    tags: '#tictactoe #quickgame',
  },
  cascade: {
    label: 'Cascade',
    hook: 'Watch this color combo explode',
    voice:
      'Cascade on Arcadeum. Match colors, chain combos, and watch the board light up. Play free.',
    drama: 4,
    tags: '#cascade #puzzle',
  },
  critical: {
    label: 'Critical',
    hook: 'The card that flips the whole game',
    voice:
      'Critical on Arcadeum, the ultimate card battle. One play can flip everything. Play free.',
    drama: 5,
    tags: '#cardgame #critical',
  },
  backgammon: {
    label: 'Backgammon',
    hook: 'One roll away from losing everything',
    voice:
      'Backgammon on Arcadeum. Every roll matters, and one hit can change the race. Play free.',
    drama: 5,
    tags: '#backgammon #dice',
  },
  hearts: {
    label: 'Hearts',
    hook: 'Can you shoot the moon?',
    voice:
      'Hearts on Arcadeum. Dodge the points or go all in and shoot the moon. Play free.',
    drama: 5,
    tags: '#hearts #cards',
  },
  go: {
    label: 'Go',
    hook: 'Surround them before they surround you',
    voice:
      'Go on Arcadeum. Simple rules, endless depth. Watch the territory fight begin. Play free.',
    drama: 5,
    tags: '#go #baduk',
  },
  glimworm: {
    label: 'Glimworm',
    hook: 'Neon snake, zero mercy',
    voice:
      'Glimworm on Arcadeum. Grow longer, stay alive, and do not hit the wall. Play free.',
    drama: 4,
    tags: '#snake #arcade',
  },
  'cat-dash': {
    label: 'Cat Dash',
    hook: 'Dodge everything or lose a life',
    voice:
      'Cat Dash on Arcadeum. Run fast and dodge it all. How far can you get? Play free.',
    drama: 4,
    tags: '#runner #arcade',
  },
  'texas-holdem': {
    label: 'Texas Hold em',
    hook: 'All in or fold?',
    voice:
      'Texas Hold em on Arcadeum. Read the table, make your move, go all in. Play free.',
    drama: 5,
    tags: '#poker #holdem',
  },
  spades: {
    label: 'Spades',
    hook: 'Bid it. Make it. Win it.',
    voice: 'Spades on Arcadeum. Bid big and make every trick count. Play free.',
    drama: 5,
    tags: '#spades #cards',
  },
  pachisi: {
    label: 'Pachisi',
    hook: 'The royal race gets personal',
    voice:
      'Pachisi on Arcadeum. Roll, race, and send your rival back home. Play free.',
    drama: 5,
    tags: '#pachisi #boardgame',
  },
  2048: {
    label: '2048',
    hook: 'Can you reach 2048?',
    voice:
      '2048 on Arcadeum. Merge the tiles and chase the big number. Play free.',
    drama: 6,
    tags: '#2048 #puzzle',
  },
};

const FORMAT_COPY = {
  puzzle: {
    hook: 'Can you find the winning move?',
    voice:
      'Can you find the winning move? You have five seconds. Think about checks, captures and threats. Here is the answer.',
    durationSec: 22,
  },
  guess_the_move: {
    hook: 'Guess the move before the reveal',
    voice:
      'Pause the video and guess the best move. Ready? Here is the reveal.',
    durationSec: 22,
  },
  comeback: {
    hook: 'He was losing the whole game. Then this happened',
    voice:
      'Down almost the entire match, then one move turned everything around. Watch this comeback.',
    durationSec: 24,
  },
  last_second_win: {
    hook: 'Won on the very last move',
    voice:
      'The game was almost over, and then the last move won it. Watch this last second win.',
    durationSec: 24,
  },
  replay_highlight: {
    hook: 'Watch this move',
    voice:
      'A real match played on Arcadeum. Watch the moment everything changes.',
    durationSec: 24,
  },
};

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function makeId(game, format, theme) {
  return [slugify(game), format, slugify(theme)].join(':');
}

function makeCaption(copy, themeName, tags) {
  const themePart = themeName === 'Classic' ? '' : ` ${themeName} theme.`;
  return `${copy.hook}${themePart} Play free on arcadeum.games ${tags} #gaming #shorts`;
}

/** Build one scenario (without a seed; the picker assigns it). */
function buildScenario(game, format, theme) {
  const g = GAME_COPY[game];
  if (!g) throw new Error(`Unknown game: ${game}`);
  const themeObj =
    typeof theme === 'string' ? THEMES.find((t) => t.id === theme) : theme;
  if (!themeObj) throw new Error(`Unknown theme: ${theme}`);

  let copy;
  let durationSec = 28;
  let dramaticMoment = {
    type: 'step',
    value: g.drama,
    label: 'first big move',
  };
  if (format === 'bot_match') {
    copy = { hook: g.hook, voice: g.voice };
  } else {
    const f = FORMAT_COPY[format];
    if (!f) throw new Error(`Unknown format: ${format}`);
    copy = { hook: `${g.label}: ${f.hook}`.slice(0, 80), voice: f.voice };
    durationSec = f.durationSec;
    dramaticMoment = {
      type: 'timestamp',
      value: format === 'puzzle' || format === 'guess_the_move' ? 5 : 8,
      label: 'reveal',
    };
  }
  const tags =
    format === 'puzzle' || format === 'guess_the_move'
      ? `${g.tags} #puzzle`
      : g.tags;
  return {
    id: makeId(game, format, themeObj.id),
    game,
    gameId: GAME_IDS[game],
    format,
    theme: themeObj.id,
    hook: copy.hook,
    voiceScript: copy.voice,
    caption: makeCaption(copy, themeObj.name, tags),
    dramaticMoment,
    durationSec,
    seed: 0,
  };
}

/**
 * All candidate scenarios given what data is available.
 * `available` = { replay: boolean, puzzle: boolean }.
 */
function buildPool(available = { replay: false, puzzle: true }, opts = {}) {
  const games = opts.games || Object.keys(GAME_COPY);
  const pool = [];
  for (const game of games) {
    for (const format of ['bot_match', ...Object.keys(FORMAT_COPY)]) {
      if (REPLAY_FORMATS.has(format) && !available.replay) continue;
      if (
        PUZZLE_FORMATS.has(format) &&
        !(available.puzzle && PUZZLE_GAMES.has(game))
      )
        continue;
      for (const theme of THEMES) pool.push(buildScenario(game, format, theme));
    }
  }
  return pool;
}

module.exports = { GAME_COPY, FORMAT_COPY, buildScenario, buildPool, makeId };

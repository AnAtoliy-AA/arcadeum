'use strict';

/**
 * Spoken lines per format and story beat. Longer videos draw more lines from
 * the build_up pool; every line adds information or tension (a hint, a stake,
 * a countdown), so a longer video has structure instead of padding.
 * `{game}` is replaced with the game label. No em dashes (see schema.js).
 */
const BEAT_LINES = {
  bot_match: {
    setup: [
      'This is {game} on Arcadeum, played live against the bot.',
      'Both sides start even, so every move counts.',
    ],
    build_up: [
      'Watch how the bot answers the first few moves.',
      'It tests your defense before it commits.',
      'Now the position starts to open up.',
      'One careless move here and it will punish you.',
    ],
    reveal: [
      'And there is the move that changes everything.',
      'That is the moment the match turns.',
    ],
    recap: ['One move, and the whole game swung.'],
  },
  puzzle: {
    setup: [
      'Here is a real position from a real game.',
      'It is your move, and only one move wins.',
    ],
    build_up: [
      'First, look for checks.',
      'Now look at every capture on the board.',
      'Next, ask what the opponent is threatening.',
      'Which enemy piece is poorly protected?',
      'Count the defenders around the weak square.',
      'Last hint: the answer is a forcing move.',
    ],
    reveal: [
      'Here is the answer.',
      'See how every other move lets them escape?',
    ],
    recap: ['Remember the pattern. It shows up in real games all the time.'],
  },
  guess_the_move: {
    setup: ['Pause the video and guess the best move.'],
    build_up: ['Take your time, then keep watching.'],
    reveal: ['Here is the reveal.'],
    recap: ['Did you get it?'],
  },
  comeback: {
    setup: [
      'This is a real match played on Arcadeum.',
      'One player is far behind, and the odds look terrible.',
    ],
    build_up: [
      'Watch the board slowly tilt against them.',
      'Every move, the gap gets wider.',
      'It looks completely over.',
      'But there is one resource left on the board.',
    ],
    reveal: ['And there it is.', 'That single move flips the whole game.'],
    recap: ['From losing to winning in one move.'],
  },
  last_second_win: {
    setup: [
      'A real match from Arcadeum, and it is close.',
      'Nobody is ahead, and the game is almost over.',
    ],
    build_up: [
      'Each side trades blows down to the last turns.',
      'The final moves matter more than anything before them.',
      'There is one move left that can decide it.',
    ],
    reveal: ['The last move wins it.', 'That is how you win at the buzzer.'],
    recap: ['Never stop playing until the very end.'],
  },
  replay_highlight: {
    setup: [
      'A real match played on Arcadeum.',
      'Everything looks calm. Stay with it.',
    ],
    build_up: [
      'Watch the pieces line up for something big.',
      'The pressure keeps building on one side.',
      'Keep your eyes on the next move.',
      'This is the move the whole match was heading toward.',
    ],
    reveal: ['There it is.', 'That is the moment everything changes.'],
    recap: ['One big moment, and nothing was the same.'],
  },
  feature_story: {
    setup: [
      'This is the story of one match on Arcadeum.',
      'Two players, one board, and a lot at stake.',
      'We start at the very beginning.',
    ],
    build_up: [
      'The opening is quiet, and both sides play it safe.',
      'Then the first real mistake appears.',
      'The balance starts to shift.',
      'One player takes control and builds a lead.',
      'Pressure mounts, and the clock starts to matter.',
      'The other side is running out of options.',
    ],
    reveal: [
      'Then comes the turning point.',
      'One move, and nothing is the same.',
      'This is what the whole story was building toward.',
    ],
    resolution: [
      'The dust settles, and the result is clear.',
      'Replay it yourself and see what you would have done.',
    ],
  },
};

/** How many lines of each beat a class uses (short keeps its legacy voice). */
const LINE_COUNTS = {
  short: { setup: 0, build_up: 0, reveal: 0, recap: 0, resolution: 0 },
  medium: { setup: 1, build_up: 3, reveal: 2, recap: 1, resolution: 0 },
  long: { setup: 2, build_up: 4, reveal: 2, recap: 1, resolution: 0 },
  feature: { setup: 3, build_up: 6, reveal: 3, recap: 0, resolution: 2 },
};

module.exports = { BEAT_LINES, LINE_COUNTS };

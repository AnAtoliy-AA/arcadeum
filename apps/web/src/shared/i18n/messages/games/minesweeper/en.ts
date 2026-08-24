export const enMessages = {
  minesweeper_v1: {
    name: 'Minesweeper',
    description:
      'Classic Minesweeper — clear the grid without detonating a single mine',
    summary:
      'The iconic logic puzzle: reveal every safe square, flag the mines, and beat the clock.',
    board: {
      label: 'Minefield',
      loading: 'Sweeping…',
      cellHidden: 'Hidden cell',
      cellFlagged: 'Flagged cell',
      cellMine: 'Mine',
      cellEmpty: 'Empty cell',
    },
    hud: {
      mines: 'Mines left',
      time: 'Time',
      newGame: 'New game',
      flagMode: 'Flag mode',
      flagModeHint: 'Toggle to plant flags with taps — ideal on touch screens',
      difficulty: 'Difficulty',
    },
    difficulty: {
      beginner: 'Beginner (9×9 · 10 mines)',
      intermediate: 'Intermediate (16×16 · 40 mines)',
      expert: 'Expert (22×16 · 80 mines)',
    },
    result: {
      wonTitle: 'Field cleared!',
      wonBody: 'Every safe square revealed — flawless sweeping.',
      lostTitle: 'Boom!',
      lostBody: 'That one was a mine. Study the numbers and try again.',
      playAgain: 'Play again',
    },
    rules: {
      objective:
        'Reveal every square that does not hide a mine. Uncover all safe cells to win.',
      gameplay:
        'Numbers show how many of the eight surrounding cells hold mines. Flag suspected mines with a right click or long press; tap a satisfied number to chord-open its neighbors.',
      scoring:
        'Your first click is always safe and starts the timer. Clear the field as fast as you can — time is your only score.',
    },
    landing: {
      tagline: 'Single-player · No signup',
      meta: {
        title: 'Minesweeper — Free Online Classic Puzzle Game | Arcadeum',
        description:
          'Play Minesweeper free online at Arcadeum. Beginner to expert grids, flags, chording, timer, and saved progress. No download, no signup — instant logic puzzles.',
        keywords:
          'minesweeper, mine sweeper, puzzle game, logic game, single player, free, online, browser game, no download',
      },
      hero: {
        title: 'Minesweeper',
        subtitle:
          'The legendary logic puzzle. Read the numbers, flag the bombs, and sweep every board from 9×9 to expert size.',
        ctaPlay: 'Play now',
      },
      features: {
        solo: {
          title: 'Truly single-player',
          body: 'No accounts, no waiting rooms — a fresh minefield is one click away.',
        },
        progress: {
          title: 'Progress is saved',
          body: 'Close the tab mid-sweep and your field is exactly as you left it.',
        },
        stats: {
          title: 'Your results tracked',
          body: 'Wins and losses feed your Arcadeum stats dashboard automatically.',
        },
      },
      faq: {
        q1: {
          question: 'Is Minesweeper free to play?',
          answer:
            'Yes — Minesweeper on Arcadeum is completely free, requires no download, and needs no account to start playing.',
        },
        q2: {
          question: 'How do I place flags on mobile?',
          answer:
            'Turn on flag mode, or simply long-press a hidden cell. Right-click works on desktop.',
        },
        q3: {
          question: 'Is my progress saved?',
          answer:
            'Yes. Your current field, difficulty, and statistics are stored locally so you can continue anytime.',
        },
      },
      steps: {
        create: {
          title: 'Pick your grid',
          body: 'Start on the 9×9 beginner field or jump straight into the expert minefield.',
        },
        join: {
          title: 'Read the numbers',
          body: 'Each number counts the mines touching that square. Tap to reveal, long-press to flag.',
        },
        play: {
          title: 'Clear the field',
          body: 'Chord satisfied numbers to open safe cells fast and sweep every square but the bombs.',
        },
      },
    },
  },
};

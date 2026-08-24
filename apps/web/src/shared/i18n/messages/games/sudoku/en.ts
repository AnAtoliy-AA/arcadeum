export const enMessages = {
  sudoku_v1: {
    name: 'Sudoku',
    description:
      'Classic Sudoku — fill the 9×9 grid so every row, column and box holds 1–9 once',
    summary:
      'The world’s favorite number puzzle: pure logic, three difficulties, pencil marks included.',
    board: {
      loading: 'Setting up…',
    },
    hud: {
      time: 'Time',
      mistakes: 'Mistakes',
      newGame: 'New game',
      difficulty: 'Difficulty',
    },
    difficulty: {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
    },
    controls: {
      notes: 'Notes',
      notesHint:
        'Toggle pencil marks — digits go into the cell as candidates instead of answers',
      erase: 'Erase',
      placeDigit: 'Place digit {{digit}}',
      noteDigit: 'Toggle note {{digit}}',
    },
    result: {
      wonTitle: 'Solved!',
      wonBody:
        'Grid complete with {{mistakes}} mistake(s) along the way. Nicely done.',
      flawlessBody: 'Flawless solve — not a single wrong entry.',
      playAgain: 'Play again',
    },
    rules: {
      objective:
        'Fill the entire 9×9 grid so that every row, every column and each 3×3 box contains the digits 1–9 exactly once.',
      gameplay:
        'Tap a cell and pick a digit from the pad or keyboard. Switch to Notes mode to jot candidate numbers before committing.',
      scoring:
        'Wrong entries count as mistakes but stay on the board for you to fix — a clean, quick solve is the goal.',
    },
    landing: {
      tagline: 'Single-player · No signup',
      meta: {
        title: 'Sudoku — Free Online Number Puzzle Game | Arcadeum',
        description:
          'Play Sudoku free online at Arcadeum. Easy, medium and hard puzzles with unique solutions, pencil marks, keyboard play, and saved progress. No download, no signup.',
        keywords:
          'sudoku, number puzzle, logic game, single player, free, online, browser game, no download, sudoku online',
      },
      hero: {
        title: 'Sudoku',
        subtitle:
          'The classic 9×9 logic puzzle with hand-tuned difficulty levels, pencil marks, and zero ads in your way.',
        ctaPlay: 'Play now',
      },
      features: {
        solo: {
          title: 'Truly single-player',
          body: 'No accounts, no waiting rooms — a fresh unique puzzle in one click.',
        },
        progress: {
          title: 'Progress is saved',
          body: 'Close the tab mid-solve and your grid is exactly as you left it.',
        },
        stats: {
          title: 'Your results tracked',
          body: 'Every finished grid feeds your Arcadeum stats dashboard automatically.',
        },
      },
      faq: {
        q1: {
          question: 'Is Sudoku free to play?',
          answer:
            'Yes — Sudoku on Arcadeum is completely free, requires no download, and needs no account to start playing.',
        },
        q2: {
          question: 'Does every puzzle have one solution?',
          answer:
            'Yes. Every generated puzzle is verified to admit exactly one solution — you can always reason your way to it.',
        },
        q3: {
          question: 'Can I play on my phone?',
          answer:
            'Absolutely. The number pad is touch-friendly, and Notes mode lets you jot candidates just like on paper.',
        },
      },
      steps: {
        create: {
          title: 'Pick a difficulty',
          body: 'Easy grids hold about forty clues; hard ones drop to around twenty-six.',
        },
        join: {
          title: 'Scan the rows',
          body: 'Find where a digit fits by elimination — tap the cell, then tap its number on the pad.',
        },
        play: {
          title: 'Complete the grid',
          body: 'Use Notes to track candidates and fill in every cell from 1 to 9 without repeats.',
        },
      },
    },
  },
};

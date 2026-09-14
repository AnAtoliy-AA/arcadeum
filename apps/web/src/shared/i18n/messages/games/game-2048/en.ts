export const enMessages = {
  game_2048_v1: {
    name: '2048',
    description:
      'The addictive tile-merging puzzle — slide, merge, and chase the 2048 tile',
    summary:
      'Swipe the numbered tiles together, double them over and over, and see how far past 2048 you can go.',
    board: {
      loading: 'Dealing tiles…',
      controlsHint:
        'Arrow keys or WASD on desktop · swipe or the pad below on mobile',
    },
    hud: {
      score: 'Score',
      best: 'Best',
      time: 'Time',
      newGame: 'New game',
      movesLabel: 'Moves',
    },
    result: {
      wonTitle: '2048!',
      wonBody:
        'You built the legendary tile. Keep going for an even bigger score?',
      lostTitle: 'Board jammed',
      lostBody:
        'No moves left — every square is full. Shuffle up and try again!',
      playAgain: 'Play again',
      keepGoing: 'Keep going',
    },
    rules: {
      objective:
        'Slide tiles across the 4×4 grid and merge equal numbers until you create the 2048 tile.',
      gameplay:
        'Every move shifts all tiles one step; matching neighbors fuse into their sum. A new 2 or 4 appears after each move.',
      scoring:
        'Each merge adds its new value to your score. The game ends when the grid jams with no moves remaining.',
    },
    landing: {
      tagline: 'Single-player · No signup',
      meta: {
        title: '2048 — Free Online Tile-Merging Puzzle Game | Arcadeum',
        description:
          'Play 2048 free online at Arcadeum. Slide and merge numbered tiles on a 4×4 grid, chase your best score, with saved progress. No download, no signup.',
        keywords:
          '2048, tile game, merge game, puzzle game, single player, free, online, browser game, no download',
      },
      hero: {
        title: '2048',
        subtitle:
          'The famously addictive merging puzzle. Simple rules, endless depth — how far past 2048 can you get?',
        ctaPlay: 'Play now',
      },
      features: {
        solo: {
          title: 'Truly single-player',
          body: 'No accounts, no waiting rooms — a fresh board is one click away.',
        },
        progress: {
          title: 'Progress is saved',
          body: 'Close the tab mid-run and your board and best score are waiting.',
        },
        stats: {
          title: 'Your results tracked',
          body: 'Every finished run feeds your Arcadeum stats dashboard automatically.',
        },
      },
      faq: {
        q1: {
          question: 'Is 2048 free to play?',
          answer:
            'Yes — 2048 on Arcadeum is completely free, requires no download, and needs no account to start playing.',
        },
        q2: {
          question: 'How do I play on mobile?',
          answer:
            'Just swipe anywhere on the board — up, down, left, or right. On desktop use the arrow keys or WASD.',
        },
        q3: {
          question: 'What happens after I reach 2048?',
          answer:
            'You win — and you can keep playing the same board for an even higher score.',
        },
        q4: {
          question: 'What is the optimal strategy to reach the 2048 tile?',
          answer:
            'Anchor your highest-value tile in one chosen corner and build descending numerical chains along that border without moving the corner tile.',
        },
        q5: {
          question: 'What tiles spawn after each move?',
          answer:
            'Every valid slide spawns a new tile on an empty cell — with a 90% probability of a 2 and a 10% chance of a 4.',
        },
        q6: {
          question: 'How is the score calculated?',
          answer:
            'Whenever two matching tiles collide and merge, the value of the newly created tile is added directly to your total score.',
        },
        q7: {
          question: 'When is a game considered game over?',
          answer:
            'Game over occurs when all 16 cells are filled with tiles and no adjacent horizontal or vertical matches exist to merge.',
        },
        q8: {
          question: 'Can a newly merged tile merge again in the same move?',
          answer:
            'No. A tile formed by a merge cannot combine again during that same slide, following standard 2048 rules.',
        },
        q9: {
          question: 'Can I undo an accidental move?',
          answer:
            'Yes. Arcadeum 2048 includes an undo option so you can reverse an accidental swipe and keep your strategy intact.',
        },
        q10: {
          question: 'What is the maximum achievable tile on a 4×4 board?',
          answer:
            'The theoretical mathematical limit is the 131,072 tile, while reaching 4,096 or 8,192 is already an exceptional accomplishment.',
        },
      },
      steps: {
        create: {
          title: 'Start sliding',
          body: 'Two tiles are on the board. Swipe or press an arrow key to move everything at once.',
        },
        join: {
          title: 'Merge equals',
          body: 'When two identical tiles collide they fuse into one tile of double the value.',
        },
        play: {
          title: 'Chase 2048',
          body: 'Plan corners and chains carefully — the grid fills up fast, and a jammed board ends the run.',
        },
      },
    },
  },
};

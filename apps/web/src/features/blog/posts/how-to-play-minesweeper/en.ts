import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-minesweeper',
  locale: 'en',
  title: 'How to Play Minesweeper Online — Rules, Logic, Winning Strategy',
  excerpt:
    'A complete guide to Minesweeper: grid rules, flagging, number patterns, probability, and the habits that help you clear every mine without guessing.',
  publishedAt: '2026-06-05',
  author: 'Arcadeum team',
  tags: ['Minesweeper', 'Puzzle', 'How to Play', 'Logic', 'Strategy'],
  readingTimeMinutes: 6,
  body: [
    {
      type: 'paragraph',
      text: 'Minesweeper is the classic single-player logic puzzle: a grid of hidden squares contains randomly placed mines. Your job is to flag every mine and reveal every safe square using pure deduction. Each revealed number tells you exactly how many mines touch that square. No guessing required in well-designed Minesweeper.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'The grid',
      id: 'grid',
    },
    {
      type: 'paragraph',
      text: 'A standard Minesweeper grid (Beginner 9x9 with 10 mines, Intermediate 16x16 with 40 mines, Expert 30x16 with 99 mines) starts fully hidden. Clicking a square reveals it. If it is a mine, the game ends. If it is safe, a number appears showing how many of the eight adjacent squares contain mines.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Revealing vs. flagging',
      id: 'actions',
    },
    {
      type: 'paragraph',
      text: 'Left-click reveals a square. Right-click (or long-press) places a flag on a square you believe contains a mine. Some versions allow chord-clicking: clicking both buttons on a numbered square when the correct number of flags surround it reveals all remaining unflagged neighbours instantly.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'How to read numbers',
      id: 'reading',
    },
    {
      type: 'paragraph',
      text: 'A "1" means exactly one of the eight adjacent squares is a mine. A "2" means two, and so on. The number only counts mines in the eight immediate neighbours. The first click in most online implementations is guaranteed safe.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Core logic patterns',
      id: 'patterns',
    },
    {
      type: 'list',
      items: [
        'The 1-2-1 pattern. Three adjacent cells reading 1-2-1. The mines must be on the outer squares and the middle is safe.',
        'The 1-1 pattern on a wall. Two 1s sharing adjacent squares along the edge. The square outside their shared area is safe.',
        'Subtraction. If a "3" has three flagged neighbours, all other adjacent squares are safe. If a "2" has two flagged neighbours, the rest are safe.',
        'Cross-referencing. Two adjacent numbers sharing hidden squares narrow down mine locations.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'When logic runs out — probability',
      id: 'probability',
    },
    {
      type: 'paragraph',
      text: 'When no logical deduction is possible, choose the square with the lowest probability of being a mine. Count remaining mines and hidden squares. In competitive play, fast logical deduction beats fast clicking.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Tactical habits',
      id: 'strategy',
    },
    {
      type: 'list',
      items: [
        'Start from edges. Corner and edge squares have fewer adjacent mines on average.',
        'Flag only when certain. Over-flagging slows you down and creates confusion.',
        'Use chord-clicking to speed up reveals when you have confirmed flags.',
        'Work multiple number clusters simultaneously to cross-reference deductions.',
      ],
    },
    {
      type: 'cta',
      href: '/games/minesweeper',
      text: 'Play Minesweeper online — free, in your browser',
      description:
        'Classic Minesweeper with multiple grid sizes and difficulty levels. Test your logic skills.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'TL;DR — the four habits that win games',
      id: 'tldr',
    },
    {
      type: 'list',
      items: [
        'Use number patterns (1-2-1, subtraction) to deduce mines without guessing.',
        'Start revealing from the edges where you get the most information.',
        'Flag only confirmed mines — avoid over-flagging.',
        'When guessing is unavoidable, pick the square with the lowest mine probability.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Minesweeper rewards pure logic and pattern recognition. Every puzzle has a deterministic solution path. Train your brain on the common patterns and your clear rate will climb steadily.',
    },
  ],
  howTo: {
    totalTime: 'PT15M',
    steps: [
      {
        name: 'Learn number patterns',
        text: 'Master the 1-2-1 pattern and subtraction rule. These two patterns solve most early-game positions.',
        url: '#patterns',
      },
      {
        name: 'Start from the edges',
        text: 'Click near the borders first. Edge squares have fewer neighbours, generating more information per click.',
        url: '#strategy',
      },
      {
        name: 'Flag confirmed mines only',
        text: 'Flag a square only when your deduction confirms it. Over-flagging wastes time and creates false confidence.',
        url: '#actions',
      },
      {
        name: 'Cross-reference numbers',
        text: 'Compare adjacent numbers sharing hidden squares to narrow mine locations down to single squares.',
        url: '#patterns',
      },
    ],
  },
};

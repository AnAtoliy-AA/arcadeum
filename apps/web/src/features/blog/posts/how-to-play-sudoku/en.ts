import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-sudoku',
  locale: 'en',
  title: 'How to Play Sudoku Online — Rules, Techniques, Solving Strategy',
  excerpt:
    'A complete beginner-friendly guide to Sudoku: the rules, scanning techniques, pencil marks, and the logical steps that solve every puzzle without guessing.',
  publishedAt: '2026-06-12',
  author: 'Arcadeum team',
  tags: ['Sudoku', 'Puzzle', 'How to Play', 'Logic', 'Strategy'],
  readingTimeMinutes: 7,
  body: [
    {
      type: 'paragraph',
      text: "Sudoku is the world's most popular number-placement puzzle. A 9x9 grid is divided into nine 3x3 boxes, and some cells are pre-filled with digits 1 through 9. Your task: fill every empty cell so that each row, each column, and each 3x3 box contains all digits 1-9 exactly once. No arithmetic required — Sudoku is pure logic and pattern recognition.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'The rules',
      id: 'rules',
    },
    {
      type: 'paragraph',
      text: 'Each row must contain the digits 1-9 exactly once. Each column must contain 1-9 exactly once. Each 3x3 box must contain 1-9 exactly once. No cell may contain more than one digit. These three constraints interact — a digit placed in one cell eliminates that digit from its entire row, column, and box simultaneously.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Scanning — the foundation',
      id: 'scanning',
    },
    {
      type: 'paragraph',
      text: 'Cross-hatching is the most basic technique. For a given digit (say 5), look at which rows, columns, and boxes already contain it. The intersection of those constraints often leaves only one possible cell in a box for that digit. Repeat for every digit in every box until no more easy placements remain.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Pencil marks',
      id: 'pencil-marks',
    },
    {
      type: 'paragraph',
      text: 'When scanning cannot place a digit directly, write small candidate numbers (pencil marks) in each empty cell listing all digits that could legally go there. As more digits are placed, pencil marks shrink. A cell with only one remaining candidate must contain that digit (naked single). A digit that appears in only one cell within a row, column, or box must go there (hidden single).',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Intermediate techniques',
      id: 'intermediate',
    },
    {
      type: 'list',
      items: [
        'Naked pairs. Two cells in the same row, column, or box that contain exactly the same two candidates. Those two digits are locked to those cells — eliminate them from all other cells in that group.',
        'Naked triples. Three cells sharing the same three candidates (not all three in every cell). Eliminate those digits from other cells in the group.',
        'Hidden pairs. Two digits that only appear as candidates in two cells within a row, column, or box. Those two cells must contain those two digits — eliminate all other candidates from them.',
        'Pointing pairs. Two cells in the same box that share a candidate and lie in the same row or column. That candidate can be eliminated from other cells in that row or column outside the box.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Advanced techniques',
      id: 'advanced',
    },
    {
      type: 'list',
      items: [
        'Box-line reduction. When a candidate in a row or column appears only within one box, eliminate it from other cells in that box.',
        'X-Wing. Two rows where a candidate appears in only two columns (the same two columns in both rows). Eliminate that candidate from all other cells in those two columns.',
        'Swordfish. An extension of X-Wing to three rows and three columns.',
        'XY-Wing. Three cells forming a pivot pattern that eliminates a candidate from a cell seeing both "wing" cells.',
      ],
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
        'Never guess. Sudoku is deterministic — every puzzle has a logical solution path. Guessing leads to contradictions and wasted time.',
        'Work systematically. Scan every digit 1-9 through every box before moving to harder techniques.',
        'Update pencil marks after every placement. Stale pencil marks cause errors.',
        'Look for the most constrained cells first. Cells with the fewest candidates are the easiest to solve.',
      ],
    },
    {
      type: 'cta',
      href: '/games/sudoku',
      text: 'Play Sudoku online — free, in your browser',
      description:
        'Multiple difficulty levels from beginner to expert. Track your solve time and improve your technique.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'TL;DR — the four habits that solve puzzles',
      id: 'tldr',
    },
    {
      type: 'list',
      items: [
        'Start with cross-hatching: place digits that are constrained to one cell in each box.',
        'Use pencil marks and look for naked/hidden singles before harder techniques.',
        'Never guess — if stuck, re-scan or look for pairs and pointing patterns.',
        'Work systematically digit by digit and update pencil marks after every placement.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Sudoku rewards logical discipline and systematic thinking. The puzzles are designed to be solved without guessing. Master the scanning and pencil-mark techniques and you will solve even Expert-level puzzles consistently.',
    },
  ],
  howTo: {
    totalTime: 'PT20M',
    steps: [
      {
        name: 'Cross-hatch every digit',
        text: 'For each digit 1-9, check which rows and columns already contain it. The intersection often leaves only one possible cell in each box.',
        url: '#scanning',
      },
      {
        name: 'Add pencil marks',
        text: 'Write candidate numbers in each empty cell. As digits are placed, candidates shrink until singles emerge.',
        url: '#pencil-marks',
      },
      {
        name: 'Find naked and hidden singles',
        text: 'A cell with one candidate must be that digit. A digit appearing in only one cell in a group must go there.',
        url: '#pencil-marks',
      },
      {
        name: 'Never guess',
        text: 'Every Sudoku has a logical path. If stuck, re-scan or apply pair techniques instead of guessing.',
        url: '#strategy',
      },
    ],
  },
};

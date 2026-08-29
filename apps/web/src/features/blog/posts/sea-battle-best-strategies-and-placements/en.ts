import { appConfig } from '@/shared/config/app-config';
import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'sea-battle-best-strategies-and-placements',
  locale: 'en',
  title: 'Best Battleship Placements and Strategies: How to Win Online Matches',
  excerpt:
    'Master the board with the best Battleship fleet placements, 10×10 grid tactics, parity search methods, and target hunting strategies for free online multiplayer.',
  publishedAt: '2026-08-29',
  author: `${appConfig.appName} Team`,
  tags: [
    'Battleship',
    'Sea Battle',
    'Best Ship Placement',
    'Strategy Guide',
    'Parity Search',
    'Board Games',
  ],
  readingTimeMinutes: 7,
  body: [
    {
      type: 'paragraph',
      text: 'Battleship (Sea Battle) is not merely a game of blind guessing. It is a mathematical contest governed by probability theory and strategic deduction. In fact, over 80% of a match’s outcome is decided during the initial fleet deployment phase. In this guide, we break down top-tier placement schemes, search algorithms, and tactical secrets used by seasoned admirals.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'The 10×10 Grid and Fleet Breakdown',
      id: 'grid-and-fleet',
    },
    {
      type: 'paragraph',
      text: 'The battle takes place on a 10×10 coordinate grid (100 cells total). In canonical rules, players deploy a fleet of ships spanning different lengths (from 4-cell battleships down to single-cell patrol crafts). Ships cannot overlap or touch each other horizontally, vertically, or diagonally.',
    },
    {
      type: 'list',
      items: [
        '1 Battleship (4 cells)',
        '2 Cruisers (3 cells each)',
        '3 Destroyers (2 cells each)',
        '4 Patrol Boats / Submarines (1 cell each)',
      ],
    },
    {
      type: 'paragraph',
      text: 'Because ships cannot touch, sinking any enemy vessel automatically creates a 1-cell buffer zone around it where no other ships can possibly exist. Mastering these dead zones is crucial to victory.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Top 4 Winning Ship Placement Strategies',
      id: 'top-placements',
    },
    {
      type: 'list',
      items: [
        '1. The Perimeter ("Shoreline") Setup: Place your larger vessels along the outer edges of the 10×10 grid. This naturally "pushes" half of their dead zones off the board, preserving valuable open ocean in the middle.',
        '2. Diagonal Staggering: Position ships on parallel diagonal trajectories. Diagonal alignments minimize the chance that a single linear sweep will uncover multiple ships.',
        '3. 4-Quadrant Distribution: Divide your board into four 5×5 quadrants and place one major ship and one patrol boat in each. This eliminates clustered defeats.',
        '4. Perelman Stealth Strategy: Group major vessels along one border while scattering small 1-cell submarines in random central pockets. Isolating tiny crafts makes them exceptionally difficult to locate in late-game salvos.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Firing Tactics: Parity Search & Target Hunting',
      id: 'firing-tactics',
    },
    {
      type: 'list',
      items: [
        'Parity Search (Checkerboard Pattern): Since the smallest multi-cell ship spans 2 cells, firing strictly on alternating squares (like black squares on a chessboard) guarantees hitting every ship while cutting search effort by 50%.',
        'Hunt-and-Target: Once a hit registers, probe the 4 orthogonal neighboring cells (North, South, East, West). Once a second hit confirms the line, continue along that axis until the ship sinks.',
        'Dead Zone Exclusion: Immediately eliminate the 8 surrounding cells of any sunk ship from future targeting.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Play Free Battleship Online with Friends or AI',
      id: 'play-online',
    },
    {
      type: 'paragraph',
      text: `On ${appConfig.appName}, you can jump into Sea Battle directly in your browser without downloads or signups. Create an instant room to invite friends, team up in 2v2 battles, or refine your tactics against intelligent AI bots.`,
    },
    {
      type: 'cta',
      href: '/games/sea-battle',
      text: 'Play Sea Battle Online — Create Room',
      description:
        'Test your strategic placements now: play free with friends via shareable link or challenge AI bots!',
    },
  ],
  faq: [
    {
      question: 'What is the best ship placement in Battleship?',
      answer:
        'The most effective layout combines perimeter hugging for larger 3- and 4-cell ships with widely dispersed 1-cell submarines in the center, minimizing telltale dead zones.',
    },
    {
      question: 'How does the parity search strategy work in Battleship?',
      answer:
        'By firing only on alternate grid squares (checkerboard pattern), you are mathematically guaranteed to strike every ship of length 2 or greater within 50 shots instead of 100.',
    },
    {
      question: 'Can I play Sea Battle online with friends for free?',
      answer: `Yes! ${appConfig.appName} lets you create a multiplayer room in one click and share the link with friends. No registration or download required.`,
    },
  ],
};

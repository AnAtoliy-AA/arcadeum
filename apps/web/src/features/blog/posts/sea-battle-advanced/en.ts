import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'sea-battle-advanced',
  locale: 'en',
  title:
    'Sea Battle Mind Games — Fleet Placement Psychology, Probability Hunting, and Endgame Patterns',
  excerpt:
    'Stop guessing randomly: learn the optimal fleet placement patterns, probability-driven hunt sequences, and endgame ship-counting that give you a systematic edge in Sea Battle (Battleship).',
  publishedAt: '2026-09-11',
  author: 'Arcadeum team',
  tags: ['Sea Battle', 'Battleship', 'Strategy', 'Advanced', 'Probability'],
  readingTimeMinutes: 10,
  body: [
    {
      type: 'paragraph',
      text: 'Sea Battle is not pure luck. Two players with the same dice rolls but different strategies have dramatically different win rates. The player who places ships optimally and hunts targets algorithmically rather than randomly will win more games over time — even though any individual game has variance. This guide covers the placement psychology, probability calculations, and hunt patterns that make the difference.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Optimal fleet placement — the science',
      id: 'placement',
    },
    {
      type: 'paragraph',
      text: "Fleet placement is where Sea Battle is decided before the first shot. The goal is to place ships such that the opponent's probability-based hunting takes as long as possible to find all your ships.",
    },
    {
      type: 'stat-card',
      title: 'Fleet in standard Sea Battle',
      stats: [
        { value: '1×5', label: 'Carrier', description: '5 squares' },
        { value: '1×4', label: 'Battleship', description: '4 squares' },
        { value: '2×3', label: 'Cruiser/Sub', description: '3 squares each' },
        { value: '2×2', label: 'Destroyer', description: '2 squares each' },
      ],
    },
    {
      type: 'list',
      items: [
        'Avoid the center: most human players hunt the center first, since probability-based analysis shows the center squares are hit more often by statistical hunting. Place your larger ships near the edges or in corners.',
        'Use the edges strategically: a ship placed against the edge (row 1 or column A) can only be hit from one side — halving the directions from which adjacent squares of that ship can be discovered.',
        'Spread your fleet: ships clustered together are found together. When adjacent ships are discovered by following hits, a single run of luck destroys multiple ships. Space them out by at least 2 squares.',
        'Vary your placement each game: if you always place ships the same way, a pattern-aware opponent can exploit it. Randomize within principles.',
        'Diagonal adjacency is fine: ships cannot be placed diagonally adjacent by some rule variants, but in standard rules where diagonal adjacency is allowed, a diagonal cluster makes it harder to infer ship orientation from a hit.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'The probability density map — how smart players hunt',
      id: 'probability-hunting',
    },
    {
      type: 'paragraph',
      text: 'The optimal hunting strategy is based on probability density. At any point in the game, given which squares have been hit and missed, each unrevealed square has a certain probability of containing a ship. Shoot the highest-probability squares first.',
    },
    {
      type: 'list',
      items: [
        'The checkerboard pattern: the most efficient no-information hunt is the checkerboard (alternate black and white squares). Why? The smallest ship is 2 squares long. If you shoot every other square, you guarantee hitting every ship at least once within N/2 shots where N is total squares. This is the baseline.',
        'Adapt the pattern to surviving ships: if the only ship remaining is the 5-square carrier, you only need to hit every 5th square in a row. Spread your shots wider.',
        'After a hit: focus on the adjacent squares (up, down, left, right) of the hit square. One of them must be part of the ship.',
        "After two adjacent hits: you have established the ship's orientation. Shoot along the axis (not perpendicular) to find the ends.",
        'Eliminate impossible placements: if you know the carrier (5 squares) is still alive and there are only 4 consecutive squares remaining in a row, the carrier cannot be in that row. Use this to narrow down its location.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'The destroy phase — from hit to sink',
      id: 'destroy-phase',
    },
    {
      type: 'paragraph',
      text: 'Once you have a hit, switching from hunt mode to destroy mode is critical. Randomizing in destroy mode (shooting all four adjacent squares randomly) is suboptimal. Systematic destroy is faster:',
    },
    {
      type: 'list',
      items: [
        'Step 1: shoot one adjacent square from the hit. If it misses, the ship extends in the opposite direction — shoot the other side.',
        'Step 2: once you have two hits in a row, you know the orientation. Shoot both ends until you reach a miss on both sides — the ship is sunk.',
        'Step 3: immediately return to hunt mode. Do not continue shooting adjacent to the sunk ship unless you have reason to believe another ship is nearby.',
        'Common mistake: after sinking a 3-square ship in a 3-hit sequence, players often continue shooting adjacent squares "just in case." This wastes shots. The rules confirm when a ship is sunk.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Endgame ship counting — deduction beats guessing',
      id: 'endgame-counting',
    },
    {
      type: 'paragraph',
      text: 'As the game progresses and ships are sunk, the number of possible placements for surviving ships decreases dramatically. In the endgame, precise deduction beats probability hunting.',
    },
    {
      type: 'list',
      items: [
        'Track which ships are still alive. After sinking the carrier (5) and one cruiser (3), you know the remaining ships are: battleship (4), one cruiser (3), two destroyers (2). Count the remaining unsearched squares — the ships must fit somewhere in them.',
        'Counting squares: if there are 15 unsearched squares and 11 ship-squares remaining (4+3+2+2), the density is very high — almost every unsearched square could be part of a ship.',
        'Eliminate by size: if only 3 consecutive squares remain in a row (and ships cannot overlap), the 4-square battleship cannot be there. Cross off impossible positions.',
        'The last ship: when only one ship remains and multiple configurations are possible, calculate exact probabilities. If the 2-square destroyer can fit in 4 spots, and 2 of those spots share a common square, shoot the common square first — it covers multiple possibilities.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Reading your opponent — prediction and bluffing',
      id: 'reading-opponent',
    },
    {
      type: 'paragraph',
      text: "Sea Battle has a psychological layer. Experienced players recognize opponents' placement habits and adapt.",
    },
    {
      type: 'list',
      items: [
        'Edge bias: most human players cluster ships near edges. Prioritize edge hunting slightly over center hunting against human opponents (reverse the statistical advice for the placement phase).',
        'Corner ships: a disproportionate number of beginners place their most important ship (the carrier) in a corner. Hit all four corners in your first dozen shots.',
        'Symmetry patterns: many players place ships in symmetric or aesthetically pleasing patterns. If you find a ship on the left side, mirror it on the right — there may be a matching ship.',
        'Pattern memory: in a series of games against the same opponent, remember where they placed ships in the previous game. Players tend to repeat preferred placements.',
      ],
    },
    {
      type: 'cta',
      href: '/games/sea-battle',
      text: 'Put these strategies to the test — play Sea Battle on Arcadeum',
      description:
        'Real-time Sea Battle against friends or AI. Practice the probability hunt and placement patterns from this guide.',
    },
    {
      type: 'cta',
      href: '/blog/sea-battle-best-strategies-and-placements',
      text: 'Also read: Sea Battle Placement Strategies',
      description:
        'A deeper look at specific fleet placement configurations and their statistical performance.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'TL;DR — the Sea Battle edge',
      id: 'tldr',
    },
    {
      type: 'list',
      items: [
        'Place ships near edges and spread them out — avoid the center, avoid clustering.',
        'Hunt with the checkerboard pattern; adapt the gap size to the smallest surviving ship.',
        'Once you have a hit: systematic destroy (test one axis, then the other) is faster than random adjacent shots.',
        'Track remaining ships by size and count deductively — especially in the endgame when few possibilities remain.',
        'Against human opponents: target corners and edges first; mirror any ships you find for symmetric opponents.',
      ],
    },
  ],
  faq: [
    {
      question: 'What is the optimal fleet placement?',
      answer:
        'There is no single "best" placement — the optimal placement depends on the opponent\'s hunting strategy. Against a probability-based hunter, edge and corner placements with maximum separation perform best. Against a pattern hunter, vary your placement each game.',
    },
    {
      question: 'Why is the checkerboard the best hunt pattern?',
      answer:
        'Because the smallest ship (2 squares) must span at least one checkerboard-colored square. A checkerboard pattern guarantees at least one hit on every ship of size 2 or more within roughly 50 shots. Any pattern with larger gaps misses smaller ships entirely.',
    },
    {
      question: 'Should I always shoot adjacent after a hit?',
      answer:
        'Yes, immediately. Switch from hunt mode to destroy mode on any hit. The destroy phase (identifying and sinking the hit ship) is more efficient than returning to hunt — the adjacent square probability is 25-50% after a hit, vs. 10-20% on a random hunt square.',
    },
    {
      question:
        'Does the ship orientation (horizontal vs. vertical) matter for placement?',
      answer:
        'Not in terms of probability — ships are equally likely to be hit regardless of orientation. It matters for opponent psychology: most players scan horizontally first, so a vertical placement near the edge takes longer to fully destroy once found.',
    },
  ],
};

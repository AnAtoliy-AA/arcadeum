import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-cat-dash',
  locale: 'en',
  title:
    'How to Play Cat Dash Online — Dice Racing, Cat Abilities, Track Tactics',
  excerpt:
    'A complete beginner-friendly guide to Cat Dash: the cat racing board game with dice, abilities, hazards, and strategic boosts.',
  publishedAt: '2026-08-25',
  author: 'Arcadeum team',
  tags: ['Cat Dash', 'Board Game', 'Racing', 'How to Play', 'Strategy'],
  readingTimeMinutes: 6,
  body: [
    {
      type: 'paragraph',
      text: "Cat Dash is a multiplayer racing board game where adorable cats race around a track using dice rolls, cat abilities, and strategic boosts. Dodge hazards like yarn traps and milk spills, grab tuna speed boosts, and use your cat's unique ability to outpace rivals. The first cat to cross the finish line wins. Simple to learn, fun to master.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Setup and movement',
      id: 'setup',
    },
    {
      type: 'paragraph',
      text: 'Each player selects a cat with a unique ability. All cats start at the starting line. On your turn, roll the dice to determine how many spaces your cat moves forward. Some track spaces have special effects — landing on them triggers the effect immediately.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Track spaces',
      id: 'spaces',
    },
    {
      type: 'list',
      items: [
        'Normal. Move the number shown on the dice. Nothing happens.',
        'Yarn trap. Your cat gets tangled and skips the next turn.',
        'Milk spill. Slip backward 1-2 spaces.',
        'Tuna boost. Gain extra movement (roll again or add bonus spaces).',
        "Ability tile. Activate your cat's special ability.",
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Cat abilities',
      id: 'abilities',
    },
    {
      type: 'paragraph',
      text: 'Each cat has a unique ability that triggers on ability tiles or at specific moments. Examples include: Pounce (skip ahead 3 spaces), Nap (immune to hazards for one turn), Curiosity (peek at upcoming tiles and choose to reroll), and Scratch (push an opponent back 1 space). Choose a cat whose ability matches your racing style.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Strategy',
      id: 'strategy',
    },
    {
      type: 'list',
      items: [
        'Time your boosts. Save speed boosts for straightaways or after recovering from a hazard. Wasting boosts on short segments is inefficient.',
        'Guide opponents into traps. Position your cat to block safe lanes and force rivals onto hazard tiles.',
        'Final lap sprint. Unleash all remaining stamina and power-ups on the final stretch to clinch victory.',
        'Track opponent positions. If a rival is ahead, use abilities to slow them. If behind, focus on your own speed.',
        'Hazard awareness. Remember which spaces are hazards on the track. Plan your dice rolls to avoid them when possible.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Common mistakes',
      id: 'mistakes',
    },
    {
      type: 'list',
      items: [
        'Using abilities at the wrong time. A well-timed ability beats a random one.',
        'Ignoring hazard spaces. Landing on traps costs turns and positions.',
        'Not saving boosts for the finish. The final lap is where races are won.',
        'Forgetting opponent abilities. Know what each cat can do to avoid surprises.',
      ],
    },
    {
      type: 'cta',
      href: '/games/cat-dash',
      text: 'Play Cat Dash online — free, in your browser',
      description:
        'Open a Cat Dash room, race friends or AI cats. Multiple track layouts and themes.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'TL;DR — the four habits that win races',
      id: 'tldr',
    },
    {
      type: 'list',
      items: [
        'Save speed boosts for straightaways and the final lap.',
        'Use cat abilities at the right moment, not randomly.',
        'Block safe lanes to force rivals onto hazard tiles.',
        'Track hazard positions and plan dice rolls accordingly.',
      ],
    },
    {
      type: 'paragraph',
      text: "Cat Dash rewards timing and positioning. The fastest cat isn't always the winner — the smartest one is.",
    },
  ],
  howTo: {
    totalTime: 'PT10M',
    steps: [
      {
        name: 'Roll dice and move',
        text: 'Roll the dice each turn. Move forward the number of spaces shown.',
        url: '#setup',
      },
      {
        name: 'Watch track spaces',
        text: 'Landing on special tiles triggers effects. Avoid hazards, grab boosts.',
        url: '#spaces',
      },
      {
        name: 'Use abilities wisely',
        text: 'Each cat has a unique ability. Time it for maximum impact.',
        url: '#abilities',
      },
      {
        name: 'Sprint the final lap',
        text: 'Save boosts and abilities for the last stretch to clinch the win.',
        url: '#strategy',
      },
    ],
  },
  faq: [
    {
      question: 'How do you move in Cat Dash?',
      answer:
        'Roll the dice each turn. Your cat moves forward the number of spaces shown on the dice.',
    },
    {
      question: 'What are hazard spaces?',
      answer:
        'Yarn traps skip your turn, milk spills push you backward. Landing on them costs valuable time.',
    },
    {
      question: 'How do cat abilities work?',
      answer:
        'Each cat has a unique ability triggered on ability tiles or specific moments. Examples: Pounce skips ahead, Nap blocks hazards.',
    },
  ],
};

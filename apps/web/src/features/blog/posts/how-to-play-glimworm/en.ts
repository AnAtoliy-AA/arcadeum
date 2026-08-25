import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-glimworm',
  locale: 'en',
  title: 'How to Play Glimworm Online — Glow Arena, Tactics, Survival',
  excerpt:
    'A complete beginner-friendly guide to Glimworm: the multiplayer snake arena where you eat light, leave lethal trails, and outmanoeuvre rivals in a neon battleground.',
  publishedAt: '2026-08-18',
  author: 'Arcadeum team',
  tags: ['Glimworm', 'Snake', 'Arcade', 'How to Play', 'Strategy'],
  readingTimeMinutes: 6,
  body: [
    {
      type: 'paragraph',
      text: "Glimworm is a real-time multiplayer snake arena game inspired by the classic Snake and slither.io. Up to 10 players compete in a glowing neon arena, consuming light orbs to grow longer while leaving lethal trails behind them. Collide head-first into another worm's body or the arena boundary and you are eliminated. The last worm glowing wins.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'The arena',
      id: 'arena',
    },
    {
      type: 'paragraph',
      text: 'The game takes place in a bounded arena filled with scattered light orbs and glowing particles. The arena has a visible boundary — crossing it eliminates you. The arena is dark except for the glow trails left by worms and the ambient light orbs.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Core mechanics',
      id: 'mechanics',
    },
    {
      type: 'list',
      items: [
        'Move. Your worm follows your cursor or finger continuously. Steering is smooth and responsive.',
        'Eat light orbs. Consuming ambient light particles extends your length and increases your score.',
        'Leave trails. Your worm leaves a glowing trail behind it. Other worms that collide with your trail are eliminated.',
        'Speed boost. Sacrifice trail mass to accelerate temporarily. Use it to intercept, escape, or cut off opponents.',
        "Collision. Head-first into another worm's body = death. Head-on collision = both die. Hitting the boundary = death.",
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Tactics',
      id: 'tactics',
    },
    {
      type: 'list',
      items: [
        'Coil trap. Once you are long enough, encircle a smaller opponent gradually. Shrink the circle until they have nowhere to turn.',
        'Intercept with boost. Sprint ahead of a parallel worm and sharply turn across their trajectory to force a head-on collision.',
        'Perimeter farming. Stay near the edges early to collect energy safely before venturing into the chaotic centre.',
        'Bait with your trail. Leave an apparent gap in your trail to lure opponents in, then close the gap with a sharp turn.',
        'Target the dying. When a worm is eliminated, it bursts into concentrated light particles. Move quickly to consume them before rivals.',
      ],
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
        'Early game: grow safely. Stay near the perimeter, collect orbs, avoid confrontations. Size is your armour.',
        'Mid game: pick fights. Use your length to trap smaller worms. Avoid head-on collisions with larger worms.',
        'End game: play aggressively. With fewer opponents, the arena opens up. Use boost to chase down survivors.',
        "Manage your boost. Boost is a limited resource tied to your trail mass. Don't waste it on pursuits you cannot finish.",
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
        'Rushing to the centre too early. The centre is chaotic and dangerous when you are small.',
        'Overusing boost. Burning trail mass for weak pursuit leaves you small and vulnerable.',
        'Ignoring the boundary. The arena edge is lethal. Always know where the wall is.',
        'Chasing larger worms. Head-on collisions with bigger worms usually end badly.',
      ],
    },
    {
      type: 'cta',
      href: '/games/glimworm',
      text: 'Play Glimworm online — free, in your browser',
      description:
        'Join a glow arena, compete against friends or AI. Zero downloads, instant play.',
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
        'Grow safely near the perimeter before engaging.',
        'Use coil traps to encircle smaller opponents.',
        'Save speed boost for intercepts, not random pursuits.',
        'Consume elimination bursts before rivals do.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Glimworm rewards spatial awareness and patience. Grow smart, trap often, and use boost strategically.',
    },
  ],
  howTo: {
    totalTime: 'PT10M',
    steps: [
      {
        name: 'Collect orbs safely',
        text: 'Stay near the perimeter early to grow without risk. Size is your best defence.',
        url: '#strategy',
      },
      {
        name: 'Learn to coil',
        text: 'Use your length to encircle smaller opponents. Close the circle gradually until they cannot escape.',
        url: '#tactics',
      },
      {
        name: 'Master the boost',
        text: 'Sacrifice trail mass to sprint. Use it for intercepts and escapes, not random chases.',
        url: '#mechanics',
      },
      {
        name: 'Avoid head-on collisions',
        text: 'Never steer directly toward a larger worm. Use parallel movement and sharp turns instead.',
        url: '#tactics',
      },
    ],
  },
  faq: [
    {
      question: 'What causes elimination in Glimworm?',
      answer:
        "You are eliminated if you collide head-first into another worm's body, hit the arena boundary, or collide head-on with another worm.",
    },
    {
      question: 'How does speed boost work?',
      answer:
        'Activate boost to sacrifice trail mass and accelerate. You move faster but shrink. Use it for short bursts to intercept or escape.',
    },
    {
      question: 'What happens when a worm is eliminated?',
      answer:
        'It bursts into concentrated light particles that any nearby worm can consume for a significant growth boost.',
    },
  ],
};

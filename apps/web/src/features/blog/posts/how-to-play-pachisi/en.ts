import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-pachisi',
  locale: 'en',
  title: 'How to Play Pachisi (Ludo) Online — Rules, Captures, Strategy',
  excerpt:
    'A complete beginner-friendly guide to Pachisi and Ludo: the cross-and-circle race game with dice, captures, safe squares, and tactical blocking.',
  publishedAt: '2026-07-07',
  author: 'Arcadeum team',
  tags: ['Pachisi', 'Ludo', 'How to Play', 'Strategy', 'Board Game'],
  readingTimeMinutes: 6,
  body: [
    {
      type: 'paragraph',
      text: 'Pachisi — known internationally as Ludo — is a classic cross-and-circle board game for 2-4 players. Each player races four tokens from their home base around the board and into their home column. Roll dice, capture opponents, block paths, and be the first to bring all four tokens home. The rules are simple enough for children, but the dice luck is balanced by genuine tactical decisions.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Setup and movement',
      id: 'setup',
    },
    {
      type: 'paragraph',
      text: 'Each player starts with four tokens in their home base. Tokens enter the track on a specific entry square. On your turn, roll a single die and move one token clockwise the number of spaces shown. You must roll a specific number (usually 6, or any number in some variants) to enter a token from the home base onto the track.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Capturing',
      id: 'captures',
    },
    {
      type: 'paragraph',
      text: "If your token lands on a square occupied by an opponent's token, the opponent's token is captured and sent back to their home base. They must re-enter from the start. Capturing often gives you an extra roll (bonus turn). The threat of capture shapes every decision.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Safe squares and home column',
      id: 'safe',
    },
    {
      type: 'paragraph',
      text: 'Certain squares are marked as safe (often starred or coloured). Tokens on safe squares cannot be captured. Each player has a home column — a final stretch of squares leading into the finish. Only your tokens can enter your home column. You must roll the exact number to land on the final home square.',
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
        "Spread your tokens. Don't stack all four on one square. Spread them around the track to maintain flexibility and reduce the risk of losing everything to one capture.",
        'Use safe squares. Park tokens on safe squares when possible. They serve as resting points and staging areas.',
        "Capture when it gains tempo. Capturing gives you an extra roll and sets the opponent back. But don't chase captures recklessly — the dice might not cooperate.",
        'Prioritise getting tokens home. As the game progresses, focus on bringing tokens into the home column. A token in the home column is safe and counts toward victory.',
        'Block opponents. If you have two tokens on the same square, opponents cannot pass. Create blockades on key paths, especially near opponent entry points.',
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
        'Stacking all tokens. One lucky capture from an opponent wipes you out.',
        'Chasing captures too aggressively. If you roll badly after a capture, your token is exposed.',
        'Ignoring the home column. Tokens stuck on the track are vulnerable. Get them home.',
        'Forgetting the exact roll requirement. You need the exact number to finish — plan for it.',
      ],
    },
    {
      type: 'cta',
      href: '/games/pachisi',
      text: 'Play Pachisi online — free, in your browser',
      description:
        'Open a Pachisi room, race friends or AI. Classic rules with multiple board themes.',
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
        "Spread tokens around the track — don't stack them.",
        'Use safe squares as resting points.',
        "Capture for tempo but don't chase recklessly.",
        'Prioritise bringing tokens home as the game progresses.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Pachisi rewards a balance of risk management and tactical positioning. The dice add luck, but the player who manages tokens smarter wins more often.',
    },
  ],
  howTo: {
    totalTime: 'PT15M',
    steps: [
      {
        name: 'Enter tokens on a specific roll',
        text: 'Roll the required number to move a token from home base onto the track.',
        url: '#setup',
      },
      {
        name: 'Move and capture',
        text: 'Roll dice, move tokens clockwise. Landing on an opponent captures them.',
        url: '#captures',
      },
      {
        name: 'Use safe squares',
        text: 'Park tokens on safe squares to avoid capture. They cannot be touched there.',
        url: '#safe',
      },
      {
        name: 'Get tokens home',
        text: 'Enter your home column and roll the exact number to finish. First to bring all four home wins.',
        url: '#strategy',
      },
    ],
  },
  faq: [
    {
      question: 'How do you enter tokens onto the board?',
      answer:
        'Roll a specific number (usually 6) to move a token from your home base onto the starting square of the track.',
    },
    {
      question: 'What happens when you capture an opponent?',
      answer:
        "The opponent's token returns to their home base. You typically get an extra roll as a bonus.",
    },
    {
      question: 'Can tokens on safe squares be captured?',
      answer:
        'No. Tokens on safe squares are immune to capture. Use them as resting points.',
    },
    {
      question: 'How do you win?',
      answer:
        'Be the first player to move all four tokens around the board and into the home column, landing on the exact final square.',
    },
  ],
};

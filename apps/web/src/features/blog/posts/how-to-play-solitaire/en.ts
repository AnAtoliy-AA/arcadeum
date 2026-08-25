import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-solitaire',
  locale: 'en',
  title: 'How to Play Solitaire (Klondike) Online — Rules, Strategy, Win Tips',
  excerpt:
    'A complete guide to Klondike Solitaire: layout, allowed moves, foundation strategy, and the habits that turn unwinnable deals into wins.',
  publishedAt: '2026-07-28',
  author: 'Arcadeum team',
  tags: ['Solitaire', 'Klondike', 'Card Game', 'How to Play', 'Puzzle'],
  readingTimeMinutes: 6,
  body: [
    {
      type: 'paragraph',
      text: "Klondike Solitaire is the world's most played patience game — a single-player card challenge where you sort 52 cards into four foundation piles by suit, ascending from Ace to King. The rules are easy to learn, but the strategy is what separates a casual player from someone who wins consistently. This guide covers the layout, allowed moves, and the thinking habits that raise your win rate.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Layout',
      id: 'layout',
    },
    {
      type: 'paragraph',
      text: 'The game starts with 28 cards dealt into seven tableau columns: column 1 gets 1 card, column 2 gets 2, up to column 7 with 7 cards. Only the top card of each column is face-up. The remaining 24 cards form the stock (draw pile). Four empty foundation piles sit at the top, one per suit (♠ ♥ ♦ ♣), where you build from Ace to King.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Allowed moves',
      id: 'moves',
    },
    {
      type: 'paragraph',
      text: 'Tableau: you may move a face-up card (or a face-up sequence) onto another face-up card that is one rank higher and of the opposite colour (e.g. a black 7 onto a red 8). Moving a face-up card reveals the card beneath it. Only a King (or a King-led sequence) may fill an empty column.',
    },
    {
      type: 'paragraph',
      text: 'Foundation: a card may be moved to the foundation if it is the next card in suit and rank (Ace first, then 2, 3, up to King). You can move cards back from foundation to tableau if needed for strategy.',
    },
    {
      type: 'paragraph',
      text: 'Stock: when no tableau moves are available, flip cards from the stock to the waste pile. In draw-1 mode (easier), one card flips at a time. In draw-3 mode (harder), three cards flip and only the top waste card is playable, cycling through the stock.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Winning truth',
      id: 'winning',
    },
    {
      type: 'paragraph',
      text: 'A large percentage of Klondike deals are unwinnable — estimates range from 20% to 40% winnable depending on draw mode. Skilled play meaningfully raises your win rate above a random player, but recognizing when a deal is dead and restarting quickly is also part of efficient play.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Strategy — the habits that raise your win rate',
      id: 'strategy',
    },
    {
      type: 'list',
      items: [
        'Always prefer the move that reveals a face-down card. Every face-down card you flip is information — and often opens new moves.',
        'Work on the deepest pile first. The column with the most face-down cards is your bottleneck. Prioritise uncovering it.',
        "Don't rush cards to foundations. Aces and twos are almost always safe to send up. But holding mid-rank cards (like a 5 or 6) in the tableau can be useful as a buffer for building sequences. Ask: does this card still help in the tableau before sending it up?",
        "Choose the right King. When you have an empty column, don't just grab any King — pick the one whose colour best balances your hidden cards. A red King over a column with mostly black face-down cards gives the best odds of making future moves.",
        'In draw-3, remember the cycle. The stock cycles through the same cards. If you know a useful card is three flips away, plan your tableau moves to coincide with that flip.',
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
        'Making every available move reflexively. Not every move is good — sometimes the best play is to hold.',
        'Burying needed ranks under Kings. Before placing a King on an empty column, check whether the cards beneath it are needed elsewhere.',
        'Ignoring face-down cards. If you have a choice between two moves that both look equal, pick the one that reveals a hidden card.',
        'Giving up too early. Some deals look dead but have a narrow winning line. Try a few more moves before restarting.',
      ],
    },
    {
      type: 'cta',
      href: '/games/solitaire',
      text: 'Play Solitaire online — free, in your browser',
      description:
        'Classic Klondike Solitaire with draw-1 and draw-3 modes. Track your win rate and beat your best time.',
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
        'Always prefer the move that reveals a face-down card.',
        'Work on the deepest (longest) pile first.',
        "Don't rush mid-rank cards to foundations — hold them as buffer.",
        'Choose Kings that balance your hidden cards, not the first available King.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Solitaire rewards patience and the discipline to resist making every available move. The best players know when to act and when to wait. Track your wins, recognise dead deals early, and practice the habits above to consistently improve.',
    },
  ],
  howTo: {
    totalTime: 'PT15M',
    steps: [
      {
        name: 'Reveal face-down cards',
        text: 'Every move should prioritise flipping a face-down card. Hidden cards are your biggest obstacle — reveal them first.',
        url: '#strategy',
      },
      {
        name: 'Work the deepest pile',
        text: 'Identify the column with the most face-down cards and focus on uncovering it. The deepest pile is always your bottleneck.',
        url: '#strategy',
      },
      {
        name: 'Hold mid-rank cards in tableau',
        text: "Don't auto-send 5s, 6s, or 7s to the foundation. They may be needed as a base for building sequences in the tableau.",
        url: '#strategy',
      },
      {
        name: 'Pick the right King',
        text: 'When an empty column opens, choose the King whose colour best balances the face-down cards beneath it.',
        url: '#strategy',
      },
    ],
  },
};

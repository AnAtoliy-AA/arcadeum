import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-cascade',
  locale: 'en',
  title: 'How to Play Cascade Online — Rules, Action Chains, Strategy',
  excerpt:
    'A complete beginner-friendly guide to Cascade: the UNO-style card shedding game with action chains, draw penalties, and combo strategy.',
  publishedAt: '2026-08-11',
  author: 'Arcadeum team',
  tags: ['Cascade', 'Card Game', 'How to Play', 'Strategy'],
  readingTimeMinutes: 6,
  body: [
    {
      type: 'paragraph',
      text: 'Cascade is a fast-paced multiplayer card shedding game where the goal is to be the first to play all your cards. Think of it as UNO with strategic depth — you match cards by colour or number, play action cards to inflict draw penalties on opponents, and chain counter-attacks to redirect the burden. The rules are easy, but the combo strategy and hand management make every round tense.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Setup',
      id: 'setup',
    },
    {
      type: 'paragraph',
      text: 'Each player is dealt a hand of cards (typically 7). The remaining cards form the draw pile. The top card is flipped to start the discard pile. Play proceeds clockwise.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'How turns work',
      id: 'turns',
    },
    {
      type: 'paragraph',
      text: 'On your turn, play a card that matches the top of the discard pile by colour, number, or symbol. If you cannot match, draw one card from the draw pile. If the drawn card can be played, you may play it immediately. Wild cards can be played on any card.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Action cards and chains',
      id: 'actions',
    },
    {
      type: 'list',
      items: [
        '+2 (Draw Two). The next player must draw 2 cards and lose their turn. Can be countered by playing another +2 on top, stacking the penalty.',
        '+4 Wild. Play on any card, choose the next colour, and the next player draws 4. Counter with another +4.',
        'Skip. The next player loses their turn.',
        'Reverse. Reverses play direction. In 2-player mode, acts as a Skip.',
        'Wild. Changes the active colour. No penalty but powerful for hand management.',
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
        'Track colours in hand. Aim for flexibility — if you have 4 colours, you can match almost anything. If you have 1-2 colours, you are vulnerable to blocks.',
        "Save Wilds for emergencies. Don't waste a Wild when you have a matching card. Hold it for when you are forced into an unfavourable colour.",
        'Count opponent cards. When an opponent is close to winning (1-2 cards left), shift the active colour to one they are weak in.',
        'Chain draw penalties. If an opponent plays +2, counter with your own +2 to redirect the draw burden. The player who cannot counter draws everything.',
        'Manage your hand size. Shed high-value combinations first. Keep action cards for later rounds when opponents have fewer defences.',
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
        'Playing Wilds too early. You lose flexibility when you need it most.',
        "Ignoring the opponent's hand. If someone has 1 card, every move should try to block them.",
        'Not chaining penalties. Failing to counter a +2 or +4 means you absorb the full draw.',
        'Forgetting the direction. In larger games, reverse cards change who plays next — track it.',
      ],
    },
    {
      type: 'cta',
      href: '/games/cascade',
      text: 'Play Cascade online — free, in your browser',
      description:
        'Open a Cascade room, share the link with friends, or play against AI. Fast rounds, strategic depth.',
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
        'Keep colour flexibility in your hand — diversify.',
        'Save Wilds for emergencies, not convenience.',
        'Chain draw penalties (+2, +4) to redirect burden to opponents.',
        'Track opponent card counts and block the leader.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Cascade rewards hand management and reading opponents. The player who keeps flexibility and chains penalties effectively will shed cards fastest.',
    },
  ],
  howTo: {
    totalTime: 'PT10M',
    steps: [
      {
        name: 'Match by colour or number',
        text: 'Play a card matching the top discard pile by colour, number, or symbol. If you cannot match, draw one.',
        url: '#turns',
      },
      {
        name: 'Chain draw penalties',
        text: 'Counter +2 with +2, counter +4 with +4. The player who cannot counter draws the total.',
        url: '#actions',
      },
      {
        name: 'Save Wilds',
        text: "Hold Wild and +4 cards for emergencies. Don't waste them when you have a matching card.",
        url: '#strategy',
      },
      {
        name: 'Block the leader',
        text: 'When an opponent has 1-2 cards, shift colour to one they are weak in.',
        url: '#strategy',
      },
    ],
  },
  faq: [
    {
      question: 'What happens if you cannot play a card?',
      answer:
        'Draw one card from the draw pile. If the drawn card can be played immediately, you may play it. Otherwise, your turn ends.',
    },
    {
      question: 'Can you stack +2 cards?',
      answer:
        'Yes. If an opponent plays +2, you can play your own +2 to redirect the penalty. The next player must then draw 4 or counter with another +2.',
    },
    {
      question: 'What does a Reverse card do?',
      answer:
        'Reverses the direction of play. In 2-player mode, it acts as a Skip — the other player loses their turn.',
    },
  ],
};

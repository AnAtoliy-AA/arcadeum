import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-hearts',
  locale: 'en',
  title:
    'How to Play Hearts Online — Rules, Queen of Spades, Shooting the Moon',
  excerpt:
    'A complete beginner-friendly guide to Hearts: trick-avoidance rules, passing strategy, Queen of Spades tactics, and how to shoot the moon without getting caught.',
  publishedAt: '2026-07-14',
  author: 'Arcadeum team',
  tags: ['Hearts', 'Card Game', 'How to Play', 'Strategy', 'Trick-Taking'],
  readingTimeMinutes: 7,
  body: [
    {
      type: 'paragraph',
      text: 'Hearts is a classic trick-avoidance card game for four players. The goal is simple: avoid winning tricks that contain hearts (1 point each) and the Queen of Spades (13 points). The player with the lowest score when someone reaches 100 points wins. But beneath the simple objective lies a tense game of reading opponents, voiding suits, and deciding whether to shoot the moon — take all the points yourself to force 26 points onto every other player instead.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Setup and dealing',
      id: 'setup',
    },
    {
      type: 'paragraph',
      text: 'A standard 52-card deck is dealt so that all 13 cards go to each of the four players. There is no trump suit. Players sit in fixed partnerships around the table (though Hearts is not a partnership game — everyone plays for themselves). The 2 of Clubs is dealt to the player who leads the first trick.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Passing cards',
      id: 'passing',
    },
    {
      type: 'paragraph',
      text: 'Before each hand, players pass three cards to another player. The passing direction rotates: left, right, across, then no pass (hold). Pass your highest cards in suits you want to void, but be careful — passing the Queen of Spades or high hearts is risky because you might get them back. A common tactic is to pass low cards in a suit you already have few of, creating a void you can use to dump hearts or the Queen later.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'How tricks work',
      id: 'tricks',
    },
    {
      type: 'paragraph',
      text: 'The player holding the 2 of Clubs leads the first trick. Players must follow suit if possible; if not, they may play any card. The highest card in the led suit wins the trick — there is no trump. Hearts cannot be led until they have been "broken" (played on a trick when a player could not follow suit). The trick winner leads the next trick.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Scoring',
      id: 'scoring',
    },
    {
      type: 'paragraph',
      text: 'Each heart won in a trick = 1 point. The Queen of Spades = 13 points. No points can be won on the very first trick (cards played on trick one are safe). When hearts are broken, the winner of the trick collects all hearts and the Queen if present.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Shooting the moon',
      id: 'moon',
    },
    {
      type: 'paragraph',
      text: 'If you collect ALL 13 hearts AND the Queen of Spades in one hand (26 total points), you shoot the moon — instead of gaining 26 points yourself, every other player receives 26 points. This is high-risk, high-reward. If even one heart or the Queen escapes to another player, you take the full 26. Shooting the moon requires carefully timed high cards, strong voids, and confidence that opponents cannot block you by winning a single heart.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Core strategy',
      id: 'strategy',
    },
    {
      type: 'list',
      items: [
        'Void creation. Pass cards to create a suit you have zero of. When that suit is led, you can dump hearts or the Queen of Spades. Voids are the single most powerful tool in Hearts.',
        'Low-card safety. Keep low cards in every suit. When you cannot follow suit, playing low hearts minimizes the damage. Avoid holding high hearts early.',
        "Queen of Spades awareness. Always track whether the Queen has been played. If it hasn't, be cautious about leading spades or playing high spades. The Queen's owner takes a massive 13-point hit.",
        'Breaking hearts early. If you have the Ace or King of Hearts, consider playing it early to break hearts before opponents can dump high cards on you.',
        'Reading opponents. Pay attention to what cards are passed, what suits players void, and what cards appear in early tricks. This tells you who likely holds the Queen and where the danger lies.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Tactical tips',
      id: 'tactics',
    },
    {
      type: 'list',
      items: [
        'Duck the first trick. If you have the 2 of Clubs, lead it low. The first trick cannot score, so dump your highest Club.',
        'Watch for shooters. If a player takes the Ace of Spades and then leads high hearts, they may be shooting the moon. Block them by winning one heart.',
        "Endgame math. When only a few tricks remain, count points. Sometimes it's better to take a few hearts than risk the Queen appearing later.",
        "Don't hold the Queen too long. The longer you hold the Queen of Spades, the more likely someone will lead spades and force you to play it.",
      ],
    },
    {
      type: 'cta',
      href: '/games/hearts',
      text: 'Play Hearts online — free, in your browser',
      description:
        'Open a Hearts room, share the link with friends, or play against AI bots. Classic rules with passing and shooting the moon.',
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
        'Void a suit early by passing — it gives you a way to dump high hearts and the Queen.',
        'Track the Queen of Spades and every heart played — know where the points are.',
        'Keep low cards and avoid leading hearts until you are ready to shoot the moon.',
        'Block moon-shooters by winning a single heart when they try to collect everything.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Hearts is a game where information is everything. Every card played tells a story, and the player who reads the most stories wins the most games. Practice tracking suits, master the art of voiding, and know when to take the risk of shooting the moon.',
    },
  ],
  howTo: {
    totalTime: 'PT20M',
    steps: [
      {
        name: 'Void a suit early',
        text: 'Pass three cards in a suit you want to eliminate. A void lets you dump hearts or the Queen of Spades when that suit is led.',
        url: '#passing',
      },
      {
        name: 'Track the Queen of Spades',
        text: 'Always note whether the Queen has appeared. If not, avoid leading spades or playing high spades — the 13-point penalty is devastating.',
        url: '#scoring',
      },
      {
        name: 'Keep low cards',
        text: 'Hold low cards in every suit. When you cannot follow suit, playing low hearts minimizes damage. High hearts are liabilities.',
        url: '#strategy',
      },
      {
        name: 'Block moon-shooters',
        text: 'If a player is collecting all hearts, win just one heart to stop them. The 26-point penalty goes to them instead.',
        url: '#moon',
      },
    ],
  },
};

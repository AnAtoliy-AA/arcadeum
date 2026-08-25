import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-spades',
  locale: 'en',
  title: 'How to Play Spades Online — Rules, Bidding, Nil, and Strategy',
  excerpt:
    'A complete beginner-friendly guide to Spades: partnerships and the deal, bidding including Nil, trick-taking rules, scoring with bags, and the partnership habits that win races to 500 points.',
  publishedAt: '2026-07-21',
  author: 'Arcadeum team',
  tags: ['Spades', 'Card Game', 'How to Play', 'Strategy'],
  readingTimeMinutes: 8,
  body: [
    {
      type: 'paragraph',
      text: 'Spades is the most popular partnership trick-taking game in the world: four players, two fixed partnerships sitting across from each other, and a standard 52-card deck dealt 13 cards at a time. Unlike Whist or Bridge there is no auction to pick a trump suit — spades are always trump, and the entire game revolves around one question: how many tricks can you and your partner honestly promise to take? You can learn the rules in ten minutes, yet the bidding, the bag penalties, and the Nil contract give the game surprising depth. This guide covers the setup and the deal, bidding including Nil, the trick-play rules, the scoring system, and the partnership habits that turn careful bids into wins — all framed for playing Spades online.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Teams, the deal, and the goal',
      id: 'teams',
    },
    {
      type: 'paragraph',
      text: "Spades is played by four people in fixed partnerships, with partners sitting opposite each other. A standard 52-card deck is divided evenly — 13 cards per player, usually one at a time, starting with the player to the dealer's left. Cards rank from high to low: A K Q J 10 … 2, and the ace of spades is the strongest card in the game. Every hand stands on its own: all 13 tricks are played, the deal rotates clockwise, and the first partnership to reach the target score — typically 500 points — wins the match.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Bidding: the contract your team must make',
      id: 'bidding',
    },
    {
      type: 'paragraph',
      text: "After looking at their 13 cards, each player states a bid: the NUMBER of tricks they expect to WIN this hand — not points. There is no raising and no auction; everyone bids exactly once, in rotation. In most rules the minimum bid is 1, so you cannot bid zero except through the special Nil contract described below. Your bid and your partner's are added together to form the partnership contract. If you bid 3 and your partner bids 4, your team must win at least 7 tricks between you — winning more is possible but not free (see bags), and winning fewer loses points.",
    },
    {
      type: 'heading',
      level: 3,
      text: 'Nil: the bid of zero tricks',
      id: 'nil',
    },
    {
      type: 'paragraph',
      text: "Nil is the signature gamble of Spades: a player who bids Nil promises to win ZERO tricks this hand. The Nil bid does not count toward the team's trick contract — it sits on top of it. A successful Nil earns the partnership a flat +100, while catching even a single trick sinks it for −100 instead. Meanwhile the Nil bidder's partner keeps playing out their own bid normally, which often means fighting two battles at once: covering the Nil while still making their own contract.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Trick play: following suit and the broken-spades rule',
      id: 'trick-play',
    },
    {
      type: 'paragraph',
      text: 'The player to the dealer\'s left leads the first card. They may lead any suit except spades — spades cannot be LED until they are "broken": someone discards a spade onto another suit\'s trick because they hold no cards of the led suit. Only a leader who holds nothing but spades may open with one.',
    },
    {
      type: 'list',
      items: [
        'Follow suit if you can. If a heart is led and you hold hearts, you must play one.',
        'If you are void in the led suit, you may play anything — including a spade, which is also how spades get broken.',
        'The highest card of the led suit wins the trick — unless any spade was played, in which case the highest spade wins.',
        'The winner collects the trick, sets it aside face down, and leads to the next one. Thirteen tricks are played each hand, and every one counts: contracts, bags, and Nils are all settled at the end.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Scoring: contracts, bags, and penalties',
      id: 'scoring',
    },
    {
      type: 'list',
      items: [
        'Make the combined contract: the partnership scores 10 points per bid trick — a team bid of 7 scores 70.',
        'Every overtrick (a trick beyond the contract) is worth 1 point and is called a bag.',
        'Ten accumulated bags deduct 100 points — padding your total by underbidding eventually backfires.',
        'Fail the contract (win fewer tricks than the combined bid): lose 10×bid no matter how close you came — a bid of 7 missed by one trick still scores −70.',
        'Nil succeeds: +100 for the partnership. Nil fails (the bidder takes a trick): −100.',
        'The game is typically played to 500 points; if both partnerships pass 500 on the same hand, the higher total wins.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Partnership strategy: bidding and playing as a unit',
      id: 'strategy',
    },
    {
      type: 'paragraph',
      text: 'Spades is a conversation between partners conducted entirely through cards and bids. The habits below separate steady winners from hopeful gamblers:',
    },
    {
      type: 'list',
      items: [
        'Bid realistically, not hopefully. Your bid is a promise the whole team pays for; count the tricks you can actually defend, not the ones you wish for.',
        'Count trumps. Plenty of spades justify aggressive bidding — the power to draw trumps and control tricks is the engine of a big contract.',
        'Lead suits your partner is likely void in. Feeding them ruffs manufactures tricks for the joint contract without spending your high cards.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Timing matters as much as raw card power:',
    },
    {
      type: 'list',
      items: [
        'Save high spades to pull trumps. When opponents run out of cards in the side suits they must ruff — drawing their trumps early keeps your winners alive.',
        'Manage bags deliberately. Sometimes taking one extra bag is cheaper than risking the contract; sometimes conceding a trick you could win protects the bigger prize.',
        'In the late game, calculate exactly. Know both totals before the last few hands and bid to cross the finish first, not merely to score.',
      ],
    },
    {
      type: 'paragraph',
      text: 'And steer clear of the classic blunders:',
    },
    {
      type: 'list',
      items: [
        'Bidding hope instead of hand strength — the most expensive habit in the game.',
        'Forgetting the bag penalty right up until the tenth bag lands.',
        "Breaking your partner's Nil with careless middle-card leads.",
        "Cashing winners too early, turning the opponents' losers into tricks instead of discards.",
      ],
    },
    {
      type: 'cta',
      href: '/games/spades',
      text: 'Play Spades online — free, in your browser',
      description:
        'Deal up in seconds, invite a friend with a link, or practice against AI bots — no download, no account required.',
    },
    {
      type: 'cta',
      href: '/games/hearts',
      text: 'In the mood for another classic? Play Hearts online',
      description:
        'The other great trick-taking tradition: same deck, inverted goal — dodge everything.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'TL;DR — the habits that win at Spades',
      id: 'tldr',
    },
    {
      type: 'list',
      items: [
        'Bid realistically: state the tricks you can actually win, then make your contract for 10×bid',
        'Respect the rules: spades always trump, follow suit when you can, and never lead spades before they are broken',
        'Watch the bags: overtricks pay 1 point each, but ten bags cost you 100',
        "Use Nil deliberately: zero tricks means +100, one caught trick means −100 — protect a partner's Nil at all costs",
        'Count trumps, feed your partner ruffs, and time your high spades to pull trumps',
        'Play to 500: calculate exact scores late and bid to finish first',
      ],
    },
    {
      type: 'paragraph',
      text: 'Spades rewards exactly these habits: honest bids, disciplined bag accounting, protective play around Nil, and patient trump management. None of it takes talent — only attention. Play a few hands on Arcadeum, watch how strong partnerships bid together, and the scoreboard starts leaning your way within a single evening.',
    },
  ],
  howTo: {
    totalTime: 'PT25M',
    steps: [
      {
        name: 'Bid realistically: state the tricks you can actually win, then make your contract for 10×bid',
        text: "Each player bids once, stating the number of tricks they expect to win — minimum 1 in most rules. Your bid plus your partner's forms the team contract; making it scores 10 points per bid trick.",
        url: '#bidding',
      },
      {
        name: 'Respect the rules: spades always trump, follow suit when you can, and never lead spades before they are broken',
        text: 'The player left of the dealer leads any non-spade card. Follow suit if possible; otherwise play anything, including a spade. The highest card of the led suit wins unless a spade was played — then the highest spade takes the trick.',
        url: '#trick-play',
      },
      {
        name: 'Watch the bags: overtricks pay 1 point each, but ten bags cost you 100',
        text: 'Every trick won beyond the contract is a bag worth 1 point. Bags accumulate across hands, and the tenth deducts 100 points, so chronic underbidding eventually costs more than it protects.',
        url: '#scoring',
      },
      {
        name: "Use Nil deliberately: zero tricks means +100, one caught trick means −100 — protect a partner's Nil at all costs",
        text: 'Nil is a bid to win no tricks at all: it scores a flat +100 when it survives and −100 when the bidder catches anything. Partners cover a Nil by winning the tricks the bidder would otherwise be forced to take.',
        url: '#nil',
      },
      {
        name: 'Count trumps, feed your partner ruffs, and time your high spades to pull trumps',
        text: 'Trump counting tells you whether an aggressive bid can hold. Leading suits your partner is void in builds tricks without spending honors, and saving high spades to draw opposing trumps keeps your winners alive.',
        url: '#strategy',
      },
      {
        name: 'Play to 500: calculate exact scores late and bid to finish first',
        text: 'The first partnership to reach 500 points wins. In the endgame, track both totals before every hand and choose bids that cross the finish line ahead of your opponents instead of simply maximizing one deal.',
        url: '#scoring',
      },
    ],
  },
};

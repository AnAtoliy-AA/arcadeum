import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-win-spades',
  locale: 'en',
  title:
    'How to Win at Spades — Advanced Bidding, Nils, Sandbagging, and Partner Play',
  excerpt:
    'Beyond the basics: how to read your hand, bid precisely, execute nil bids, avoid sandbag penalties, and signal your partner — the strategies that win consistently at Spades.',
  publishedAt: '2026-09-17',
  author: 'Arcadeum team',
  tags: ['Spades', 'Card Game', 'Strategy', 'Bidding', 'Advanced'],
  readingTimeMinutes: 11,
  body: [
    {
      type: 'paragraph',
      text: 'Spades is a partnership trick-taking game where the real skill lies in the bidding — before a card is played. A team that bids precisely, avoids sandbag accumulation, and executes high-risk nils will beat a team that plays cards well but bids carelessly, almost every time. This guide is for players who already know the rules and want the strategies that separate good Spades players from great ones.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'How to evaluate your hand before bidding',
      id: 'hand-evaluation',
    },
    {
      type: 'paragraph',
      text: 'Every bid starts with an honest assessment of your 13 cards. Do not count winners — count tricks you expect to take. There is a difference.',
    },
    {
      type: 'list',
      items: [
        'High spades (Ace through King) = almost certain tricks. Ace of Spades is 1 guaranteed trick. King of Spades is ~0.9 tricks (loses to Ace only if led into). Queen of Spades with the King sitting above it = ~0.7 tricks.',
        'Long spades suit = extra tricks. Six spades in hand means the high cards are gone after 3-4 rounds — your low spades become winners by length.',
        'Voids = extra tricks. A void in a non-spade suit means you can ruff (play a spade) when that suit is led, converting low spades into tricks.',
        'Short suits (singletons, doubletons) = ruffing potential. Count a singleton as approximately 0.5 extra tricks in a balanced hand.',
        'Aces and kings in side suits = guaranteed tricks only if spades have already been drawn. Otherwise they can be ruffed.',
      ],
    },
    {
      type: 'stat-card',
      title: 'Bidding rule of thumb',
      stats: [
        { value: 'Ace', label: '1.0 tricks', description: 'Guaranteed' },
        {
          value: 'King',
          label: '0.85 tricks',
          description: 'Protected by partner',
        },
        { value: 'Void', label: '+0.5 tricks', description: 'Per void suit' },
        { value: '10+', label: 'Sandbag risk', description: 'Bags hit at 10' },
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: "Partnership bidding — what your partner's bid tells you",
      id: 'partnership-bidding',
    },
    {
      type: 'paragraph',
      text: 'In Spades, your bid is a promise to your partner. When your partner bids 4, they are saying they have 4 likely tricks — not that they might get 4. This changes how you evaluate your own hand. If partner bids high (5+), they likely have a long spade suit or multiple aces — your hand should aim to cover the remaining tricks without over-bidding. If partner bids low (1-2), they have a weak hand — you may need to carry the team.',
    },
    {
      type: 'list',
      items: [
        'Target bid: your partnership should aim for bids that total 10-11 tricks per hand. Going over means bags; going under means set.',
        "Never auto-match partner's weakness. If partner bids 1 and you have 4 solid tricks, bid 4 — the combination (5) is safe. Do not bid 3 just because partner is weak.",
        'Agree on a convention: some partnerships always bid aggressively; others conservatively. Consistency is more important than which style you choose.',
        "Watch the opponent team's bids. If opponents bid a combined 8, the distribution is tight — one of them is under-estimating. Look for the weakness.",
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Sandbagging — the slow death of a Spades game',
      id: 'sandbagging',
    },
    {
      type: 'paragraph',
      text: 'Every trick taken above your bid is a bag. Ten bags in a game costs you 100 points — often the difference between winning and losing. Strong players manage bags actively; weak players ignore them until it is too late.',
    },
    {
      type: 'list',
      items: [
        'Bid precisely, not conservatively. The instinct to "bid low to be safe" creates bags. Accurately count your tricks — bid exactly what you expect to win.',
        'The Duck technique: when you have already made your bid, deliberately lose tricks you could win. Play a lower card when you know the winner is already decided.',
        'Read the bag count at all times. If your team has 7 bags and four tricks remain, you should be actively trying to lose one of the remaining tricks.',
        'Sacrifice bags to set opponents. Sometimes taking a bag is correct if it means preventing the opponents from making their contract — a set is worth 100+ points.',
        'The steal: if opponents are at 9 bags, consider bidding slightly low to force them to "steal" one more — pushing them over the 10-bag threshold.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Nil bids — the highest-risk, highest-reward play',
      id: 'nil-bids',
    },
    {
      type: 'paragraph',
      text: 'A nil bid means you plan to win zero tricks. Success scores +100 points; failure costs -100 points and you keep the tricks you won. Nils are game-altering plays that reward bold, accurate hand-reading.',
    },
    {
      type: 'list',
      items: [
        'When to go nil: your hand has no high cards in any suit, no long spade suit, and at least two or three voids or near-voids. A hand with 2, 3, 4, 5 of clubs, 2, 3 of hearts, and nothing above a 6 elsewhere is a classic nil hand.',
        'When NOT to go nil: you hold the Queen of Spades or any ace. One high card in the wrong suit kills a nil.',
        'Partner cover: your partner\'s job when you go nil is to win every trick they possibly can. If a hand comes around where your nil hand must win (e.g. you hold a high card in an exhausted suit), partner should "cover" by playing higher in the same suit to take the trick from you.',
        'The blind nil: the most aggressive move in Spades — going nil before seeing your hand. Worth +200 if successful, -200 if failed. Only viable in desperation (your team is behind by 150+ points).',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'The play of the hand — signal and read',
      id: 'signaling',
    },
    {
      type: 'list',
      items: [
        'Lead low cards first in suits where your partner bid high. This helps partner win tricks early with high cards while you keep spades for later.',
        'Never lead spades unless you have no choice or specifically want to draw trumps. Spades break open the hand — save them for moments when drawing them benefits you.',
        'Watch discard patterns. When a player discards a high card in a suit (instead of ruffing), they are likely void in spades or have a void in another suit — useful information for the next lead.',
        'Count spades played. Spades is half about counting. Know when all high spades have been played and your low spades become winners.',
        'When behind in score: bid aggressively (try for set or nil). When ahead: bid conservatively, avoid risk, force opponents to stretch.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Endgame math — when to set, when to protect',
      id: 'endgame',
    },
    {
      type: 'paragraph',
      text: 'In the final hands of a game, pure strategy gives way to game-score math. Two rules dominate:',
    },
    {
      type: 'list',
      items: [
        'If opponents need one more hand to win: bid high, take risks, attempt a set. A set costs them 60-130 points and buys you another hand.',
        'If you need one more hand to win: bid precisely, avoid bags, protect your lead. Do not attempt nils unless the risk is minimal.',
        'The bluff bid: bidding slightly high can force opponents to over-cover (bidding high to prevent you making it), which leads them to sandbag or set themselves.',
      ],
    },
    {
      type: 'cta',
      href: '/games/spades',
      text: 'Put these strategies into practice — play Spades on Arcadeum',
      description:
        'Four-player Spades with live scoring, bag tracking, and post-game breakdown. Start a room and invite your friends.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'TL;DR — the winning Spades formula',
      id: 'tldr',
    },
    {
      type: 'list',
      items: [
        'Bid exactly what your hand is worth — conservative bidding causes more bags than bold bidding.',
        'Manage bags actively: duck tricks you do not need once your bid is made.',
        'Only go nil when you have no cards above a 6 in any suit and no bare aces.',
        'Count spades played — your low spades become winners once the high ones are gone.',
        'In the final hand: set opponents by bidding high; protect a lead by bidding precisely.',
      ],
    },
  ],
  faq: [
    {
      question: 'What is the ideal total bid for a partnership?',
      answer:
        'Most strong Spades players aim for a combined team bid of 10-11 per hand. A combined 12+ creates sandbag risk; a combined 8 or less is aggressive and may lead to sets.',
    },
    {
      question: 'When should I try to set the opponents?',
      answer:
        'When they have a combined bid of 9 or more and you hold multiple high cards that can take their tricks, actively try to win tricks that defeat their contract. A set (opponents failing to make their bid) scores you roughly 60-130 points.',
    },
    {
      question: 'Is a blind nil ever worth it?',
      answer:
        'Yes, but only when your team is behind by 100+ points with 3 or fewer hands remaining. The risk of -200 vs. a potential +200 makes it worth it only in catch-up situations — not as a regular strategy.',
    },
    {
      question: 'What if my partner and I disagree on bidding style?',
      answer:
        'The most important thing is to be consistent. Agree before the game whether you bid "true" (exact count) or conservative. Misalignment between partners — one bidding true, one conservative — creates systematic errors that are hard to recover from.',
    },
  ],
  howTo: {
    totalTime: 'PT20M',
    steps: [
      {
        name: 'Count your tricks honestly',
        text: 'Assess each card for its trick-winning probability. Aces = 1.0, kings = ~0.85, voids = +0.5. Bid what the hand is actually worth.',
        url: '#hand-evaluation',
      },
      {
        name: 'Coordinate with partner',
        text: 'Your combined bid should total 10-11. If partner bids 4, aim for 6 yourself — not 5 (too conservative) and not 7 (over-bid).',
        url: '#partnership-bidding',
      },
      {
        name: 'Duck when your bid is made',
        text: 'Once you have won your contracted tricks, lose the remaining ones deliberately to avoid sandbags.',
        url: '#sandbagging',
      },
      {
        name: 'Execute nil with care',
        text: 'Only go nil when you hold no high cards. Coordinate with partner to cover you if a dangerous suit becomes exhausted.',
        url: '#nil-bids',
      },
    ],
  },
};

import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'backgammon-pip-count-guide',
  locale: 'en',
  title:
    'Backgammon Pip Counting & Doubling Cube Decisions — A Practical Guide',
  excerpt:
    'Master the art of pip counting to win more race decisions and double with confidence. Includes step-by-step counting methods, the 25% cube acceptance rule, and match equity thinking.',
  publishedAt: '2026-09-14',
  author: 'Arcadeum team',
  tags: ['Backgammon', 'Strategy', 'Doubling Cube', 'Advanced', 'Dice'],
  readingTimeMinutes: 9,
  body: [
    {
      type: 'paragraph',
      text: 'The single skill that separates intermediate backgammon players from advanced ones is not board vision — it is pip counting. A pip count tells you exactly how many total pips (dice pips) each player needs to bear off all their checkers. Combined with the doubling cube, pip counting transforms guesswork into precision. This guide teaches you how to count efficiently and how to use that count to make better cube decisions.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'What is a pip count and why does it matter?',
      id: 'what-is-pip-count',
    },
    {
      type: 'paragraph',
      text: "Every checker on the board needs a certain number of pips (dice pips) to travel from its current point to the bear-off tray. Add up all the pips all your checkers need to travel, and you have your pip count. A pip count of 100 means you need, on average, about 100 total dice pips to bear off everything. Your opponent's pip count is the same idea for them. Whoever has the lower pip count is ahead in the race.",
    },
    {
      type: 'stat-card',
      title: 'Starting pip counts',
      stats: [
        {
          value: '167',
          label: 'Starting pip count',
          description: 'Both players begin equal at 167 pips',
        },
        {
          value: '~8.16',
          label: 'Avg dice roll',
          description: 'Expected pips per roll (2 dice)',
        },
        {
          value: '~20',
          label: 'Rolls to finish',
          description: 'From starting position',
        },
        {
          value: '25%',
          label: 'Cube threshold',
          description: 'Minimum to accept a double',
        },
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'How to count pips — step by step',
      id: 'counting-method',
    },
    {
      type: 'paragraph',
      text: 'The simplest method: multiply the number of checkers on each point by the point number, then add them all up. Work your way around the board systematically.',
    },
    {
      type: 'list',
      items: [
        'Your home board: if you have 3 checkers on point 6, 2 on point 5, and 4 on point 4 — that is (3×6)+(2×5)+(4×4) = 18+10+16 = 44 pips.',
        'Your outer board: same method. 5 checkers on point 13 = 5×13 = 65 pips.',
        "Opponent's boards: 2 checkers on point 24 (your numbering) = 2×24 = 48 pips.",
        'Add all quadrants together. The total is your pip count.',
        'Do the same for your opponent. The lower number is ahead in the race.',
      ],
    },
    {
      type: 'heading',
      level: 3,
      text: 'Worked example',
      id: 'worked-example',
    },
    {
      type: 'paragraph',
      text: 'A mid-game position: You have 2 checkers on the 24-point, 1 on the 18-point, 3 on the 13-point, 1 on the 9-point, 2 on the 8-point, 1 on the 5-point, and 5 on the 3-point. Your pip count: (2×24)+(1×18)+(3×13)+(1×9)+(2×8)+(1×5)+(5×3) = 48+18+39+9+16+5+15 = 150 pips. If your opponent has a count of 130, they are 20 pips ahead — a significant lead.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Speed counting methods',
      id: 'speed-counting',
    },
    {
      type: 'paragraph',
      text: 'Full pip counting in a game is slow. Here are faster shortcuts for experienced players:',
    },
    {
      type: 'list',
      items: [
        'Cluster counting: group checkers by region. All checkers in your home board average about 4 pips each; all in your outer board average 10 pips each. A quick cluster estimate gets you within 5% of the true count.',
        'Reference positions: memorize the pip count for common positions (e.g. the starting position is 167 each, a fully primed board has a specific count). Compare your current position to the closest reference and add/subtract.',
        'The "effective pip count" shortcut: if you have checkers on the bar or in the opponent\'s home board, they are expensive. A checker on the 24-point is worth 24 pips — more than all five home-board checkers combined. Weight those first.',
        'Relative counting: instead of counting absolute pips for both sides, count only the difference. Focus on who is ahead and by approximately how much — the exact number matters less for cube decisions than the rough differential.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Cube theory — when to double, when to accept',
      id: 'cube-theory',
    },
    {
      type: 'paragraph',
      text: 'The doubling cube is the heart of competitive backgammon. Two numbers define cube decisions:',
    },
    {
      type: 'list',
      items: [
        'Offering point (double): roughly when your winning chance exceeds 70-75%. If your pip count lead is 10% or more of your count (e.g. you have 100 pips, they have 110+), in a straight race you have a double. In contact games, cube decisions are more complex.',
        'Acceptance point: roughly 25% winning chances or better. The math: if you decline a double, you lose 1 point. If you accept and play, you have a 25% chance of winning 2 points and a 75% chance of losing 2 — expected value is slightly better than declining. Specifically: 0.25×2 = 0.5 expected win, vs. 1 point lost by declining. Accept at 25%.',
        'Beaver (redouble): in money games, if you think the cube offer was a mistake, you can redouble immediately (beaver). This keeps the cube in your possession at 4. Only done when you believe you are actually the favorite despite the offer.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Match equity — doubling in a match vs. money play',
      id: 'match-equity',
    },
    {
      type: 'paragraph',
      text: 'In money play, cube decisions use the 25% rule straightforwardly. In match play (playing to N points), cube decisions must account for match equity — how close a win/loss gets you to winning the match.',
    },
    {
      type: 'list',
      items: [
        'Crawford rule: the hand after one player reaches "1 away from winning" has no doubling cube — the losing player cannot double because the cube offers no benefit.',
        'Gammon value in match play: when gammons (double the stake) can affect who wins the match, the cube acceptance threshold shifts. You might accept a worse position than 25% if a gammon on the cube would clinch the match.',
        'Double early in a match when gammons are common. Double conservatively late in a match when a single point decides who wins.',
        'The Jacoby rule (in money games only): gammons and backgammons only count double or triple if the cube has been turned at least once. This affects opening play — doubling early has less gammon risk.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Race formula — the 8% rule',
      id: 'race-formula',
    },
    {
      type: 'paragraph',
      text: "In pure race positions (no contact), there is a quick formula for the doubling decision. If your pip count lead is more than about 8% of your count, you have an initial double. Example: your count is 80, opponent's count is 90. Difference is 10, which is 12.5% of 80 — a clear double. If their count is 84 — difference of 4 (5%) — you are ahead but not yet at the double threshold.",
    },
    {
      type: 'cta',
      href: '/games/backgammon',
      text: 'Practice your cube decisions — play Backgammon on Arcadeum',
      description:
        'Backgammon with the full doubling cube. Live pip count tracking helps you learn the numbers without memorizing from scratch.',
    },
    {
      type: 'cta',
      href: '/blog/how-to-play-backgammon',
      text: 'Need the basics first? Read the Backgammon beginner guide',
      description:
        'Board setup, hitting, bearing off, and the doubling cube introduction — all explained from scratch.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'TL;DR — pip counting cheat sheet',
      id: 'tldr',
    },
    {
      type: 'list',
      items: [
        'Pip count = sum of (checkers × point number) for all your checkers. Lower count = winning the race.',
        'Double when your winning chance exceeds ~70-75% (roughly 8-10% pip count lead in a race).',
        'Accept a double when you have 25%+ winning chances — declining with 25%+ is a mathematical error.',
        'In match play, consider gammon value and Crawford rule before making cube decisions.',
        'Track the relative pip difference, not just your absolute count, for faster decisions.',
      ],
    },
  ],
  faq: [
    {
      question: 'Is pip counting really necessary for casual play?',
      answer:
        'At the casual level, intuition often works. But as soon as you start playing against people who count, you will lose doubling cube decisions systematically. Even a rough estimate — knowing who is ahead and by roughly how many rolls — changes your game significantly.',
    },
    {
      question: 'What is the minimum pip lead to double?',
      answer:
        'In a pure race, roughly 8-10% of your pip count (e.g. a 10-pip lead when you have 100 pips total). In contact positions, pip count alone is not enough — you also need to assess positional factors like anchors and primes.',
    },
    {
      question: 'When should you never accept a double?',
      answer:
        'When your winning chances are below 20-22%. At that point the math turns against acceptance — you lose too many points on average by accepting versus the one point you lose by dropping.',
    },
    {
      question: 'Does pip count matter in contact positions?',
      answer:
        'Less directly. In contact positions, positional factors (anchors, primes, timing) often outweigh raw pip count. A player behind in pips but with a strong home board and attacking position may be the actual favorite.',
    },
  ],
};

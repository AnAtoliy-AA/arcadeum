import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-backgammon',
  locale: 'en',
  title: 'How to Play Backgammon Online — Rules, Doubling Cube, Strategy',
  excerpt:
    'A complete beginner-friendly guide to Backgammon: board setup, dice movement, hitting, bearing off, the doubling cube, and the strategy that wins games.',
  publishedAt: '2026-06-16',
  author: 'Arcadeum team',
  tags: ['Backgammon', 'How to Play', 'Strategy', 'Board Game', 'Dice'],
  readingTimeMinutes: 8,
  body: [
    {
      type: 'paragraph',
      text: 'Backgammon is one of the oldest known board games — a race between two players who move checkers across a board of 24 triangular points according to dice rolls. The objective is simple: move all fifteen of your checkers into your home board and bear them off before your opponent does. But beneath the simple goal lies a rich blend of probability, risk management, and tactical decision-making. This guide covers the rules, the doubling cube, and the habits that separate lucky rollers from consistent winners.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'The board and starting position',
      id: 'board',
    },
    {
      type: 'paragraph',
      text: "The backgammon board has 24 narrow triangles called points, numbered 1–24. Points are grouped into four quadrants of six points each: your home board (points 1–6), your outer board (7–12), your opponent's outer board (13–18), and your opponent's home board (19–24). Each player starts with 15 checkers arranged in a specific mirrored pattern: two on the 24-point, five on the 13-point, three on the 8-point, and five on the 6-point. The bar separates the two sides.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Moving with dice',
      id: 'movement',
    },
    {
      type: 'paragraph',
      text: 'Each turn, you roll two dice. You must move one checker the sum of both dice, or two checkers each the value of one die. For example, rolling a 3 and a 5 lets you move one checker 8 spaces or two checkers — one 3 spaces and one 5. You must use both dice if legally possible; if only one die can be used, you must play the higher number. When you roll doubles (e.g., double 4s), you play the number four times — four moves of four spaces each.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Hitting and the bar',
      id: 'hitting',
    },
    {
      type: 'paragraph',
      text: 'A point occupied by two or more checkers of one colour is "owned" — the opponent cannot land there. A single checker on a point is a blot. If an opposing checker lands on your blot, it is hit and placed on the bar. A player with checkers on the bar must re-enter them into the opponent\'s home board (on an open point) before making any other move. If no point is open, the turn is lost. Being stuck on the bar is one of the worst positions in backgammon.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Bearing off',
      id: 'bearing-off',
    },
    {
      type: 'paragraph',
      text: 'Once all fifteen of your checkers are in your home board (points 1–6), you begin bearing off — removing checkers from the board. A checker is removed by rolling the exact point number it sits on. If there is no checker on the point shown by the die, you may bear off the highest-occupied checker. If a checker is hit while bearing off, it must re-enter and travel back around before bearing off again.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Gammon and backgammon',
      id: 'scoring',
    },
    {
      type: 'paragraph',
      text: "A single game (one point) is won when the loser has borne off at least one checker. A gammon occurs when the loser has borne off no checkers — worth double (two points). A backgammon is when the loser still has a checker in the winner's home board or on the bar — worth triple (three points). The doubling cube amplifies these stakes further.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'The doubling cube',
      id: 'doubling',
    },
    {
      type: 'paragraph',
      text: 'The doubling cube is a die marked 2, 4, 8, 16, 32, 64. Before rolling on your turn, if you believe you have an advantage, you may offer a double — proposing to raise the stakes from 1 to 2 points. Your opponent must either accept (and now own the cube at 2) or decline (and lose 1 point). The owner of the cube can later redouble. The cube is what separates backgammon from a pure race — it adds a layer of game theory and psychology. Accepting a double is correct when you have roughly a 25% or greater chance of winning.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Strategy — the two modes of play',
      id: 'strategy',
    },
    {
      type: 'list',
      items: [
        "Race mode. When there is no contact between the forces (no opposing checkers can be hit), backgammon becomes a pure pip-count race. Count your total pips versus your opponent's — the lower count wins. In a race, run; don't leave unnecessary blots.",
        "Contact mode. When opposing checkers can interact, strategy shifts to making points (owning two or more adjacent points to block the opponent), anchoring in the opponent's home board (a safe landing spot), and managing blot exposure risk. Making your 5-point and 7-point early is a strong opening strategy.",
        'Timing. Know when to attack and when to run. When ahead in the race, minimise contact. When behind, seek contact — your opponent is more likely to leave a shot if you keep the game messy.',
        'Pip counting. A simple mental math skill: add up all the points your checkers need to travel to bear off. The player with the lower pip count is ahead in the race. Knowing your count before deciding whether to accept a double is essential.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Tactics and common mistakes',
      id: 'tactics',
    },
    {
      type: 'list',
      items: [
        'Slotting: placing a single checker on a key point you want to own, hoping to cover it next turn. Risky but sometimes necessary to make important points.',
        'Dual-purpose moves: a single move that both improves your position and hits an opponent blot. These are the strongest plays.',
        'Overstacking: having four or more checkers on a single point wastes material and reduces flexibility. Build points, not towers.',
        "Ignoring the bar: failing to account for re-entry probability when hitting. If the opponent's home board is partially owned, they may be stuck on the bar for multiple turns — press that advantage.",
        'Doubling cube errors: offering a double too early (when the position is unclear) or too late (when your advantage has peaked) cost significant equity over time.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Variants you will see online',
      id: 'variants',
    },
    {
      type: 'list',
      items: [
        'Match play. Instead of playing for 1 point, play to a set number (e.g., 7 points). Cube strategy changes dramatically in match play.',
        'Speed gammon. A variant where each player has a clock, adding time pressure to decisions.',
        'Acey-deucey. A popular variant where rolling double-1 gives you a free turn plus the ability to choose any double.',
      ],
    },
    {
      type: 'cta',
      href: '/games/backgammon',
      text: 'Play Backgammon online — free, in your browser',
      description:
        'Open a Backgammon room, share the link with friends, or play against AI bots. All rules and cube options available.',
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
        'Make key points early (especially your 5-point and 7-point) to control the board.',
        'Count your pips before accepting or offering a double — know whether you are ahead in the race.',
        'Switch between race mode (minimise contact when ahead) and contact mode (seek contact when behind).',
        'Avoid overstacking and manage blot exposure — every blot is a potential hit for your opponent.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Backgammon rewards players who combine probability thinking with tactical awareness. The dice add variance, but the player who consistently makes better decisions across many games will come out ahead. Practice your pip counting, get comfortable with the doubling cube, and play many games to sharpen your instincts.',
    },
  ],
  howTo: {
    totalTime: 'PT25M',
    steps: [
      {
        name: 'Make key points early',
        text: "Aim to own your 5-point and 7-point early. Owned points (two or more checkers) block the opponent's re-entry and create safe landing spots.",
        url: '#strategy',
      },
      {
        name: 'Count your pips',
        text: 'Before accepting or offering a double, add up all the points your checkers need to travel. Knowing your pip count tells you whether you are ahead or behind in the race.',
        url: '#strategy',
      },
      {
        name: 'Switch between race and contact modes',
        text: 'When ahead in the race, minimise contact by running. When behind, seek contact — keep the game messy to give your opponent more chances to leave a shot.',
        url: '#strategy',
      },
      {
        name: 'Manage blot exposure',
        text: 'Every blot is a potential hit. Avoid leaving blots in dangerous positions, and use dual-purpose moves that both improve your position and hit an opponent blot.',
        url: '#tactics',
      },
    ],
  },
};

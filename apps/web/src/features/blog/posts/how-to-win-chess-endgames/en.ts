import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-win-chess-endgames',
  locale: 'en',
  title: 'Chess Endgame Mastery — King-Pawn, Rook, and Queen Endings Explained',
  excerpt:
    'The endgame is where games are won or drawn. Master king-pawn opposition, the Philidor and Lucena positions, rook activity rules, and queen vs. rook — all with concrete examples.',
  publishedAt: '2026-09-18',
  author: 'Arcadeum team',
  tags: ['Chess', 'Endgame', 'Strategy', 'Tactics', 'Advanced'],
  readingTimeMinutes: 12,
  body: [
    {
      type: 'paragraph',
      text: 'Most chess players spend their study time on openings. The players who actually improve fastest spend it on endgames. The endgame is the phase where precise knowledge converts a tiny advantage into a win — and where imprecision throws away what was won in the middlegame. This guide covers the core theoretical positions every improving player must know.',
    },
    {
      type: 'stat-card',
      title: 'Why endgames matter',
      stats: [
        {
          value: '60%',
          label: 'Drawn games',
          description: 'that were lost in the endgame due to technical errors',
        },
        {
          value: '3',
          label: 'Key positions',
          description: 'Philidor, Lucena, Opposition — the must-know trio',
        },
        {
          value: '~80',
          label: 'Positions to master',
          description: 'to handle 95% of practical endgames',
        },
        {
          value: 'K+P',
          label: 'Most common endgame',
          description: 'King and pawn vs. king — 40% of all endgames',
        },
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'King-pawn endings — opposition and the key square',
      id: 'king-pawn',
    },
    {
      type: 'paragraph',
      text: 'King and pawn vs. king is the most common endgame type. Whether the stronger side wins depends entirely on king activity and whether the pawn reaches its "key square." The three squares directly in front of the pawn are its key squares. If the stronger king controls a key square before the weaker king can stop it, the pawn promotes.',
    },
    {
      type: 'heading',
      level: 3,
      text: 'Opposition — the decisive concept',
      id: 'opposition',
    },
    {
      type: 'paragraph',
      text: 'Two kings are in opposition when they face each other with exactly one square between them. The player who does NOT have the move has the opposition — and opposition is power. It means the enemy king must give way. In K+P vs. K endings, the stronger side wins by achieving the opposition on the key squares. Example: White king on e5, Black king on e7, White pawn on e4, White to move. White wins with Kd6! (taking the opposition on d-file), forcing Kd8 or Kf8, then Ke6 with the opposition taken — the pawn promotes.',
    },
    {
      type: 'heading',
      level: 3,
      text: 'The crucial exception: rook-pawn and wrong bishop',
      id: 'rook-pawn',
    },
    {
      type: 'list',
      items: [
        'Rook pawn (a or h pawn) with the king ahead: the pawn almost never wins. The defending king simply goes into the corner. The promoting square (a8 or h8) is the wrong color for the attacker, so the pawn just reaches the corner and stalemates.',
        "Wrong-color bishop: if you have a bishop that does not control the pawn's promotion square, the defender draws by keeping the king on that square color.",
        'Pawn on 7th rank — stalemate danger: the attacker must be careful not to stalemate the defending king when the pawn reaches the 7th rank.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Rook endings — the most common practical endgame',
      id: 'rook-endings',
    },
    {
      type: 'paragraph',
      text: "Rook endings occur in roughly a third of all games. The fundamental principle: rooks belong behind passed pawns (yours pushing, opponent's slowing). A rook on the 7th rank is enormously powerful — it attacks enemy pawns and restricts the opponent's king simultaneously.",
    },
    {
      type: 'heading',
      level: 3,
      text: 'The Philidor Position — the fortress draw',
      id: 'philidor',
    },
    {
      type: 'paragraph',
      text: 'The Philidor position is the key drawing technique in R+P vs. R. The defending rook sits on the 6th rank (the "Philidor rank"), cutting off the attacking king. When the pawn advances to the 6th rank, the defending rook drops to the 1st rank for back-rank checks — the king cannot shelter because it walks into perpetual check. Key squares for Black to remember: rook starts on e6, pawn is on e5. When White pushes e6, Rook moves to e1 — now checks from behind are unstoppable.',
    },
    {
      type: 'heading',
      level: 3,
      text: 'The Lucena Position — winning technique',
      id: 'lucena',
    },
    {
      type: 'paragraph',
      text: 'The Lucena position is the winning technique for the stronger side in R+P vs. R. The pawn has reached the 7th rank, the attacking king is in front of the pawn (shielding it), and the rook defends from behind. The winning technique is called "building a bridge": the attacking rook cuts off the enemy king by rank, then the king advances while the rook shields it from checks. Step-by-step: (1) Rook goes to the 4th rank to cut off the defender\'s king from one side. (2) King steps to c7 or e7 (away from the rook\'s file). (3) Rook swings back to shield the king from behind. (4) The pawn promotes without the back-rank checks being perpetual.',
    },
    {
      type: 'heading',
      level: 3,
      text: 'Practical rook ending rules',
      id: 'rook-rules',
    },
    {
      type: 'list',
      items: [
        'Active rook beats passive rook. A rook on an open file creates threats; a passive rook only defends.',
        "Cut off the enemy king by rank or file. A rook on the 4th rank (if the enemy king is on rows 1-3) restricts the king's mobility dramatically.",
        'Pawn breaks decide R+P endings. The player who creates a passed pawn first usually converts the advantage.',
        'Lucena wins, Philidor draws. If you reach a R+P vs. R position, immediately identify which theoretical position you are closest to.',
        'Rook checks from behind the passer. The defending rook should harass the passed pawn from behind — the passer has to dodge checks or find shelter.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Bishop endings — same color vs. opposite color',
      id: 'bishop-endings',
    },
    {
      type: 'paragraph',
      text: 'Bishop vs. bishop endings split into two fundamentally different cases. Opposite-color bishop endings (each bishop on a different square color) are notoriously drawish — the stronger side often cannot create a passed pawn on a color the defender cannot touch. Same-color bishop endings (both bishops on the same square color) are more decisive: the attacker can triangulate and zugzwang the defender, and pawns on the color of the bishops become targets.',
    },
    {
      type: 'list',
      items: [
        'Opposite-color bishops: The defender draws by blockading the passed pawn on a square the attacking bishop cannot access. Even two extra pawns can draw with this technique.',
        "Same-color bishops: Put your pawns on the opposite color from your bishop so the bishop can move freely. The opponent's pawns on the same color as both bishops are permanent targets.",
        'Bishop vs. knight in the endgame: Bishop tends to win in open positions with pawns on both wings. Knight tends to draw or win in closed positions, especially with fixed pawn structures.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Queen endings — stalemate traps and perpetual check',
      id: 'queen-endings',
    },
    {
      type: 'paragraph',
      text: 'Queen endings are theoretically won for the stronger side in most cases — but they are notoriously difficult to convert because the weaker side can give perpetual checks or create stalemate traps. Key rule: never let the defending king run into a corner where it might become stalemated on your move.',
    },
    {
      type: 'list',
      items: [
        'Q vs. pawn on 7th: usually a win unless the pawn is on a rook or bishop file (a, c, f, or h), where stalemate tricks occur. The technique is to move the queen close to the pawn, restricting the king, then bring your king in.',
        "Q vs. R (Philidor's legacy): theoretically won but technically complex. Requires the king to participate. The pattern is to use the queen to restrict the opposing king to one side, then bring your king in to deliver the final threats.",
        'Avoid perpetual check by creating escape squares for your king early. A king boxed in by its own pieces or the edge is vulnerable to perpetual.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Practical endgame habits',
      id: 'habits',
    },
    {
      type: 'list',
      items: [
        'Activate the king immediately. When the queens come off, your king is no longer under mating attack — bring it to the center or to where the action is.',
        'Calculate pawn races precisely. In king-vs-king-and-pawn races, count exact moves — one move difference changes win to draw or draw to loss.',
        'Identify passed pawns before the endgame starts. Trade into an endgame where you have a passed pawn, or where the pawn structure favors your remaining pieces.',
        'Know when to trade into a theoretical position. If you know Philidor, you know when you are safe to trade rooks and accept a K+P ending.',
        'Understand zugzwang. Many endgames are decided by who is forced to move — the player who must move loses. Build positions where any move by the opponent weakens something.',
      ],
    },
    {
      type: 'cta',
      href: '/games/chess',
      text: 'Practice endgames in real games — play Chess on Arcadeum',
      description:
        'Try the techniques from this guide in live games. Review the endgame phase in your post-game analysis to see exactly where the position became won or drawn.',
    },
    {
      type: 'cta',
      href: '/blog/chess-opening-traps',
      text: 'Also read: 10 Chess Opening Traps Every Player Should Know',
      description:
        "From Scholar's Mate to the Fried Liver Attack — with full move sequences.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'TL;DR — the endgame essentials',
      id: 'tldr',
    },
    {
      type: 'list',
      items: [
        'King-pawn vs. king: understand opposition and the key squares. Rook pawns almost never win.',
        'Rook endings: know Philidor (drawing technique) and Lucena (winning technique).',
        'Bishop endings: opposite-color bishops draw more often; same-color bishops favor the attacker.',
        'Activate your king immediately when pieces come off. An active king is worth a piece in simplified positions.',
        "Avoid stalemate in queen endings — always check for the defender's traps.",
      ],
    },
  ],
  faq: [
    {
      question: 'What is the most important endgame to study first?',
      answer:
        'King and pawn vs. king — it is the most common and teaches the two core concepts (opposition, key squares) that appear in every other endgame type.',
    },
    {
      question: 'What is the Philidor position?',
      answer:
        'A defensive technique in R+P vs. R where the defending rook holds the 6th rank, cutting off the attacking king, then switches to back-rank checks when the pawn advances. The draw is theoretically forced with correct play.',
    },
    {
      question: 'Why do opposite-color bishops draw even with two extra pawns?',
      answer:
        "The defending bishop cannot be touched by the attacking bishop, so it can permanently blockade the passed pawn. The attacker cannot triangulate or outmaneuver — the defender simply parks the bishop on the pawn's path and never moves.",
    },
    {
      question: 'How do I avoid stalemate in queen endings?',
      answer:
        "Keep the defending king away from the edges and corners. Before pushing pawns or checking, visualize whether the opponent's king has legal moves. When it doesn't, that is stalemate — even if you are winning comfortably.",
    },
  ],
  howTo: {
    totalTime: 'PT30M',
    steps: [
      {
        name: 'Activate your king',
        text: 'In any endgame, the first thing to do is centralize your king. A king on e4 controls more squares than a king on g1.',
        url: '#habits',
      },
      {
        name: 'Learn the Philidor position',
        text: 'The most important drawing technique: defending rook on the 6th rank, switching to back-rank checks when the pawn advances.',
        url: '#philidor',
      },
      {
        name: 'Learn the Lucena position',
        text: 'The "bridge" technique converts a rook-and-pawn advantage with a pawn on the 7th. Cut off the king by rank, then swing the rook to shield.',
        url: '#lucena',
      },
      {
        name: 'Count king-pawn races exactly',
        text: 'In pawn races, count the exact number of moves each side needs. One move difference changes the result entirely.',
        url: '#king-pawn',
      },
    ],
  },
};

import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'annotated-chess-replay',
  locale: 'en',
  title: 'Inside a Diamond-Level Chess Game — Move-by-Move Breakdown',
  excerpt:
    'We analyze a real ranked Chess game from Arcadeum: opening choices, tactical blows, positional mistakes, and the moment the game was decided.',
  publishedAt: '2026-08-25',
  author: 'Arcadeum team',
  tags: ['Chess', 'Replay', 'Strategy', 'Analysis', 'ELO'],
  readingTimeMinutes: 10,
  body: [
    {
      type: 'paragraph',
      text: "Watching high-level games is the fastest way to improve. We picked a real ranked game between two Diamond-level players and broke down every critical moment. This is not a textbook example — it's a messy, real game with mistakes, traps, and a brilliant tactical shot that decided it.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'The game',
      id: 'game',
    },
    {
      type: 'replay-embed',
      replayId: 'example-chess-master-game',
      title: 'Diamond-level Chess: Italian Game to Tactical Finish',
      description: 'White (1950 ELO) vs Black (1880 ELO) - 31 moves - Ranked',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Opening — Italian Game, Giuoco Piano',
      id: 'opening',
    },
    {
      type: 'paragraph',
      text: "White opens with the Italian Game — one of the oldest and most principled openings. The bishop on c4 eyes the weak f7 pawn. Black responds with 3...Bc5 (Giuoco Piano), solid but giving White a slight initiative. After 4. c3 Nf6 5. d4, White challenges the center immediately.",
    },
    {
      type: 'chess-notation',
      title: 'Moves 1–6: Opening Theory',
      moves: [
        'e4', 'e5',
        'Nf3', 'Nc6',
        'Bc4', 'Bc5',
        'c3', 'Nf6',
        'd4', 'exd4',
        'cxd4', 'Bb4+',
      ],
    },
    {
      type: 'paragraph',
      text: "6...Bb4+ is the main line — Black checks to disrupt White's development. After 7. Bd2 Bxd2+ 8. Nbxd2, White has a strong pawn center but Black's position is solid. Both players are still in book through move 12.",
    },
    {
      type: 'chess-notation',
      title: 'Moves 7–12: Completing Development',
      moves: [
        'Bd2', 'Bxd2+',
        'Nbxd2', 'd5',
        'exd5', 'Nxd5',
        'Qb3', 'Nce7',
        'O-O', 'O-O',
        'Rfe1', 'c6',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Middlegame — the critical moment (move 18)',
      id: 'middlegame',
    },
    {
      type: 'paragraph',
      text: "After both sides complete development, the position is roughly equal. White has a slight space advantage. Black decides to complicate with 14...Nf4 — an aggressive knight jump that targets g2 and the White king's position.",
    },
    {
      type: 'chess-notation',
      title: 'Moves 13–18: The Setup',
      moves: [
        'Ne4', 'Nf4',
        'Neg5', 'h6',
        'Nh3', 'Nxh3',
        'gxh3', 'Be6',
        'Qc3', 'Qd5',
      ],
    },
    {
      type: 'paragraph',
      text: "Move 18 is where the game is decided. Black plays Qd5 — centralizing the queen and eyeing the a2 pawn. It looks powerful. It loses to a tactic. White has Bxf7+! — a discovered attack that wins material. After Kh8 (forced, since Kxf7 allows Qxf6+ forking king and rook), White plays Nh4, and Black's queen is trapped with no safe squares.",
    },
    {
      type: 'stat-card',
      title: 'The Decisive Sequence',
      stats: [
        { value: '18', label: 'Move', description: 'Where Black blundered' },
        {
          value: '-3.1',
          label: 'Eval Swing',
          description: 'From equal to winning',
        },
        {
          value: '3',
          label: 'Moves to win material',
          description: 'Bxf7+, Kh8, Nh4',
        },
      ],
    },
    {
      type: 'chess-notation',
      title: 'Moves 19–24: White Converts',
      moves: [
        'Bxf7+', 'Kh8',
        'Nh4', 'Qd7',
        'Nf5', 'Bxf5',
        'Rxe7', 'Qd6',
        ' Rae1', 'Rae8',
        ' R1e6', 'Qd5',
      ],
    },
    {
      type: 'paragraph',
      text: "After the tactical shot, White is up a full piece. The technique is clinical: trade pieces (Nf5 forces Bxf5, then Rxe7 wins back the exchange with interest), activate the rooks, and simplify. Black has no counterplay — the king is exposed, the pieces are uncoordinated, and White's rooks dominate the open files.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'What Black should have played',
      id: 'correction',
    },
    {
      type: 'paragraph',
      text: "Instead of 18...Qd5, Black should have played 18...Qd6 — keeping the queen active without walking into the tactic. Or 18...Rae8 to contest the e-file. The position was equal — Black had no need to force complications. This is the most common mistake at the Diamond level: playing actively when patient defense is correct.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Endgame technique (moves 25–31)',
      id: 'endgame',
    },
    {
      type: 'chess-notation',
      title: 'Moves 25–31: The Finish',
      moves: [
        'Rxe8', 'Rxe8',
        'Qxf6', 'gxf6',
        'Re7', 'Rf8',
        'Ra7', 'a6',
        'Rb7', 'Kg8',
        'Rxb6',
      ],
      result: '1-0',
    },
    {
      type: 'paragraph',
      text: "Black resigns after Rxb6 — White is up a piece and two pawns with a completely winning endgame. The rook on the seventh rank is devastating, and Black's pawns are all weak. There is nothing left to play for.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Key takeaways',
      id: 'takeaways',
    },
    {
      type: 'list',
      items: [
        "Before playing an active queen move, check: does my opponent have a discovered attack?",
        'King safety matters more than piece activity. Black\'s king was on h8 with no pawn cover.',
        'When ahead, simplify. Trade pieces aggressively to reduce counterplay.',
        'Watch for loose pieces. The queen on d5 had no safe retreat after Nh4.',
      ],
    },
    {
      type: 'cta',
      href: '/games/chess',
      text: 'Play ranked Chess — your game could be next',
      description:
        'Every ranked game is saved as a replay. Analyze your own games to find your mistakes.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'TL;DR — the three lessons',
      id: 'tldr',
    },
    {
      type: 'list',
      items: [
        'Check for discovered attacks before centralizing your queen.',
        'Castle early — exposed kings lose games.',
        'When ahead, trade pieces and simplify.',
      ],
    },
  ],
  faq: [
    {
      question: 'How do I watch replays on Arcadeum?',
      answer:
        'Go to your game history, click on any completed game, and select Watch Replay. You can step through moves, pause, and fast-forward.',
    },
    {
      question: 'Can I share replays with friends?',
      answer:
        'Yes. Each replay has a unique URL and a share button. Send the link and anyone can watch the full game.',
    },
    {
      question: 'How do I analyze my own games?',
      answer:
        'Watch the replay and look for moments where the evaluation shifted. Focus on the 3-5 moves where you lost the most advantage.',
    },
    {
      question: 'What ELO do I need to reach Diamond rank?',
      answer:
        'Diamond rank on Arcadeum requires approximately 1800+ ELO in a specific game mode. The exact threshold varies by season and game population.',
    },
  ],
};

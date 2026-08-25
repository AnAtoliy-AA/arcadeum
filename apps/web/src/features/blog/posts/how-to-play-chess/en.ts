import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-chess',
  locale: 'en',
  title: 'How to Play Chess Online — Rules, Openings, Tactics, Endgame',
  excerpt:
    'A complete beginner-friendly guide to chess: official rules, special moves, opening principles, middlegame tactics, and endgame essentials — plus the habits that prevent blunders.',
  publishedAt: '2026-06-02',
  author: 'Arcadeum team',
  tags: ['Chess', 'How to Play', 'Strategy', 'Board Games', 'Tutorial'],
  readingTimeMinutes: 8,
  body: [
    {
      type: 'paragraph',
      text: 'Chess is the most studied board game still played at scale: two players, a 64-square board, and one goal — trap the enemy king so it cannot escape attack. White moves first, turns alternate one move at a time, and everything else grows out of that simple rhythm. You can learn the rules in an afternoon, yet the game rewards a lifetime of study. This guide covers the official rules including the three special moves, the opening principles that set up the whole game, the tactical patterns that decide most amateur games, and the endgame skills that turn small advantages into wins — all framed for playing chess online.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'The rules: board, pieces, and how a game ends',
      id: 'rules',
    },
    {
      type: 'paragraph',
      text: 'The board is an 8×8 grid of alternating light and dark squares. Each player starts with 16 pieces: one king, one queen, two rooks, two bishops, two knights, and eight pawns, arranged in the standard starting position — each queen begins on its own color. Pawns move one square forward (two from their starting square) and capture diagonally; knights jump in an L-shape; bishops slide along diagonals; rooks slide along ranks and files; the queen combines rook and bishop; the king moves one square in any direction.',
    },
    {
      type: 'heading',
      level: 3,
      text: 'Special moves: castling, en passant, and promotion',
      id: 'special-moves',
    },
    {
      type: 'list',
      items: [
        'Castling. Once per game the king and a rook move together: the king slides two squares toward the rook and the rook jumps to the square beside it. It is legal only if neither piece has moved, no pieces stand between them, and the king is not in check, does not pass through an attacked square, and does not land on one.',
        'En passant. If a pawn advances two squares and lands directly beside an enemy pawn, that enemy pawn may capture it on the very next move, as if it had advanced only one square.',
        'Promotion. A pawn that reaches the far rank is promoted to any piece except a king — practically always a queen.',
      ],
    },
    {
      type: 'paragraph',
      text: "You win by checkmate: the enemy king is attacked ('in check') and has no legal escape. Not every finished game ends in mate, though. A player who is not in check but has no legal move is stalemated — that is a draw, as are insufficient material, threefold repetition of the position, and fifty consecutive moves without a pawn move or a capture.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Opening principles',
      id: 'opening',
    },
    {
      type: 'paragraph',
      text: 'You do not need to memorize long opening variations to reach the middlegame with chances — a handful of principles covers almost every position:',
    },
    {
      type: 'list',
      items: [
        'Fight for the center. Open with a central pawn (e4 or d4 as White, met by e5 or d5 as Black); central squares give your pieces maximum reach.',
        'Develop knights before bishops, and point both toward the center rather than the flanks.',
        'Castle early. King safety outranks almost everything else in the first ten moves.',
        'Do not move the same piece twice without a reason — every wasted tempo hands the opponent free development.',
        "Do not bring the queen out too early: she becomes a target that the opponent's developing pieces attack for free.",
        'Avoid grabbing flank pawns while behind in development; open positions punish greed.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Middle-game tactics',
      id: 'tactics',
    },
    {
      type: 'paragraph',
      text: 'Tactical shots decide more club-level games than deep strategic plans, and the winning patterns repeat constantly. Learn these six until you see them without searching:',
    },
    {
      type: 'list',
      items: [
        'Fork. One piece attacks two or more targets at once. The knight fork on king and queen is the classic — the royal pair cannot both be saved.',
        'Pin. The attacked piece cannot or dare not move because something more valuable stands behind it; a pin against the king freezes the pinned piece entirely.',
        'Skewer. The reverse pin: a valuable piece is attacked and must move, exposing the piece behind it to capture.',
        'Discovered attack. Moving one piece unmasks an attack from the piece behind it; when the unmasked piece is a rook or bishop hitting an undefended queen, material simply falls.',
        "Removing the defender. Capture or deflect the piece that holds the opponent's position together, and the rest collapses.",
        'Back-rank mate. A king boxed in by its own pawns can be mated outright by a heavy piece on the back rank — create an escape square before it is too late.',
      ],
    },
    {
      type: 'paragraph',
      text: 'After every opponent move, ask what changed: which lines opened, which pieces became undefended, which checks and captures are now possible. Before committing to your candidate move, run a quick blunder-check — is anything of mine hanging, and does my move leave anything hanging?',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Endgame essentials',
      id: 'endgame',
    },
    {
      type: 'paragraph',
      text: 'When queens come off and the board empties, the roles flip: the king stops hiding and becomes a fighting piece. Three skills convert small advantages into points:',
    },
    {
      type: 'list',
      items: [
        'Activate your king. March it toward the center or toward the pawns that matter; in simplified positions an active king is worth roughly a piece.',
        'Push passed pawns. A pawn with no enemy pawns blocking its path races toward promotion — usually to a queen, which effectively wins the game.',
        'Understand opposition in king-and-pawn endings: the side whose turn it is to move must give way, so the turn decides who escorts their pawn home.',
        'Place rooks behind passed pawns — yours push faster, theirs get stopped from a distance.',
        'Learn the basic mates. King and queen, and king and rook, can deliver mate alone; king with only a bishop or knight cannot force a win, so trade accordingly.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Common beginner mistakes',
      id: 'mistakes',
    },
    {
      type: 'list',
      items: [
        'Launching the queen early and then losing time dodging attacks on her.',
        'Delaying castling until the king is already under fire.',
        'Moving only pawns, or shuffling one piece around while six others wait at home.',
        "Ignoring the opponent's threats — every move deserves the question: what does it attack?",
        'Playing hope chess: choosing a move without checking whether it drops a piece or allows mate.',
        'Trading automatically instead of asking who benefits from each exchange.',
      ],
    },
    {
      type: 'cta',
      href: '/games/chess',
      text: 'Play chess online — free, in your browser',
      description:
        'Start a casual game in seconds, invite a friend with a link, or sharpen your play against AI bots — no download, no account required.',
    },
    {
      type: 'cta',
      href: '/games/checkers',
      text: 'In the mood for something lighter? Play checkers online',
      description:
        'The other classic of abstract strategy: quicker to learn, still razor-sharp.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'TL;DR — the habits that win games',
      id: 'tldr',
    },
    {
      type: 'list',
      items: [
        'Fight for the center and develop knights before bishops',
        'Castle early; do not move the same piece repeatedly or launch the queen too soon',
        'Every move, scan for forks, pins, skewers, and discovered attacks — then blunder-check your candidate move',
        'In the endgame, activate your king and push passed pawns to promotion',
        'Know the finishes: checkmate wins, stalemate and threefold repetition draw',
      ],
    },
    {
      type: 'paragraph',
      text: 'Chess rewards exactly the habits above: control space, develop efficiently, calculate forcing moves, and steer into endgames you understand. None of it takes talent — only repetition. Play a few games on Arcadeum, review the ones you lose, and the progress shows up within weeks.',
    },
  ],
  howTo: {
    totalTime: 'PT20M',
    steps: [
      {
        name: 'Fight for the center and develop knights before bishops',
        text: 'Open with a central pawn (e4 or d4 as White, e5 or d5 as Black) and develop knights toward the middle before bishops. Centralized pieces reach more squares and support early activity.',
        url: '#opening',
      },
      {
        name: 'Castle early; do not move the same piece repeatedly or launch the queen too soon',
        text: 'King safety comes first: castle within the first ten moves. Every extra move with the same piece wastes a tempo, and an early queen becomes a target that developing opponent pieces attack for free.',
        url: '#opening',
      },
      {
        name: 'Every move, scan for forks, pins, skewers, and discovered attacks — then blunder-check your candidate move',
        text: 'Tactics decide most amateur games. After each opponent move ask what changed, and before playing your chosen move check whether anything of yours is hanging or would become hanging.',
        url: '#tactics',
      },
      {
        name: 'In the endgame, activate your king and push passed pawns to promotion',
        text: 'March the king toward the action, escort passed pawns down the board — usually promoting to a queen — and remember rooks belong behind passed pawns.',
        url: '#endgame',
      },
      {
        name: 'Know the finishes: checkmate wins, stalemate and threefold repetition draw',
        text: 'You win by trapping the enemy king with no legal escape. A player with no legal moves who is not in check is stalemated — a draw, like insufficient material, threefold repetition, and the fifty-move rule.',
        url: '#rules',
      },
    ],
  },
};

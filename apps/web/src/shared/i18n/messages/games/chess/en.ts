export const enMessages = {
  chess_v1: {
    name: 'Chess',
    description:
      'The classic strategy board game with full rules including castling, en passant, and promotion',
    summary:
      'Challenge friends or bots to a game of chess with standard or Chess960 variants and optional time controls.',
    landing: {
      meta: {
        title: 'Chess — multiplayer with standard & Chess960 variants',
        description:
          'Play multiplayer Chess online. Standard and Chess960 variants, optional time controls, bots from day one. Free, instant rooms, no install.',
        keywords:
          'chess, chess online, multiplayer chess, chess960, chess game, board games',
      },
      hero: {
        title: 'Chess — the timeless strategy game',
        subtitle:
          'Standard rules, Chess960 variant, and optional time controls. Play against friends or bots.',
        createRoom: 'Create a room',
        browseRooms: 'Browse rooms',
      },
      highlights: {
        players: {
          title: '2 players',
          body: 'Challenge a friend or play against a smart bot opponent.',
        },
        variants: {
          title: '2 variants',
          body: 'Classic standard position and Chess960 randomized setup.',
        },
        clock: {
          title: 'Time controls',
          body: 'Blitz, rapid, or classical. Or play without a clock.',
        },
      },
      steps: {
        create: {
          title: 'Create a room',
          body: 'Pick a variant and time control. Public or invite-only.',
        },
        join: {
          title: 'Invite a friend or add a bot',
          body: 'Share the link or click "Start with bots" for instant play.',
        },
        play: {
          title: 'Play and chat',
          body: 'Make your moves, check the clock, and chat through the game.',
        },
      },
      faq: {
        chess960: {
          question: 'What is Chess960?',
          answer:
            'Chess960 (Fischer Random) uses a randomized starting position with 960 possible setups. The castling rules are adapted, but all other chess rules remain the same.',
        },
        clock: {
          question: 'How do time controls work?',
          answer:
            'Each player has a clock. When it is your turn, your clock counts down. If your time runs out, you lose. Some controls add time after each move (increment).',
        },
        promotion: {
          question: 'How does pawn promotion work?',
          answer:
            'When a pawn reaches the opposite end of the board, you must promote it to a queen, rook, bishop, or knight.',
        },
      },
    },
    lobby: {
      variant: 'Variant',
      timeControl: 'Time control',
      startWithBots: 'Start with bots',
      waitingForPlayers: 'Waiting for players…',
      minPlayers: 'Minimum 2 players',
      standard: 'Standard',
      chess960: 'Chess960',
      standardDesc: 'Classic starting position',
      chess960Desc: 'Randomized starting position',
      noClock: 'No clock',
      unlimitedTime: 'Unlimited time',
      blitz: 'Blitz',
      rapid: 'Rapid',
      classical: 'Classical',
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
    },
    rules: {
      title: 'Chess Rules',
      objective: 'Objective',
      objectiveText:
        "Checkmate your opponent's king. The king is in checkmate when it is in check and there is no legal move to escape.",
      pieces: 'Pieces',
      special: 'Special Moves',
      castling:
        'King moves two squares toward a rook, and the rook jumps over the king. Must be unobstructed, king not in check, and neither piece moved.',
      enPassant:
        'A pawn can capture an opposing pawn that just moved two squares forward, as if it moved only one.',
      promotion:
        'A pawn reaching the opposite end promotes to a queen, rook, bishop, or knight.',
      drawConditions: 'Draw Conditions',
      drawStalemate: 'Stalemate (no legal moves, not in check)',
      drawFiftyMove: '50-move rule (50 moves without captures or pawn moves)',
      drawRepetition: 'Threefold repetition',
      drawMaterial: 'Insufficient material',
      gotIt: 'Got it',
    },
    gameOver: {
      won: 'You won!',
      lost: 'You lost.',
      draw: 'Draw.',
      messages: {
        won: 'Checkmate! You defeated your opponent. Ready for another round?',
        lost: 'Checkmate! Your opponent won. Want a rematch?',
        draw: 'The game ended in a draw. Try a different variant?',
      },
    },
    actions: {
      move: 'Move piece',
      resign: 'Resign',
      rematch: 'Rematch',
      leave: 'Leave',
      draw: 'Draw',
      drawOffered: 'Draw Offered',
      acceptDraw: 'Accept Draw',
      declineDraw: 'Decline',
      moveList: 'Move List',
      copyPGN: 'Copy PGN',
    },
    chat: {
      move: '{{name}} moved {{notation}}',
      check: '{{name}} is in check!',
      checkmate: '{{name}} wins by checkmate!',
      castle: '{{name}} castled',
      capture: '{{name}} captured {{piece}}',
      promotion: '{{name}} promoted to {{piece}}',
      resign: '{{name}} resigned',
      draw: 'Game ended in a draw',
      joined: '{{name}} joined.',
      left: '{{name}} left.',
    },
    errors: {
      notYourTurn: 'Not your turn yet.',
      invalidMove: 'That is not a legal move.',
      gameOver: 'The game has ended.',
      gameNotStarted: 'The game has not started.',
    },
    status: {
      turn: "{{player}}'s turn",
      white: 'White',
      black: 'Black',
      toMove: 'to move',
      check: 'Check!',
      checkmate: 'Checkmate!',
      winner: '{{player}} won',
      draw: 'Draw',
      moves: '{{count}} moves',
      promotionTitle: 'Promote pawn to:',
      collapse: 'Collapse',
      showAll: 'Show all ({{count}})',
      copied: 'Copied!',
      spectating: 'Spectating',
    },
  },
};

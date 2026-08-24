export const enMessages = {
  checkers_v1: {
    name: 'Checkers',
    description:
      'Classic 8×8 checkers with forced captures, multi-jump, and king promotion',
    summary:
      'Strategic board game — capture opponent pieces and reach the other side to become a king!',
    variants: {
      classic: { name: 'Classic', description: 'Traditional checkers board' },
      neon: { name: 'Neon', description: 'Glowing neon aesthetic' },
      wood: { name: 'Wood', description: 'Warm wooden board' },
      marble: { name: 'Marble', description: 'Elegant marble finish' },
      neon_glow: { name: 'Neon Glow', description: 'Deep purple neon' },
    },
    landing: {
      meta: {
        title: 'Checkers — Free Multiplayer Board Game | Arcadeum',
        description:
          'Play checkers online for free on Arcadeum. Classic 8×8 board with forced captures, multi-jump, king promotion, and AI opponents.',
        keywords:
          'checkers, draughts, board game, multiplayer, online, free, strategy',
      },
      hero: {
        title: 'Checkers',
        subtitle:
          'Classic strategy on an 8×8 board. Capture, promote, and conquer!',
        ctaQuickplay: 'Play vs AI',
        ctaQuickplayError: 'Failed to create game',
        createRoom: 'Create Room',
        browseRooms: 'Browse Rooms',
      },
      highlights: {
        players: { title: '2 Players', body: 'Head-to-head strategic battle' },
        captures: {
          title: 'Forced Captures',
          body: 'When you can capture, you must!',
        },
        kings: {
          title: 'King Promotion',
          body: 'Reach the opposite end to crown a king',
        },
      },
      steps: {
        create: {
          title: 'Create a Room',
          body: 'Choose a variant and start a new game.',
        },
        join: {
          title: 'Join or Add a Bot',
          body: 'Invite a friend or play against AI.',
        },
        play: {
          title: 'Play',
          body: 'Move diagonally, capture opponent pieces, and win!',
        },
      },
      themes: {
        title: 'Choose Your Theme',
        subtitle: 'Pick a visual style that suits you.',
      },
      faq: {
        forcedCaptures: {
          question: 'What are forced captures?',
          answer:
            'If you have an available capture, you must take it. You cannot skip a capture even if another move seems better.',
        },
        multiJump: {
          question: 'Can I capture multiple pieces in one turn?',
          answer:
            'Yes! If after a capture your piece can capture again, you must continue the multi-jump chain.',
        },
        kings: {
          question: 'How do pieces become kings?',
          answer:
            'When a man reaches the opposite end of the board (rank 8 for light, rank 1 for dark), it is promoted to a king. Kings can move and capture in all four diagonal directions.',
        },
        botAI: {
          question: 'How good is the AI?',
          answer:
            'The bot uses a minimax algorithm with positional evaluation. It plays at a strong intermediate level.',
        },
      },
    },
    lobby: {
      variant: 'Theme',
      ruleVariant: 'Ruleset',
      rules: 'Game Rules',
      startWithBots: 'Start with Bot',
      forcedCaptures: 'Forced Captures',
      backwardCaptures: 'Backward Captures',
      alwaysEnabled: 'always enabled',
      ruleVariants: {
        american: {
          name: 'American',
          description: '8×8 board, 12 pieces, no flying kings',
        },
        international: {
          name: 'International',
          description:
            '10×10 board, 20 pieces, flying kings, backward captures',
        },
        russian: {
          name: 'Russian',
          description: '8×8 board, 8 pieces, flying kings',
        },
      },
    },
    tutorial: {
      s1: {
        title: 'Race to promote',
        body: 'Move your pieces diagonally forward one square at a time. Reach the far side to crown a king that moves both ways.',
      },
      s2: {
        title: 'Jump to capture',
        body: 'Jump over an adjacent enemy piece to capture it. Captures are mandatory, and multi-jumps must be completed in full.',
      },
      s3: {
        title: 'Win by elimination',
        body: 'Capture every enemy piece or leave your opponent without a legal move to take the win.',
      },
      s4: {
        title: 'Table tools',
        body: 'Toggle sound and music, enter fullscreen, review the Rules book or invite friends from this panel.',
      },
    },
    rules: {
      title: 'Checkers Rules',
      headers: {
        objective: 'Objective',
        howToPlay: 'How to Play',
        kingPromotion: 'King Promotion',
        backwardCaptures: 'Backward Captures',
        forcedCaptures: 'Forced Captures',
        winConditions: 'Win & Lose',
      },
      objective:
        "Capture all your opponent's pieces or block them so they have no legal moves.",
      steps:
        "Players take turns moving one piece diagonally forward.\nLight pieces move up; dark pieces move down.\nA piece can move to an empty adjacent diagonal square.\nTo capture, jump over an opponent's piece to the empty square beyond it.",
      kingPromotion:
        'When a man reaches the opposite end of the board, it becomes a king.\nKings can move and capture in any diagonal direction (forward and backward).\nKings can also slide multiple squares in one direction (flying kings in International and Russian rulesets).',
      backwardCaptures:
        'In some rulesets, regular pieces (men) can capture opponent pieces behind them.\nMen always move forward, but can capture in any diagonal direction when backward captures are enabled.\nThis option is always on in International rules and can be toggled in other variants.',
      forcedCaptures:
        'If a capture is available, the player must take it.\nIf multiple captures are available, the player must choose one.\nA multi-jump chain must be completed in full — you cannot stop early if more captures are available.',
      winConditions:
        'You WIN when:\n• You capture all opponent pieces\n• The opponent has no legal moves on their turn\n\nYou LOSE when:\n• All your pieces are captured\n• You have no legal moves on your turn\n\nThe game is a DRAW when both players have only kings with equal material and neither can force a win.',
    },
    gameOver: {
      won: 'Victory!',
      lost: 'Defeat',
      draw: 'Draw',
      messages: {
        won: 'Congratulations, you won!',
        lost: 'Better luck next time!',
        draw: 'The game ended in a draw.',
      },
    },
    actions: {
      movePiece: 'Move',
      forfeit: 'Forfeit',
    },
    errors: {
      notYourTurn: 'Not your turn',
      invalidMove: 'Invalid move',
      captureRequired: 'Capture is required',
      noPieceSelected: 'Select a piece first',
    },
    status: {
      yourTurn: 'Your turn',
      waiting: 'Waiting for opponent...',
    },
  },
};

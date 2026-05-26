export const enMessages = {
  tic_tac_toe_v1: {
    name: 'Tic-Tac-Toe',
    description: 'Classic 3-in-a-row with themed variants and 3×3 – 9×9 boards',
    summary:
      'Drop a mark, line up the win-length, and play across six themed variants.',
    variants: {
      classic: {
        name: 'Classic',
        description: 'Crisp black grid on paper white',
      },
      neon: { name: 'Neon', description: 'Glowing violet and cyan marks' },
      paper: { name: 'Paper', description: 'Handwritten on warm parchment' },
      pixel: { name: 'Pixel', description: 'Retro 8-bit greens' },
      chalkboard: {
        name: 'Chalkboard',
        description: 'Loose chalk strokes on slate',
      },
      retro: { name: 'Retro TV', description: 'Sunset amber and warm red' },
    },
    landing: {
      meta: {
        title: 'Tic-Tac-Toe — multiplayer with 3×3, 5×5, 7×7, 9×9 boards',
        description:
          'Play multiplayer Tic-Tac-Toe online. Six themed variants, 2–4 players, optional teams, bots from day one. Free, instant rooms, no install.',
        keywords:
          'tic tac toe, tic-tac-toe online, multiplayer tic tac toe, gomoku, 5 in a row, board games',
      },
      hero: {
        title: 'Tic-Tac-Toe — picked, polished, multiplayer',
        subtitle:
          'Themed boards, teams, and bots. Hop in alone or with friends, on 3×3 through 9×9.',
        createRoom: 'Create a room',
        browseRooms: 'Browse rooms',
      },
      highlights: {
        players: {
          title: '2–4 players',
          body: 'Free-for-all or teams; bots fill empty seats so you never wait.',
        },
        sizes: {
          title: '4 board sizes',
          body: '3×3 quick rounds up to 9×9 epic five-in-a-row games.',
        },
        themes: {
          title: '6 themed variants',
          body: 'Classic, Neon, Paper, Pixel, Chalkboard, Retro TV.',
        },
      },
      steps: {
        create: {
          title: 'Create a room',
          body: 'Pick a variant and board size. Public or invite-only.',
        },
        join: {
          title: 'Invite a friend or add a bot',
          body: 'Share the link or click “Start with bots” for instant play.',
        },
        play: {
          title: 'Play and chat',
          body: 'Take turns, line up the win-length, and chat through every move.',
        },
      },
      themes: {
        title: 'Pick a vibe',
        subtitle: 'Each variant restyles the board, marks, and grid.',
      },
      faq: {
        sizes: {
          question: 'How does board size change the rules?',
          answer:
            'The win-length scales with the board: 3 in a row on 3×3, 4 in a row on 5×5, 5 in a row on both 7×7 and 9×9.',
        },
        teams: {
          question: 'Can we play in teams?',
          answer:
            'Yes — toggle team mode in the lobby. Up to 4 players split into two teams; team members share a mark and alternate turns.',
        },
        bots: {
          question: 'Are the bots good?',
          answer:
            'On 3×3 the bot plays perfect minimax — it never loses. On 5×5 it blocks immediate threats and biases the centre. On 7×7 and 9×9 it plays a fast win/block heuristic with random spacing.',
        },
      },
    },
    lobby: {
      boardSize: 'Board size',
      teamMode: 'Team mode',
      startWithBots: 'Start with bots',
      addBot: 'Add bot',
      waitingForPlayers: 'Waiting for players…',
      minPlayers: 'Minimum 2 players',
    },
    rules: {
      title: 'Rules',
      objective:
        'Be the first to place your mark in {{winLength}} cells in a row — horizontal, vertical, or diagonal.',
      steps:
        '• On your turn, click an empty cell.\n• Win by completing a line.\n• If the board fills up with no winner, the round is a draw.',
      winLengths: 'Win-length per board: 3×3 → 3, 5×5 → 4, 7×7 → 5, 9×9 → 5.',
      headers: {
        objective: 'Objective',
        howToPlay: 'How to play',
        boardSizes: 'Board sizes',
      },
      inARow: '{{n}} in a row',
    },
    gameOver: {
      won: 'You won!',
      lost: 'You lost.',
      draw: 'Draw.',
      you: 'You',
      team: '{{name}} team',
      messages: {
        won: 'You completed the line first. Ready for another round?',
        lost: 'The other side closed the line. Want a rematch?',
        draw: 'Neither side could close a line. Try a different board?',
      },
    },
    actions: {
      place: 'Place mark',
      rematch: 'Rematch',
      leave: 'Leave',
      forfeit: 'Forfeit',
    },
    chat: {
      markPlaced: '{{name}} placed a mark at ({{row}},{{col}})',
      won: '{{name}} wins the round!',
      draw: 'Round ends in a draw.',
      joined: '{{name}} joined.',
      left: '{{name}} left.',
      forfeit: '{{name}} forfeited.',
    },
    errors: {
      notYourTurn: 'Not your turn yet.',
      cellTaken: 'That cell is already taken.',
      gameOver: 'The game has ended.',
      gameNotStarted: 'The game has not started.',
    },
    status: {
      turn: '{{player}}’s turn',
      winner: '{{player}} won',
      draw: 'Draw',
    },
    score: {
      x: 'X wins',
      o: 'O wins',
      draws: 'Draws',
    },
  },
};

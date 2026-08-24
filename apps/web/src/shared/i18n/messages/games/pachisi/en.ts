export const enMessages = {
  pachisi_v1: {
    name: 'Pachisi',
    description:
      'Classic cross-and-circle race game — roll a six, capture rivals, and bring all your tokens home',
    summary:
      'Roll the die, race your tokens around the board, capture rivals, and be first to bring them all home!',
    variants: {
      standard: {
        name: 'Standard',
        description: 'Classic rules with four tokens each',
      },
      quick: {
        name: 'Quick',
        description: 'Faster match with two tokens each',
      },
    },
    landing: {
      meta: {
        title: 'Pachisi — Free Online Multiplayer Race Board Game | Arcadeum',
        description:
          'Play Pachisi (Ludo) online for free on Arcadeum. Roll a six to launch your tokens, capture rivals, dodge danger, and race all four home. 2–4 players, AI bots, themed boards.',
        keywords:
          'pachisi, ludo, board game, dice, multiplayer, online, free, family, race, classic',
      },
      hero: {
        title: 'Pachisi',
        subtitle:
          'The timeless chase game. Roll a six, launch your tokens, and capture rivals on your way home!',
        ctaQuickplay: 'Play vs AI',
        ctaQuickplayError: 'Failed to create game',
        createRoom: 'Create Room',
        browseRooms: 'Browse Rooms',
      },
      highlights: {
        players: { title: '2–4 Players', body: 'Race friends or AI bots' },
        dice: {
          title: 'Sixes & Extra Rolls',
          body: 'Roll a six to leave the yard — and roll again instantly',
        },
        capture: {
          title: 'Capture Rivals',
          body: 'Land on an opponent to send them back to the start',
        },
        safe: {
          title: 'Safe Star Cells',
          body: 'Star cells shield you — plan routes through protected ground.',
        },
      },
      steps: {
        create: {
          title: 'Create a Room',
          body: 'Choose your theme and start a match.',
        },
        join: {
          title: 'Invite Friends or Bots',
          body: 'Play together or practice against the AI.',
        },
        play: {
          title: 'Roll & Race Home',
          body: 'Launch tokens on a six, dodge captures, and finish first!',
        },
      },
      themes: {
        title: 'Visual Themes',
        subtitle: 'Play on beautiful cyber, retro, and fantasy boards.',
      },
      sections: {
        faqTitle: 'Frequently Asked Questions',
        faqKicker: 'FAQ',
        rulesKicker: 'Rulebook',
        themesKicker: 'Visual Customization',
        themesCta: 'Play Theme',
        highlightsTitle: 'Ancient Game, Modern Boards',
        highlightsKicker: 'Key Features',
        howToPlayTitle: 'How to Play Pachisi',
        howToPlayKicker: 'Quick Start',
        howToPlayIntro:
          'Master the fundamentals of launching, racing, capturing, and finishing.',
        finalCtaTitle: 'Roll a Six and Race Home',
        finalCtaSubtitle:
          'Challenge intelligent bots or play against friends in real-time matches.',
        backToGames: 'All Games',
        heroEyebrow: 'Classic Cross-and-Circle Race',
        heroIntro:
          'The timeless chase game of dice rolls, captures, and home stretches — easy to learn, endlessly replayable.',
        heroCategory: 'Board Game',
        playersBadge: '2–4 Players',
        durationBadge: '10–20 min',
        difficultyBadge: 'Casual',
        chipDiceRolls: 'Dice Rolls',
        chipCaptures: 'Captures',
        chipSafeStars: 'Safe Stars',
        chipAiBots: 'AI Bots',
        tipCreate: 'Configure themes, game modes, and invite options.',
        tipJoin: 'Play directly against friends or train with AI bots.',
        tipPlay:
          'Roll a six to launch, capture rivals mid-race, and reach home first.',
      },
      faq: {
        gameOver: {
          won: 'Victory!',
          lost: 'Defeat',
          draw: 'Draw',
          messages: {
            won: 'All your tokens are home — first place!',
            lost: 'Someone raced you to it. Better luck next time!',
            draw: 'The game ended in a draw.',
          },
        },
        rules: {
          question: 'How do you win at Pachisi?',
          answer:
            'Move all of your tokens out of the yard, once around the board, up your home lane, and into the center before any other player.',
        },
        capture: {
          question: 'What happens when a token is captured?',
          answer:
            'Landing on a cell occupied by an opponent sends their token back to its yard. Star cells and start cells are safe from captures.',
        },
        sixes: {
          question: 'What does rolling a six do?',
          answer:
            'A six lets you move a token out of the yard onto the board — and grants an extra roll. Three sixes in a row void the turn.',
        },
        botAI: {
          question: 'How does the AI work?',
          answer:
            'The AI weighs exits, captures, safe landings, and danger zones to give you a genuine challenge at every difficulty tier.',
        },
      },
    },
    lobby: {
      variant: 'Theme',
      ruleVariant: 'Game Mode',
      rules: 'Game Rules',
      startWithBots: 'Start with Bot',
      aiDifficulty: 'AI Difficulty',
      ruleVariants: {
        standard: {
          name: 'Standard',
          description:
            'The classic race: four tokens each, captures, safe stars, and extra rolls on sixes.',
        },
        quick: {
          name: 'Quick',
          description:
            'Same rules with just two tokens per player — a fast, punchy match.',
        },
      },
    },
    game: {
      rollDice: 'Roll Die',
      rolling: 'Rolling...',
      diceRolled: 'Rolled',
      yourTurnToRoll: 'Your turn to roll the die',
      yourTurnToMove: 'Your turn to move a token',
      waitingForOpponentRoll: 'Waiting for opponent to roll...',
      waitingForOpponentMove: 'Waiting for opponent to move...',
      tokensHome: 'Home',
      captured: 'Captured!',
      noLegalMoves: 'No legal moves with this roll',
      tapToken: 'Tap a highlighted token to move it',
      moveTokenAria: 'Move token {{id}}',
      dieValue: 'Die showing {{value}}',
    },
    tutorial: {
      s1: {
        title: 'Six gets you out',
        body: 'Roll a die on your turn and move one token. You need a 6 to leave the yard — and rolling it grants another roll.',
      },
      s2: {
        title: 'Send them home',
        body: "Land on an opponent's token to send it back to its yard. Star cells and start cells are safe havens.",
      },
      s3: {
        title: 'March them home',
        body: 'Lap the board clockwise, climb your colored home lane and tuck every token into the center to win.',
      },
      s4: {
        title: 'Greed has a price',
        body: 'Rolling three 6s in a row forfeits your whole turn — sometimes the safe play is best.',
      },
    },
    rules: {
      title: 'Pachisi Rules',
      objectiveTitle: 'Objective',
      objective:
        'Race all of your tokens from your yard, clockwise around the board, up your colored home lane, and into the center. The first player to get every token home wins.',
      movementTitle: 'Rolling & Moving',
      movement:
        'On your turn, roll one die and move one token by that many cells. You must roll a 6 to move a token out of your yard onto your start cell.',
      captureTitle: 'Captures & Safe Cells',
      capture:
        'Landing on a cell held by an opponent sends their token back to the yard. Star cells and your own start cell are safe — nobody can capture you there.',
      sixesTitle: 'Sixes',
      sixes:
        'Rolling a 6 grants another roll. Rolling three 6s in a row forfeits the turn entirely.',
    },
  },
};

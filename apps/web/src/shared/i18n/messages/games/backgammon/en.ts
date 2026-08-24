export const enMessages = {
  backgammon_v1: {
    name: 'Backgammon',
    description:
      'Classic 24-point board game with dice rolls, bearing off, and bar hits',
    summary:
      'Roll dice, maneuver checkers around the board, hit opponent blots, and bear off all checkers first!',
    variants: {
      standard: {
        name: 'Standard',
        description: 'Traditional backgammon rules with hitting and bar entry',
      },
      long: {
        name: 'Long Nardy',
        description:
          'Traditional Russian Long Nard with head limits and no hitting',
      },
      hyper: {
        name: 'Hypergammon',
        description: 'Fast-paced tactical match with 3 checkers each',
      },
      tavla: {
        name: 'Tavla',
        description: 'Turkish Tavla speed rules with rapid race dynamics',
      },
      nackgammon: {
        name: 'Nackgammon',
        description:
          'Strategic variant with 2 checkers on point 23 reducing runaway rolls',
      },
      gulbara: {
        name: 'Gulbara',
        description:
          'Classic no-hitting variant where doubles play all subsequent pairs',
      },
    },
    landing: {
      meta: {
        title: 'Backgammon — Free Multiplayer Board Game | Arcadeum',
        description:
          'Play Backgammon online for free on Arcadeum. Classic 24-point board with dice rolls, bearing off, hitting blots to the bar, and AI opponents.',
        keywords:
          'backgammon, tavla, nardi, board game, multiplayer, online, free, strategy, dice',
      },
      hero: {
        title: 'Backgammon',
        subtitle:
          'Classic race and strategy on a 24-point board. Roll, hit, bear off, and win!',
        ctaQuickplay: 'Play vs AI',
        ctaQuickplayError: 'Failed to create game',
        createRoom: 'Create Room',
        browseRooms: 'Browse Rooms',
      },
      highlights: {
        players: { title: '2 Players', body: 'Head-to-head strategic race' },
        dice: {
          title: 'Dice & Doubles',
          body: 'Roll pairs, get 4 moves on doubles, and plan your route',
        },
        bearOff: {
          title: 'Bearing Off',
          body: 'Bring all checkers home and clear the board to win',
        },
      },
      steps: {
        create: {
          title: 'Create a Room',
          body: 'Choose your theme and start a match.',
        },
        join: {
          title: 'Invite a Friend or Bot',
          body: 'Play with friends or test your skills against AI.',
        },
        play: {
          title: 'Roll & Race',
          body: 'Roll dice, advance checkers, hit opponent blots, and bear off!',
        },
      },
      themes: {
        title: 'Visual Themes',
        subtitle: 'Play on beautiful cyber, retro, and fantasy boards.',
      },
      faq: {
        rules: {
          question: 'How do you win at Backgammon?',
          answer:
            'Move all 15 of your checkers into your home board and bear them off before your opponent does.',
        },
        hitting: {
          question: 'What happens when a checker is hit?',
          answer:
            'Landing on a point with a single opponent checker (blot) sends it to the bar. The opponent must enter that checker from the bar before making any other moves.',
        },
        doubles: {
          question: 'What happens when rolling doubles?',
          answer:
            'When you roll two identical numbers (e.g. 4-4), you get to play that number four times instead of two.',
        },
        botAI: {
          question: 'How does the AI work?',
          answer:
            'The AI calculates tactical positions, safe anchors, pip race counts, and blot avoidance to provide an authentic challenge.',
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
            'Classic 15-checker backgammon with hitting blots to the bar and bearing off.',
        },
        long: {
          name: 'Long Nardy',
          description:
            'Traditional Russian Long Nard: all 15 checkers start on the head with no hitting.',
        },
        hyper: {
          name: 'Hypergammon',
          description:
            'High-speed tactical blitz where each player commands just 3 checkers.',
        },
        tavla: {
          name: 'Tavla',
          description:
            'Turkish speed backgammon with fast race pace and hit-and-run tactics.',
        },
        nackgammon: {
          name: 'Nackgammon',
          description:
            'Tactical opening with 2 checkers on point 23 creating deeper strategic gameplay.',
        },
        gulbara: {
          name: 'Gulbara',
          description:
            'Greek/Middle Eastern variant with no hitting where doubles play all subsequent pairs.',
        },
      },
    },
    game: {
      rollDice: 'Roll Dice',
      rolling: 'Rolling...',
      diceRolled: 'Rolled',
      yourTurnToRoll: 'Your turn to roll the dice',
      yourTurnToMove: 'Your turn to move checkers',
      waitingForOpponentRoll: 'Waiting for opponent to roll...',
      waitingForOpponentMove: 'Waiting for opponent to move...',
      barCount: 'Bar',
      offCount: 'Borne Off',
      pipCount: 'Pips',
      movesRemaining: 'moves left',
      noLegalMoves: 'No legal moves with rolled dice',
      checkerMoved: 'Moved checker',
      checkerHit: 'Blot hit to bar!',
    },
    tutorial: {
      s1: {
        title: 'Roll and march',
        body: 'Roll two dice and move your checkers the shown pips. Doubles let you play the number four times.',
      },
      s2: {
        title: 'Hit blots',
        body: 'A lone checker is a blot — land on it to send it to the bar. Checkers on the bar must re-enter before anything else may move.',
      },
      s3: {
        title: 'Bear off to win',
        body: 'Bring all fifteen checkers into your home board, then roll them off. First to bear off all fifteen wins.',
      },
      s4: {
        title: 'Between rolls',
        body: 'Sound, music, fullscreen and the full Rules book live in this panel.',
      },
    },
    rules: {
      title: 'Backgammon Rules',
      objectiveTitle: 'Objective',
      objective:
        'The objective of Backgammon is to move all fifteen checkers into your home board and then bear them off. The first player to bear off all checkers wins the game.',
      movementTitle: 'Movement & Dice',
      movement:
        'Players alternate turns rolling two dice. Checkers move forward according to the rolled numbers. Rolling doubles allows playing the rolled number four times.',
      hittingTitle: 'Hitting & Entering',
      hitting:
        'A point occupied by a single checker is a blot. Landing on a blot hits it to the bar. A player with checkers on the bar must enter them into the opponent home board before moving any other pieces.',
      bearingOffTitle: 'Bearing Off',
      bearingOff:
        'Once all 15 checkers are inside your home board, you can bear them off by rolling the exact point number or higher if no checkers remain further back.',
    },
  },
};

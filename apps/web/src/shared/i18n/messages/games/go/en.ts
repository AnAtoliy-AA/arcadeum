export const enMessages = {
  go_v1: {
    name: 'Go',
    description:
      'Classic Go on 9×9, 13×13 and 19×19 boards with captures, ko rule and area scoring',
    summary:
      'Surround territory, capture groups, and outplay your opponent on the most elegant board game ever invented!',
    landing: {
      meta: {
        title: 'Go — Free Online Multiplayer Board Game | Arcadeum',
        description:
          'Play Go online for free on Arcadeum. Classic Baduk/Weiqi rules on 9×9, 13×13 and 19×19 boards with captures, ko rule, area scoring and AI opponents.',
        keywords:
          'go, baduk, weiqi, igo, board game, multiplayer, online, free, strategy, ancient',
      },
      hero: {
        title: 'Go',
        subtitle:
          'The ancient game of surrounding territory. Simple rules, infinite depth.',
        ctaQuickplay: 'Play vs AI',
        ctaQuickplayError: 'Failed to create game',
        createRoom: 'Create Room',
        browseRooms: 'Browse Rooms',
      },
      highlights: {
        players: { title: '2 Players', body: 'Pure head-to-head strategy' },
        boards: {
          title: 'Three Boards',
          body: 'Learn on 9×9, improve on 13×13, master 19×19',
        },
        captures: {
          title: 'Captures & Ko',
          body: 'Surround groups to remove them — the ko rule keeps it fair',
        },
        botAI: {
          title: 'AI Opponents',
          body: 'Four difficulty tiers, from friendly randoms to MCTS search',
        },
      },
      steps: {
        create: {
          title: 'Create a Room',
          body: 'Pick a board size and theme, then share the link with a friend.',
          tip: 'Tip: start on 9×9 if you are new to Go.',
        },
        join: {
          title: 'Invite Your Opponent',
          body: 'Or fill an empty seat with an AI bot at any difficulty.',
          tip: 'Black always plays first.',
        },
        play: {
          title: 'Surround & Capture',
          body: 'Place stones, surround territory, capture groups — two passes end the game and area scoring decides the winner.',
          tip: 'Komi of 7.5 points compensates white for moving second.',
        },
      },
      themes: {
        title: 'Play in Your Style',
        subtitle:
          'Every shared Arcadeum theme is available — the board adapts to your vibe.',
      },
      sections: {
        faqTitle: 'Frequently Asked Questions',
        faqKicker: 'FAQ',
        rulesTitle: 'Official Go Rules',
        rulesKicker: 'Rulebook',
        themesKicker: 'Visual Customization',
        highlightsTitle: 'Simple Rules, Infinite Depth',
        highlightsKicker: 'Key Features',
        howToPlayTitle: 'How to Play Go',
        howToPlayKicker: 'Quick Start',
        howToPlayIntro:
          'Learn the fundamentals of territory, captures and scoring.',
        relatedTitle: 'More Board Games',
        relatedKicker: 'Discover',
        finalCtaTitle: 'Surround More, Win More',
        finalCtaSubtitle:
          'Challenge intelligent bots or play against friends in real-time matches.',
        backToGames: 'All Games',
        heroEyebrow: 'The Ancient Game of Territory',
        heroIntro:
          'Place stones, surround territory and capture groups on the most elegant strategy board ever made.',
        heroCategory: 'Board Game',
        playersBadge: '2 Players',
        durationBadge: '10–40 min',
        difficultyBadge: 'Deep Strategy',
        chipTerritory: 'Captures',
        chipKoRule: 'Ko Rule',
        chipAreaScoring: 'Area Scoring',
        chipAiBots: 'AI Bots',
      },
      faq: {
        whatIsGo: {
          question: 'What is Go?',
          answer:
            'Go (also known as Baduk or Weiqi) is an ancient board game where two players place black and white stones to surround more territory than their opponent. Its rules take minutes to learn, yet its strategy is deeper than chess.',
        },
        scoring: {
          question: 'How is the winner decided?',
          answer:
            'Arcadeum uses Chinese area scoring: your score is the number of your stones on the board plus empty points fully surrounded by your stones. White receives 7.5 komi points for moving second, so draws are impossible.',
        },
        koRule: {
          question: 'What is the ko rule?',
          answer:
            'You cannot immediately recapture in a way that recreates the previous board position. After a single-stone ko capture you must play elsewhere first — the forbidden point is marked on the board.',
        },
        boardSize: {
          question: 'Which board size should I choose?',
          answer:
            '9×9 games finish in about 10 minutes and are perfect for learning. 13×13 is a middle ground, while 19×19 is the classic full-size experience used in professional play.',
        },
      },
    },
    lobby: {
      boardSize: 'Board size',
      boardSizeHint: '9×9 ≈ 10 min · 13×13 ≈ 20 min · 19×19 ≈ 40+ min',
      startWithBots: 'Start with bots',
    },
    status: {
      yourTurn: 'Your turn',
      playerTurn: "{{name}}'s turn",
      waiting: 'Waiting…',
      gameOver: 'Game over',
    },
    game: {
      pass: 'Pass',
    },
    board: {
      ariaLabel: 'Go board ({{size}}×{{size}})',
    },
    gameOver: {
      won: 'Victory! You surrounded more territory.',
      lost: 'Defeat — your opponent controlled more area.',
      draw: 'Draw — perfectly balanced board.',
    },
    tutorial: {
      s1: {
        title: 'Surround territory',
        body: 'Place stones to fence off empty points. When both players pass, the bigger area wins — White starts with komi compensation.',
      },
      s2: {
        title: 'Cut off liberties',
        body: 'A group with no adjacent empty points (liberties) is captured and removed. Surround enemy stones to strip their last liberty.',
      },
      s3: {
        title: 'Mind the ko rule',
        body: 'You cannot instantly recapture in a way that recreates the previous position — play elsewhere first. Two consecutive passes end the game.',
      },
      s4: {
        title: 'Tools of the trade',
        body: 'Sound, music, fullscreen and the Rules book live here while you plot your next move.',
      },
    },
    rules: {
      title: 'Go Rules',
      objectiveTitle: 'Objective',
      objective:
        'Control more territory than your opponent by surrounding empty points and capturing enemy groups.',
      captureTitle: 'Captures',
      capture:
        'A group with no remaining adjacent empty points (liberties) is captured and removed from the board.',
      koTitle: 'Ko Rule',
      ko: 'Immediately recapturing a single stone that would recreate the previous position is forbidden — play elsewhere first.',
      passTitle: 'Passing',
      pass: 'Two consecutive passes end the game. Pass when no valuable move remains.',
      scoringTitle: 'Scoring',
      scoring:
        'Chinese area scoring: stones + surrounded territory, white starts with 7.5 komi points.',
    },
  },
};

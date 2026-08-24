export const enMessages = {
  hearts_v1: {
    name: 'Hearts',
    description:
      'Classic 4-player trick-taking card game — avoid penalty cards and shoot the moon',
    summary:
      'Pass cards strategically, follow suit, dump Hearts and the Queen of Spades, and try to shoot the moon!',
    variants: {},
    landing: {
      meta: {
        title: 'Hearts — Free Multiplayer Card Game | Arcadeum',
        description:
          'Play Hearts online for free on Arcadeum. Classic 4-player trick-taking card game with passing, Hearts, Queen of Spades, and AI opponents.',
        keywords:
          'hearts, card game, trick-taking, multiplayer, online, free, strategy, queen of spades',
      },
      hero: {
        title: 'Hearts',
        subtitle:
          'Classic trick-taking card game for 4 players. Pass, duck, and shoot the moon!',
        ctaQuickplay: 'Play vs AI',
        ctaQuickplayError: 'Failed to create game',
        createRoom: 'Create Room',
        browseRooms: 'Browse Rooms',
      },
      highlights: {
        players: {
          title: '4 Players',
          body: 'Classic four-player trick-taking',
        },
        passing: {
          title: 'Card Passing',
          body: 'Pass 3 cards each hand — Left, Right, Across, then Hold',
        },
        shooting: {
          title: 'Shoot the Moon',
          body: 'Take all 26 penalty points to make opponents score them instead',
        },
      },
      steps: {
        create: {
          title: 'Create a Room',
          body: 'Choose your theme and start a match.',
        },
        join: {
          title: 'Invite Friends or Bots',
          body: 'Play with 3 friends or fill seats with AI bots.',
        },
        play: {
          title: 'Pass, Play & Score',
          body: 'Pass cards, follow suit, avoid Hearts and the Queen of Spades!',
        },
      },
      themes: {
        title: 'Visual Themes',
        subtitle: 'Play on beautiful cyber, retro, and fantasy tables.',
      },
      sections: {
        faqTitle: 'Frequently Asked Questions',
        faqKicker: 'FAQ',
        rulesTitle: 'How to Play',
        rulesKicker: 'Rules',
        themesKicker: 'Themes',
        highlightsTitle: 'Why Play Hearts?',
        highlightsKicker: 'Highlights',
        howToPlayTitle: 'Getting Started',
        howToPlayKicker: 'Quick Start',
        finalCtaTitle: 'Pass, Play & Shoot the Moon',
        finalCtaSubtitle:
          'Challenge intelligent bots or play against friends in real-time matches.',
        backToGames: 'All Games',
        heroEyebrow: 'Classic 4-Player Trick-Taking',
        heroIntro:
          'A strategic card game of passing, following suit, and avoiding penalty points.',
        heroCategory: 'Card Game',
        playersBadge: '4 Players',
        durationBadge: '20–30 min',
        difficultyBadge: 'Strategy',
        chipTrickTaking: 'Trick-Taking',
        chipCardPassing: 'Card Passing',
        chipShootTheMoon: 'Shoot the Moon',
        chipAiBots: 'AI Bots',
        tipCreate: 'Choose your visual theme and configure options.',
        tipJoin: 'Play with friends or fill seats with AI bots.',
        tipPlay:
          'Pass cards, follow suit, avoid Hearts and the Queen of Spades!',
      },
      faq: {
        rules: {
          question: 'How do you win at Hearts?',
          answer:
            'The game ends when any player reaches 100 points. The player with the lowest score wins. You score points by taking Hearts (1 each) and the Queen of Spades (13).',
        },
        shooting: {
          question: 'What is Shooting the Moon?',
          answer:
            'If you take ALL 26 penalty points in a hand (all 13 Hearts + Queen of Spades), you score 0 and every opponent scores 26.',
        },
        passing: {
          question: 'How does card passing work?',
          answer:
            'Before each hand, you select 3 cards to pass. The direction rotates: Left, Right, Across, then Hold (no pass). On the Hold hand, no cards are passed.',
        },
        breaking: {
          question: 'When can you lead Hearts?',
          answer:
            'Hearts cannot lead a trick until they have been "broken" — meaning a Heart has been discarded on a previous trick. Once broken, any Heart may lead.',
        },
      },
    },
    lobby: {
      variant: 'Theme',
      rules: 'Game Rules',
      startWithBots: 'Start with Bot',
      aiDifficulty: 'AI Difficulty',
      passingEnabled: 'Card Passing',
      targetScore: 'Target Score',
    },
    passDirection: {
      left: 'Pass Left',
      right: 'Pass Right',
      across: 'Pass Across',
      hold: 'No Pass',
    },
    gameOver: {
      won: 'You won!',
      lost: 'You lost.',
      draw: 'It is a draw.',
      messages: {
        won: 'Lowest score at the table — well played!',
        lost: 'Someone else kept a cleaner sheet. Want a rematch?',
        draw: 'Tied on points. Try another?',
      },
    },
    game: {
      yourTurn: 'Your turn to play',
      waitingForOpponent: 'Waiting for opponent...',
      selectCardsToPass: 'Select 3 cards to pass',
      passCards: 'Pass Cards',
      followSuit: 'You must follow suit',
      gameOver: 'Game Over',
      passingPhase: 'Passing phase',
      playerTurn: "{{player}}'s turn",
      handLabel: 'Hand {{n}}',
      trickLabel: 'Trick {{n}}',
      heartsBroken: 'Hearts broken',
    },
    card: {
      name: '{{rank}} of {{suit}}',
      ranks: {
        two: 'Two',
        three: 'Three',
        four: 'Four',
        five: 'Five',
        six: 'Six',
        seven: 'Seven',
        eight: 'Eight',
        nine: 'Nine',
        ten: 'Ten',
        jack: 'Jack',
        queen: 'Queen',
        king: 'King',
        ace: 'Ace',
      },
      suits: {
        spades: 'Spades',
        hearts: 'Hearts',
        diamonds: 'Diamonds',
        clubs: 'Clubs',
      },
    },
    tutorial: {
      s1: {
        title: 'Dodge the points',
        body: 'Follow suit when you can; the highest card of the lead suit takes the trick — and every penalty card in it.',
      },
      s2: {
        title: 'Fear the Queen',
        body: 'Hearts cost 1 point each; the Queen of Spades a brutal 13. Before each hand, pass dangerous cards left, right, across, then hold.',
      },
      s3: {
        title: 'Shoot the moon',
        body: 'Feeling brave? Capture all 26 points to zero your own score and slap 26 onto everyone else.',
      },
      s4: {
        title: 'Count what is gone',
        body: 'Track which suits have been played, manage sound and music, and open the Rules book whenever in doubt.',
      },
    },
    rules: {
      title: 'Hearts Rules',
      objectiveTitle: 'Objective',
      objective:
        'Avoid taking penalty points. Each Heart is worth 1 point and the Queen of Spades is worth 13 points. When any player reaches 100 points, the player with the lowest score wins.',
      setupTitle: 'Setup',
      setup:
        '4 players receive 13 cards each from a standard 52-card deck. The player holding the 2 of Clubs leads the first trick.',
      passingTitle: 'Card Passing',
      passing:
        'Before each hand, players pass 3 cards: Left, Right, Across, then Hold (no pass). The direction rotates each hand.',
      gameplayTitle: 'Gameplay',
      gameplay:
        'Follow the lead suit if possible. If void in the lead suit, play any card. Hearts cannot lead until broken. The Queen of Spades may lead once legal.',
      scoringTitle: 'Scoring',
      scoring:
        'Each Heart = 1 point. Queen of Spades = 13 points. Shooting the Moon: take all 26 points to score 0 while opponents each score 26.',
    },
  },
};

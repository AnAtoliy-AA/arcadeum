export const enMessages = {
  spades_v1: {
    name: 'Spades',
    description:
      'Classic 4-player partnership card game — bid your tricks and let spades trump',
    summary:
      'Bid how many tricks you will take, team up across the table, and let spades trump!',
    variants: {},
    landing: {
      meta: {
        title: 'Spades — Free Multiplayer Card Game | Arcadeum',
        description:
          'Play Spades online for free on Arcadeum. Classic 4-player partnership trick-taking card game with bidding, nil bids, bags, and AI opponents.',
        keywords:
          'spades, card game, trick-taking, multiplayer, online, free, strategy, bidding, nil',
      },
      hero: {
        title: 'Spades',
        subtitle:
          'Classic partnership card game for 4 players. Bid, play, and let spades trump!',
        ctaQuickplay: 'Play vs AI',
        ctaQuickplayError: 'Failed to create game',
        createRoom: 'Create Room',
        browseRooms: 'Browse Rooms',
      },
      highlights: {
        players: {
          title: '2v2 Partnerships',
          body: 'Team up with the player across the table',
        },
        bidding: {
          title: 'Bidding & Nil',
          body: 'Bid your tricks — or risk it all on a Nil bid',
        },
        sandbagging: {
          title: 'Sandbag Penalty',
          body: 'Overtricks become bags; every 10 bags costs 100 points',
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
          title: 'Bid, Play & Score',
          body: 'Follow suit, win your bids, and avoid extra bags!',
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
        highlightsTitle: 'Why Play Spades?',
        highlightsKicker: 'Highlights',
        howToPlayTitle: 'Getting Started',
        howToPlayKicker: 'Quick Start',
        finalCtaTitle: 'Bid Smart & Take Your Tricks',
        finalCtaSubtitle:
          'Challenge intelligent bots or play against friends in real-time matches.',
        backToGames: 'All Games',
        heroEyebrow: 'Classic 4-Player Partnership Trick-Taking',
        heroIntro:
          'A strategic partnership game of bidding, following suit, and letting spades trump.',
        heroCategory: 'Card Game',
        playersBadge: '4 Players · 2v2',
        durationBadge: '30–45 min',
        difficultyBadge: 'Strategy',
        chipTrickTaking: 'Trick-Taking',
        chipPartnership: '2v2 Partnerships',
        chipBidding: 'Bidding & Nil',
        chipAiBots: 'AI Bots',
        tipCreate: 'Choose your visual theme and configure options.',
        tipJoin: 'Play with friends or fill seats with AI bots.',
        tipPlay: 'Bid your tricks, follow suit, and let spades trump!',
      },
      faq: {
        rules: {
          question: 'How do you win at Spades?',
          answer:
            'Teams score points by making their combined bid (10 points per bid trick plus one per overtrick). The first team to reach the target score — usually 500 — wins the game.',
        },
        nil: {
          question: 'What is a Nil bid?',
          answer:
            'A Nil bid means you promise to take zero tricks. Succeed and your team gains 100 bonus points; fail and it loses 100. Your partner still plays to make their own bid.',
        },
        breaking: {
          question: 'When can you lead Spades?',
          answer:
            'Spades cannot lead a trick until they have been "broken" — meaning a player who was void in the led suit discarded a spade. Once broken, any spade may lead.',
        },
        bags: {
          question: 'What are bags?',
          answer:
            'Each overtrick beyond your team bid counts as a bag. Every time a team accumulates 10 bags, 100 points are deducted from its score — so bidding accurately matters.',
        },
      },
    },
    lobby: {
      variant: 'Theme',
      rules: 'Game Rules',
      startWithBots: 'Start with Bot',
      aiDifficulty: 'AI Difficulty',
      nilEnabled: 'Allow Nil bids',
      targetScore: 'Target Score',
    },
    gameOver: {
      won: 'You won!',
      lost: 'You lost.',
      draw: 'It is a draw.',
      messages: {
        won: 'Your partnership took exactly what it promised — well played!',
        lost: 'The other duo out-bid you this time. Want a rematch?',
        draw: 'Both teams finished level. Try another?',
      },
    },
    game: {
      yourTurn: 'Your turn to play',
      waitingForOpponent: 'Waiting for opponent...',
      selectBid: 'Place your bid',
      confirmBid: 'Confirm Bid',
      nilBid: 'Nil',
      bidsLabel: 'Bids',
      bagsLabel: 'Bags',
      partnerLabel: 'Partner',
      followSuit: 'You must follow suit',
      gameOver: 'Game Over',
      biddingPhase: 'Bidding phase',
      playerTurn: "{{player}}'s turn",
      handLabel: 'Hand {{n}}',
      trickLabel: 'Trick {{n}} of 13',
      spadesBroken: 'Spades broken',
      lastHand: 'Last hand: {{even}} even / {{odd}} odd',
      bidNil: 'Nil',
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
        title: 'Bid first',
        body: 'Before play, bid how many tricks you expect to win. Your partnership scores 10 × its combined bid when it delivers.',
      },
      s2: {
        title: 'Spades are trump',
        body: "Follow suit if you can; if void, any card goes. Spades can't lead until broken — but once they do, they beat everything.",
      },
      s3: {
        title: 'Nil is a gamble',
        body: 'Bid Nil to chase zero tricks for ±100 points — dump your spades early and duck everything.',
      },
      s4: {
        title: 'Bags bite back',
        body: 'Every overtrick is a bag: collect ten and it costs 100 points. First team to the target score wins.',
      },
    },
    rules: {
      title: 'Spades Rules',
      objectiveTitle: 'Objective',
      objective:
        'Fulfil your partnership bid. Teams earn 10 points per trick bid plus one point per overtrick; the first team to reach the target score wins.',
      setupTitle: 'Setup',
      setup:
        '4 players in fixed partnerships (seated opposite each other) receive 13 cards each from a standard 52-card deck.',
      biddingTitle: 'Bidding',
      bidding:
        'Each player bids the number of tricks they expect to win, starting with the player to the dealer\u2019s left. A bid of zero is a Nil bid worth \u00b1100 points.',
      gameplayTitle: 'Gameplay',
      gameplay:
        'The first bidder leads. Follow suit if possible; if void, play any card. Spades are always trump but cannot lead until broken. The highest spade wins, otherwise the highest led-suit card.',
      scoringTitle: 'Scoring',
      scoring:
        'Made bid: 10 \u00d7 team bid + one per overtrick. Missed bid: \u221210 \u00d7 team bid. Nil success adds 100, failure subtracts 100. Every 10 accumulated bags costs 100 points.',
    },
  },
};

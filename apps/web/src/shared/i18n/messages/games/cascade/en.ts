export const enMessages = {
  cascade_v1: {
    name: 'Cascade',
    description:
      'Match by color or number, chain Draw-Two and Draw-Four cards to flood the next player, and empty your hand first to win.',
    summary:
      'A shedding card game in the Crazy Eights family — four selectable themes, 2–10 players, full stacking penalties.',
    variants: {
      cosmic: {
        name: 'Cosmic',
        description: 'Star types, supernovas, and wormholes among the colors.',
      },
      arcane: {
        name: 'Arcane',
        description: 'Schools of magic — pyromancy, druidic, and more.',
      },
      cyberpunk: {
        name: 'Cyberpunk',
        description: 'Neon hacker factions: Crimson, Voltage, Matrix, Cobalt.',
      },
      elemental: {
        name: 'Elemental',
        description: 'Fire, Stone, Leaf, and Tide — clean nature palette.',
      },
    },
    landing: {
      meta: {
        title: 'Cascade — multiplayer shedding card game online',
        description:
          'Play Cascade online — a shedding card game with stacking Draw-Two / Wild +4 chains and four selectable visual themes. 2–10 players, free instant rooms, no install.',
        keywords:
          'cascade, crazy eights, multiplayer card game, online card game, shedding card game, matching card game',
      },
      hero: {
        title: 'Cascade — the stacking card game, reimagined',
        subtitle:
          'Match color or number. Chain penalties. Pick from four distinct visual themes. 2–10 players.',
        createRoom: 'Create a room',
        browseRooms: 'Browse rooms',
      },
      highlights: {
        players: {
          title: '2–10 players',
          body: 'Free-for-all rounds; bots fill empty seats so you can start instantly.',
        },
        themes: {
          title: '4 visual themes',
          body: 'Cosmic, Arcane, Cyberpunk, Elemental — the rules stay, the look changes.',
        },
        stacking: {
          title: 'Stacking penalties',
          body: 'Draw-Two onto Draw-Two; Wild +4 onto Wild +4. Make the next player drown.',
        },
      },
      steps: {
        create: {
          title: 'Create a room',
          body: 'Pick a theme. Public or invite-only.',
        },
        join: {
          title: 'Invite friends or add a bot',
          body: 'Share the link or start with bots for instant play.',
        },
        play: {
          title: 'Empty your hand',
          body: 'Match by color or number, save your wilds, and call Last Card.',
        },
      },
      themes: {
        title: 'Pick a vibe',
        subtitle: 'Same rules, four distinct color palettes and action icons.',
      },
      faq: {
        differences: {
          question: 'What kind of card game is Cascade?',
          answer:
            'Cascade is an original shedding card game in the Crazy Eights family. Match by color or number, chain Draw-Two and Wild Draw-Four cards to flood the next player, and empty your hand first to win. Card-game mechanics are not copyrightable; Cascade ships its own name, palettes, and iconography.',
        },
        stacking: {
          question: 'What is stacking?',
          answer:
            'When someone plays a Draw-Two on you, you can play another Draw-Two to pass the penalty +2 more onto the next player. Same with Wild Draw-Four onto Wild Draw-Four. If you can’t stack, you draw the whole accumulated pile and lose your turn.',
        },
        bots: {
          question: 'Are the bots good?',
          answer:
            'Bots prefer color-matching plays, save Wild +4 for stuck turns, and pick the color they hold the most of when naming after a wild. Casual but credible.',
        },
      },
    },
    lobby: {
      stacking: 'Allow stacking penalties',
      startWithBots: 'Start with bots',
      addBot: 'Add bot',
      waitingForPlayers: 'Waiting for players…',
      minPlayers: 'Minimum 2 players',
    },
    rules: {
      title: 'Rules',
      objective:
        'Be the first to empty your hand. Match the top of the discard pile by color or number, or play a Wild.',
      steps:
        '• On your turn, play any matching card or a Wild.\n• If you can’t play, draw 1 card.\n• First player to 0 cards wins.',
      actionCards:
        'Skip jumps the next player. Reverse flips direction (acts as Skip in 2-player). Draw-Two forces +2; Wild lets you change the active color; Wild +4 forces +4 and changes color.',
      stacking:
        'A Draw-Two can be passed on with another Draw-Two of any color. A Wild +4 can be passed on with another Wild +4. Cross-stacking (D2 onto +4 or vice versa) is not allowed.',
      headers: {
        objective: 'Objective',
        howToPlay: 'How to play',
        actionCards: 'Action cards',
        stacking: 'Stacking penalties',
      },
    },
    gameOver: {
      won: 'You won!',
      lost: 'You lost.',
      draw: 'Round ended.',
      messages: {
        won: 'You emptied your hand first. Ready for another round?',
        lost: 'Someone else got to zero first. Want a rematch?',
        draw: 'Round ended. Try another?',
      },
    },
    actions: {
      play: 'Play card',
      draw: 'Draw',
      nameColor: 'Choose color',
      rematch: 'Rematch',
      leave: 'Leave',
      forfeit: 'Forfeit',
    },
    chat: {
      played: '{{name}} played a card.',
      drew: '{{name}} drew a card.',
      drewStack: '{{name}} drew {{n}} from the stack.',
      namedColor: '{{name}} named {{color}}.',
      won: '{{name}} emptied their hand!',
      joined: '{{name}} joined.',
      left: '{{name}} left.',
      forfeit: '{{name}} forfeited.',
    },
    errors: {
      notYourTurn: 'Not your turn yet.',
      notPlayable: 'That card cannot be played right now.',
      colorRequired: 'Pick a color first.',
      gameOver: 'The game has ended.',
    },
    status: {
      turn: '{{player}}’s turn',
      winner: '{{player}} won',
      pendingDraw: '+{{n}} stacked',
      activeColor: 'Active color: {{color}}',
    },
  },
};

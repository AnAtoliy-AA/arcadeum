export const enMessages = {
  cat_dash_v1: {
    name: 'Cat Dash',
    description: 'A cat racing dice game with unique abilities and themes',
    summary:
      'Race your cat across the track, roll dice, use abilities, and be the first to cross the finish line!',
    variants: {
      neon: { name: 'Neon Cyber', description: 'Glowing cyberpunk cityscape' },
      village: {
        name: 'Classic Village',
        description: 'Cozy countryside racing',
      },
      space: { name: 'Space Cats', description: 'Zero-gravity cosmic race' },
      nature: { name: 'Nature Wild', description: 'Forest and meadow trails' },
    },
    landing: {
      meta: {
        title: 'Cat Dash — multiplayer cat racing dice game',
        description:
          'Play Cat Dash online for free. 2–6 players, unique cat characters, dice + powers, four themed tracks. Roll, race, win!',
        keywords:
          'cat game, dice game, racing game, multiplayer cat race, family game',
      },
      hero: {
        title: 'Cat Dash — race your cat to victory',
        subtitle:
          'Roll the dice, dodge obstacles, and use cat abilities to reach the finish line first.',
        ctaQuickplay: 'Play vs AI now',
        ctaQuickplayError: "Couldn't start a game — try again",
        createRoom: 'Create a room',
        browseRooms: 'Browse rooms',
      },
      highlights: {
        players: {
          title: '2–6 players',
          body: 'Race against friends or fill seats with bots. Never wait for a game.',
        },
        cats: {
          title: '6 unique cats',
          body: 'Each cat has special abilities that affect the race in different ways.',
        },
        themes: {
          title: '4 themed tracks',
          body: 'Neon Cyber, Classic Village, Space Cats, and Nature Wild.',
        },
      },
      steps: {
        create: {
          title: 'Create a room',
          body: 'Pick a track theme. Public or invite-only.',
        },
        join: {
          title: 'Invite a friend or add a bot',
          body: 'Share the link or click "Start with bots" for instant play.',
        },
        play: {
          title: 'Roll and race',
          body: 'Roll dice, dodge obstacles, use abilities, and cross the finish line!',
        },
      },
      themes: {
        title: 'Pick a track',
        subtitle: 'Each theme gives the track a unique visual style.',
      },
      rules: {
        title: 'Rules',
        objective: 'Be the first cat to reach space 20 — the finish line.',
        howToPlay:
          'On your turn, roll the dice and move forward that many spaces.',
        abilities:
          'Each cat has 2 unique abilities. Spend power tokens (3 per game) to activate them.',
        trackSpaces:
          '🟢 Normal — no effect. 🔴 Obstacle — skip your next turn. 🟡 Bonus — roll again immediately.',
      },
      faq: {
        abilities: {
          question: 'What do cat abilities do?',
          answer:
            'Each cat has two unique abilities — one offensive (skip opponents, steal movement) and one defensive (block abilities, skip obstacles).',
        },
        tokens: {
          question: 'How do power tokens work?',
          answer:
            'You start with 3 power tokens. Each ability use costs 1 token. Some track spaces recharge tokens.',
        },
        bots: {
          question: 'How do bots play?',
          answer:
            'Bots roll the dice automatically each turn. They provide a fun challenge when friends are not available.',
        },
      },
    },
    lobby: {
      theme: 'Track theme',
      trackType: 'Track type',
      columns: 'Board width (columns)',
      columnsUnit: 'columns',
      trackLength: 'Track length (spaces)',
      spacesUnit: 'spaces',
      startWithBots: 'Start with bots',
      addBot: 'Add bot',
      waitingForPlayers: 'Waiting for players…',
      minPlayers: 'Minimum 2 players',
    },
    tutorial: {
      s1: {
        title: 'Roll and dash',
        body: 'On your turn hit Roll Dice to scamper forward. First cat to reach space 20 wins the race.',
      },
      s2: {
        title: 'Mind the track',
        body: 'Red obstacles skip your next turn, yellow bonuses grant an extra roll, and blue forks offer risky shortcuts.',
      },
      s3: {
        title: 'Spend tokens wisely',
        body: 'Each cat has two unique abilities — spend your three power tokens at the perfect moment.',
      },
      s4: {
        title: 'Photo finish',
        body: 'Cross the finish line first, then rematch or celebrate in chat.',
      },
    },
    rules: {
      title: 'Cat Dash Rules',
      objectiveTitle: 'Objective',
      objective: 'Be the first cat to reach the finish line (space 20).',
      howToPlayTitle: 'How to Play',
      howToPlay:
        'On your turn, click "Roll Dice" to move. You roll a standard 6-sided die.',
      trackSpacesTitle: 'Track Spaces',
      trackSpaces:
        '🟢 Normal — no effect. 🔴 Obstacle — skip your next turn. 🟡 Bonus — roll again immediately. 🔵 Fork — choose a path.',
      abilitiesTitle: 'Abilities',
      abilities:
        'Each cat has 2 unique abilities. Use power tokens (3 per game) to activate them.',
      catsTitle: 'Cats',
      cats: "🐱 Neon Cat (Cyber): Digital Dash + Neon Shield. 🐱 Whiskers (Village): Extra Life + Purr Power. 🐱 Stardust (Space): Warp Jump + Star Shield. 🐱 Felix (Nature): Nature's Path + Wild Charge.",
      trackTypesTitle: 'Track Types',
      trackTypes:
        'Linear — straightforward race. Circular — shortcuts and obstacles. Multiple Paths — forks with risk/reward.',
    },
    gameOver: {
      won: 'You won!',
      lost: 'You lost.',
      draw: 'Draw.',
      you: 'You',
      messages: {
        won: 'Your cat crossed the finish line first! Ready for another race?',
        lost: 'Another cat won the race. Want a rematch?',
        draw: 'The race ended in a tie. Try again?',
      },
    },
    actions: {
      rollDice: 'Roll Dice',
      useAbility: 'Use Ability',
      choosePath: 'Choose Path',
      rematch: 'Rematch',
      leave: 'Leave',
      forfeit: 'Forfeit',
    },
    chat: {
      rolled: '{{name}} rolled {{roll}} and moved {{move}} spaces.',
      ability: '{{name}} used an ability!',
      won: '{{name}} crossed the finish line!',
      joined: '{{name}} joined the race.',
      left: '{{name}} left the race.',
      forfeit: '{{name}} forfeited the race.',
    },
    errors: {
      notYourTurn: 'Not your turn yet.',
      gameOver: 'The game has ended.',
      gameNotStarted: 'The game has not started.',
    },
    status: {
      turn: '{{player}} is rolling…',
      winner: '{{player}} won the race!',
      draw: 'Draw',
    },
  },
};

export const en = {
  header: {
    eyebrow: 'New room',
    title: 'Create a room',
    intro:
      'Pick a game, choose how it looks, name your room. We then open the lobby and give you a link to share with friends.',
    quick:
      'Everything is pre-filled, so you can create a room right away. Change anything you like below.',
  },
  progress: {
    label: 'Steps to create a room',
    stepOf: 'Step {{current}} of {{total}}',
    done: 'Done',
  },
  steps: {
    game: {
      title: 'Choose a game',
      why: 'This decides the rules everyone will play.',
    },
    preset: {
      title: 'Pick a starting setup',
      why: 'One tap fills in sensible defaults. You can still change anything below.',
    },
    look: {
      title: 'Choose a look',
      why: 'The theme changes colors and artwork only. The rules stay the same.',
    },
    packs: {
      title: 'Card packs',
      why: 'Extra packs add new cards and surprises. New to the game? Keep Core only, it is the simplest.',
    },
    room: {
      title: 'Name your room',
      why: 'Friends see this name in the lobby list and on your invite.',
    },
    more: {
      title: 'More options',
      why: 'All optional. Skip this if you just want to play.',
      show: 'Show more options',
      hide: 'Hide more options',
    },
  },
  game: {
    playing: 'You are creating a room for',
    change: 'Change game',
    done: 'Keep this game',
    pickerTitle: 'All games',
    pickerHint: 'Pick a game and your choice is saved right away.',
    selected: 'Selected',
    comingSoon: 'Coming soon',
    players: '{{label}} players',
    cycleTheme: 'Next theme',
  },
  presets: {
    label: 'Starting setups',
    ranked: {
      label: 'Ranked 1v1',
      hint: 'Public room for 2 players. The result counts toward your rating.',
    },
    friends: {
      label: 'With friends',
      hint: 'Hidden from the lobby list. Friends join with your link.',
    },
    party: {
      label: 'Big party',
      hint: 'Public room with the full table and all the fun rules on.',
    },
    custom: 'Custom setup. You changed something after picking a preset.',
  },
  theme: {
    groupLabel: '{{game}} theme',
    current: 'Selected theme: {{name}}',
  },
  packs: {
    summaryCore: 'Core only',
    summaryExtra: '{{n}} extra packs',
    selectAll: 'Add all packs',
    clearExtras: 'Back to Core only',
    show: 'Choose packs',
    hide: 'Hide packs',
    alwaysOn: 'always included',
    cards: '{{n}} cards',
  },
  rules: {
    title: 'House rules',
    why: 'Small tweaks to how the game plays. Leave them off for the standard rules.',
    combos: {
      title: 'Action card combos',
      desc: 'Lets players play pairs of action cards as a combo.',
    },
    idle: {
      title: 'Auto-play when idle',
      desc: 'If someone stops responding, the game plays a safe move for them so nobody waits.',
    },
    teams: {
      title: 'Team mode',
      desc: 'Players are split into teams and win together.',
    },
    teamsPachisi: {
      title: 'Team play (2v2)',
      desc: 'Four players, two teams. Partners sit opposite and win when all of their tokens are home. Needs exactly 4 players.',
    },
    none: 'This game has no extra house rules.',
    comingSoon: 'Coming soon',
  },
  details: {
    roomName: 'Room name',
    required: 'required',
    roomNameHelp: 'Shown to everyone who sees your room.',
    roomNamePlaceholder: 'For example: Friday night game',
    errorRequired: 'Give your room a name so friends can find it.',
    errorTooLong: 'Keep the name under {{max}} characters.',
    players: 'Players',
    playersHelp:
      'Auto lets the table fill from {{min}} up to {{max}} players. Pick a number to set a limit.',
    auto: 'Auto',
    upTo: 'Up to {{n}}',
    fixedPlayers: 'This game is always played with {{n}} players.',
    decrease: 'Fewer players',
    increase: 'More players',
    resetAuto: 'Reset to Auto',
    visibility: 'Who can join',
    visibilityHelp: {
      public: 'Public: anyone can find your room in the lobby and join.',
      unlisted:
        'Link only: hidden from the list. Only people with your link can join.',
      private:
        'Invite only: hidden from the list. Share your link to let people in.',
    },
    visibilityPublic: 'Public',
    visibilityUnlisted: 'Link only',
    visibilityPrivate: 'Invite only',
    notes: 'Message for players',
    notesHelp: 'A short note joiners see, like "beginners welcome".',
    notesPlaceholder: 'Beginners welcome',
    password: 'Password',
    passwordHelp: 'Players must type it to join. Leave empty for no password.',
    passwordPlaceholder: 'Set a password',
    ranked: 'Ranked match',
    rankedHelp:
      "The result changes every player's rating for this game. Turn on for serious games.",
  },
  summary: {
    title: 'Your room',
    subtitle: 'Live preview. This updates as you change settings.',
    room: 'Room',
    game: 'Game',
    theme: 'Theme',
    players: 'Players',
    access: 'Who can join',
    packs: 'Packs',
    rules: 'House rules',
    rulesNone: 'Standard rules',
    ranked: 'Ranked',
    yes: 'Yes',
    no: 'No',
    guide: 'Rules and how to play',
  },
  cta: {
    create: 'Create room',
    creating: 'Creating your room...',
    next: 'After you click: we create the room and open its lobby, where you get a link to invite friends.',
    shortcut: 'Tip: press Ctrl or Cmd + Enter to create.',
    whyNeedName: 'Add a room name above to continue.',
    whyUnavailable:
      'This game or theme is not open yet, so a room cannot be created.',
    comingSoon: 'Coming soon',
  },
  errors: {
    submitTitle: 'We could not create your room',
    submitHelp: 'Your settings are kept. Check your connection and try again.',
    retry: 'Try again',
    catalogTitle: 'Could not check which games are open',
    catalogHelp: 'You can still try to create a room.',
  },
};

export type CreateRoomMessages = typeof en;

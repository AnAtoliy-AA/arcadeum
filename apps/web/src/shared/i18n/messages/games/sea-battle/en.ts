export const enMessages = {
  sea_battle_v1: {
    name: 'Sea Battle',
    description: 'Classic naval combat game for up to 6 players',
    colors: {
      ship: 'Ship',
      hit: 'Hit',
      miss: 'Miss',
      empty: 'Empty',
    },
    challengePlayer: 'Challenge {{name}} to Sea Battle?',
    rules: {
      title: 'Game Rules',
      headers: {
        objective: 'Objective',
        gameplay: 'Gameplay',
        placement: 'Ship Placement',
        battle: 'Battle Phase',
        ships: 'Your Fleet',
      },
      objective:
        'Sink all enemy ships before they sink yours! The last player with ships remaining wins.',
      gameplay:
        'The game has two phases: Ship Placement and Battle. First, secretly place your ships on your 10×10 grid. Then take turns firing at opponent grids to find and sink their ships.',
      placement:
        'Place all 5 ships on your grid before the battle begins. Ships cannot overlap or touch each other. Click to place, rotate with the button.',
      battle:
        "On your turn, click on an opponent's grid to fire. Hits are marked red, misses are marked white. When all cells of a ship are hit, it sinks!",
      ships: `• Carrier (5 cells) - The largest ship
• Battleship (4 cells) - Heavy cruiser
• Cruiser (3 cells) - Fast strike ship
• Submarine (3 cells) - Stealthy vessel
• Destroyer (2 cells) - Small but nimble`,
    },
    variants: {
      classic: {
        name: 'Classic',
        description: 'Traditional battleship theme',
      },
      modern: {
        name: 'Modern II',
        description: 'Modern naval warfare',
      },
      pixel: {
        name: 'Pixel Art',
        description: 'Retro pixel art style',
      },
      cartoon: {
        name: 'Cartoon',
        description: 'Fun cartoon characters',
      },
      cyber: {
        name: 'Cyberpunk',
        description: 'High-tech neon warfare',
      },
      vintage: {
        name: 'Vintage',
        description: 'Old maritime map',
      },
      nebula: {
        name: 'Nebula',
        description: 'Deep space fleet',
      },
      forest: {
        name: 'Forest',
        description: 'Camouflage operations',
      },
      sunset: {
        name: 'Sunset',
        description: 'Twilight engagement',
      },
      monochrome: {
        name: 'Noir',
        description: 'Sleek monochrome style',
      },
    },
    table: {
      state: {
        yourBoard: 'Your Board',
        opponentBoard: 'Opponent Board',
        shipsRemaining: 'Ships Remaining',
        shipsPalette: 'Ships to Place',
        vertical: 'Vertical',
        horizontal: 'Horizontal',
        cells: 'Cells',
      },
      players: {
        you: 'You',
        alive: 'Alive',
        eliminated: 'Eliminated',
        yourTurn: 'Your turn',
        yourTurnAttack: '🎯 Your Turn - Attack an opponent!',
        placeShips: 'Place your ships',
        waitingFor: 'Waiting for {{player}}...',
        targetBadge: 'Target',
        defendingBadge: 'Defending',
        opponentBadge: 'Opponent',
      },
      phase: {
        lobby: 'Lobby',
        placement: 'Ship Placement',
        battle: 'Battle',
        completed: 'Game Over',
      },
      actions: {
        start: 'Start Game',
        starting: 'Starting...',
        confirmPlacement: 'Confirm Placement',
        rotate: 'Rotate',
        challenge: 'Challenge',
        fire: 'Fire!',
        autoPlace: 'Auto Place Ships',
        randomize: 'Randomize Ships',
        resetPlacement: 'Reset Placement',
        waitingForOthers: 'Waiting for others...',
        dragHint: 'Drag to board · Click to select',
      },
      attack: {
        hit: 'Hit!',
        miss: 'Miss',
        sunk: 'Sunk!',
        shipSunk: '{{ship}} has been sunk!',
      },
      lobby: {
        waitingToStart: 'Waiting for game to start...',
        playersInLobby: 'Players in Lobby',
        needTwoPlayers: 'Need at least 2 players to start',
        maxFourPlayers: 'Maximum 4 players',
        hostCanStart: "Click 'Start Game' when ready",
        waitingForHost: 'Waiting for host to start the game',
        hostControls: 'Host Controls',
        theme: 'Theme',
        roomInfo: 'Room Info',
        host: 'Host',
      },
      victory: {
        title: 'Victory!',
        message: 'You sank all enemy ships!',
      },
      defeat: {
        title: 'Defeat',
        message: 'All your ships have been sunk.',
      },
      controlPanel: {
        spectating: 'Spectating',
        fullscreen: 'Fullscreen',
        exitFullscreen: 'Exit Fullscreen',
        enterFullscreen: 'Enter Fullscreen',
        rules: 'Rules',
        leaveRoom: 'Leave',
        leaveConfirmMessage:
          'Are you sure you want to leave the game? You will be removed from the participants list.',
        exitRoom: 'Exit',
        exitRoomTooltip: 'Go back to lobby but stay in the game',
        leaveGameTooltip: 'Remove yourself from the game and return to lobby',
      },
      chat: {
        title: 'Battle Chat',
        empty: 'No messages yet',
        send: 'Send',
        show: 'Show Chat',
        hide: 'Hide Chat',
        placeholder: 'Type a message...',
      },
    },
    teamMode: {
      enableLabel: 'Team Mode',
      disableLabel: 'Disable Team Mode',
      hideShipsLabel: 'Hide ships from teammates',
      teammateBadge: 'Teammate',
      cannotAttackTeammate: 'Cannot attack teammate',
      description:
        'Play in teams. Set up team count and sizes — players can self-pick or be assigned by the host.',
      setup: {
        title: 'Team Setup',
        teamNamePlaceholder: 'Team name',
        teamColorLabel: 'Color',
        slotCountLabel: 'Slots',
        addTeam: 'Add Team',
        removeTeam: 'Remove Team',
        addBot: 'Add Bot',
        removeBot: 'Remove',
        totalSlots: 'Total slots: {{used}} / {{max}}',
        maxPlayers: 'Max total players:',
        minTeamsHint: 'At least 2 teams required',
        maxTeamsHint: 'Up to 4 teams (each with at least 2 players)',
        minSizeHint: 'Each team needs at least 2 slots',
      },
      slots: {
        joinTeam: 'Join team',
        leaveTeam: 'Leave team',
        moveTo: 'Move to {{team}}',
        botLabel: 'Bot',
        emptySlot: 'Open slot',
      },
      unassigned: {
        title: 'Unassigned',
        empty: 'Everyone is on a team',
      },
      start: {
        disabledNotFull: 'All team slots must be filled before starting',
        disabledNotEnoughTeams: 'At least 2 teams required',
      },
      errors: {
        roomFull: 'Room cannot exceed 8 players in team mode',
        teamFull: 'This team is full',
        teamNotFound: 'Team not found',
        notHost: 'Only the host can change team configuration',
      },
      chat: {
        channelTeam: 'Team',
        channelAll: 'All',
        channelPrivate: 'Private',
      },
      banner: {
        eliminatedSpectator:
          'You have been eliminated. You can still chat with your team and watch the battle.',
        teamWon: '{{team}} wins!',
      },
    },
    landing: {
      meta: {
        title: 'Sea Battle — Play Online Free with Friends | Battleship Game',
        description:
          'Play Sea Battle (Battleship) online for free. Classic naval combat for 2–4 players, with AI bots, team mode, and 10+ themes. No download, no signup — just create a room and share the link.',
        ogTitle: 'Sea Battle Online — Free Multiplayer Battleship',
        ogDescription:
          'Place your fleet, fire at enemy grids, sink every ship to win. Play in your browser with friends or AI.',
        keywords:
          'sea battle, battleship, battleship online, sea battle online, play battleship, multiplayer battleship, naval combat game',
      },
      hero: {
        title: 'Sea Battle',
        tagline: 'Play the classic Battleship game online — free, multiplayer',
        intro:
          'Sea Battle is the timeless naval-combat game where two or more admirals secretly place fleets on a 10×10 grid and trade salvos until only one fleet is left afloat. On Arcadeum you can play Sea Battle right in your browser — no download, no signup wall — with friends, strangers, or AI bots.',
        ctaPlay: 'Create a Sea Battle room',
        ctaRooms: 'Browse open rooms',
        ctaQuickplay: 'Play vs AI now',
        ctaQuickplayError: 'Couldn’t start a game — try again',
        ctaPlayHuman: 'Find a human opponent',
        ctaGroupLabel: 'Sea Battle quick start',
        eyebrow: 'Free · 2–4 players · No signup',
        chips: [
          'Browser-based',
          'Play with AI bots',
          'Team mode',
          '10+ themes',
        ],
      },
      finalCta: {
        title: 'Ready to play?',
        subtitle: 'Spin up a room and share the link — your fleet awaits.',
      },
      sections: {
        highlightsKicker: 'Why Arcadeum',
        howToKicker: 'Four steps · ~20 minutes',
        themesKicker: 'Choose your fleet',
        themesTitle: '10+ themes, one game',
        themesLead:
          'Ten board styles, your pick. Same game, different vibe — switch any time in the lobby.',
        rulesKicker: 'Reference',
        strategyKicker: 'Sharpen your aim',
        aboutKicker: 'About the game',
        faqKicker: 'FAQ',
      },
      strategy: {
        title: 'Sea Battle strategy: how to win more games',
        intro:
          'Sea Battle (Battleship) is a game of probability and process of elimination. A handful of habits separate casual players from the admirals who consistently sink first.',
        tips: {
          hunt: {
            title: 'Hunt-and-target your hits',
            body: 'After landing a hit, fire at adjacent cells in one of four directions until the ship sinks. The moment it goes down, return to your search pattern — confirmation of a sinking tells you which neighbouring cells are now safe to ignore.',
          },
          parity: {
            title: 'Search in a checkerboard',
            body: 'The shortest ship is two cells long, so firing in a checkerboard pattern guarantees you will eventually touch every ship without scanning every cell. This roughly halves the cells you need to try before the first hit.',
          },
          edges: {
            title: 'Avoid edges and obvious lines',
            body: 'Hugging the board edge feels safe, but human opponents sweep the perimeter first because edge-placed ships have fewer escape directions. Float your fleet a cell or two off the rim.',
          },
          spread: {
            title: 'Spread, do not cluster',
            body: 'Put each ship in its own quadrant when you can. Clustered fleets cascade — a single lucky hit hands the opponent two or three quick sinkings in a row.',
          },
          memory: {
            title: 'Track misses, not just hits',
            body: 'Misses are information. Mentally mark the dead zones and you cut the remaining search space in half by the mid-game. Most theme boards on Arcadeum already show miss markers for you.',
          },
        },
      },
      about: {
        title: 'About Sea Battle',
        paragraphs: [
          'Sea Battle, known internationally as Battleship, is one of the oldest grid-based strategy games still played today. Players first sketched the rules on lined notebooks long before any plastic board existed — two opponents, two secret 10×10 grids, and the simple thrill of calling out coordinates one at a time.',
          'The game made the jump from paper to plastic in the mid-20th century, becoming a fixture of family game nights, and from there to screens — pocket electronic versions, computer game adaptations, and now browser-native multiplayer.',
          'Arcadeum keeps the original 10×10 grid and the five-ship fleet intact, then adds what the paper version never had: instant matchmaking, AI opponents, team mode, ten visual themes, and shareable lobby links. Whether you are looking for a quick game vs the computer or a longer match against a human, the rules are the same ones admirals have been arguing over for a century.',
        ],
      },
      board: {
        label: 'Live preview',
        cycleHint: 'Click to change theme',
        cycleAriaLabel: 'Cycle theme preview, currently {{variant}}',
      },
      highlights: {
        title: 'Why play Sea Battle on Arcadeum',
        players: {
          title: '2 to 4 players',
          body: 'Head-to-head duels or free-for-all with up to four admirals per room.',
        },
        teams: {
          title: 'Team mode',
          body: 'Up to four teams with shared boards, private team chat, and an optional hidden-ships rule.',
        },
        themes: {
          title: '10+ themes',
          body: 'Classic, modern, pixel-art, cyberpunk, nebula, vintage, sunset and more.',
        },
        free: {
          title: 'Free & instant',
          body: 'No installs, no paywall. Open a room and share the link.',
        },
      },
      howToPlay: {
        title: 'How to play Sea Battle',
        steps: {
          create: {
            title: '1. Create a room',
            body: 'Pick a theme, invite friends or add AI bots, and choose head-to-head or team mode.',
          },
          place: {
            title: '2. Place your fleet',
            body: 'Drag your five ships onto your 10×10 grid. Ships cannot overlap or touch.',
          },
          fire: {
            title: '3. Fire at the enemy',
            body: 'Take turns picking a cell on each opponent’s grid. Hits go red, misses go white.',
          },
          win: {
            title: '4. Sink them all',
            body: 'The last admiral with at least one ship afloat wins the battle.',
          },
        },
      },
      faq: {
        title: 'Frequently asked questions',
        items: {
          free: {
            question: 'Is Sea Battle free to play?',
            answer:
              'Yes. Sea Battle on Arcadeum is completely free to play in your browser, with no download required.',
          },
          players: {
            question: 'How many players can play Sea Battle?',
            answer:
              'Sea Battle supports two to four players per room. Team mode allows up to four teams of two or more players each.',
          },
          ai: {
            question: 'Can I play Sea Battle against the computer?',
            answer:
              'Yes. You can fill any empty slot with an AI bot, so you can practice solo or round out a smaller group.',
          },
          duration: {
            question: 'How long does a game of Sea Battle take?',
            answer:
              'A typical Sea Battle game lasts about 20 minutes, depending on player count and how quickly admirals fire.',
          },
          rules: {
            question: 'What are the rules of Sea Battle?',
            answer:
              'Each player secretly places a fleet on a 10×10 grid, then players take turns firing at one cell on each opponent’s grid. Hits are marked red, misses white. When every cell of a ship is hit, the ship sinks. The last player with at least one ship afloat wins.',
          },
        },
      },
      breadcrumb: {
        home: 'Home',
        games: 'Games',
        seaBattle: 'Sea Battle',
      },
    },
  },
};

export const enMessages = {
  sea_battle_v1: {
    name: 'Sea Battle',
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
  },
  seaBattle: {
    table: {
      state: {
        yourBoard: 'Your Board',
        opponentBoard: 'Opponent Board',
        shipsRemaining: 'Ships Remaining',
      },
      players: {
        you: 'You',
        alive: 'Alive',
        eliminated: 'Eliminated',
        yourTurn: 'Your turn',
        yourTurnAttack: '🎯 Your Turn - Attack an opponent!',
        placeShips: 'Place your ships',
        waitingFor: 'Waiting for {{player}}...',
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
        fire: 'Fire!',
        autoPlace: 'Auto Place Ships',
        randomize: 'Randomize Ships',
        resetPlacement: 'Reset Placement',
        waitingForOthers: 'Waiting for others...',
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
      chat: {
        title: 'Battle Chat',
        empty: 'No messages yet',
        send: 'Send',
        placeholder: 'Type a message...',
      },
    },
  },
};

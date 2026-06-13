import { landing } from './landing-en';

export const enMessages = {
  glimworm_v1: {
    name: 'Glimworm',
    description: 'A glow-in-the-dark snake battle for 2–10 players.',
    tagline: 'Hold a finger, slither, survive.',
    landing,
    variant: {
      battleRoyale: {
        name: 'Battle Royale',
        description: 'Last worm alive wins. The arena shrinks.',
      },
      timeAttack: {
        name: 'Time Attack',
        description: '90 seconds. Highest score wins. No-one is ever out.',
      },
      livesHeats: {
        name: 'Lives + Heats',
        description: 'Three lives each. Last with lives wins.',
      },
    },
    powerup: {
      speed: { name: 'Speed Burst', tip: '3-second sprint.' },
      shield: { name: 'Shield', tip: 'Absorbs one hit.' },
      shrink: { name: 'Shrink', tip: 'Drop 30% length to escape.' },
      ghost: { name: 'Ghost', tip: '2-second phase through trails.' },
    },
    lobby: {
      pickColor: 'Pick your worm color',
      fillWithBots: 'Fill empty slots with bots',
      waitingForPlayers: 'Waiting for at least 2 worms…',
      variant: 'Variant',
      powerups: 'Power-ups',
      powerupsOn: 'On',
      powerupsOff: 'Off',
    },
    hud: {
      timer: 'Time',
      lives: 'Lives',
      safeZone: 'Safe Zone',
      score: 'Score',
    },
    death: { youDied: 'You died', spectating: 'Spectating' },
    result: {
      winner: '{{name}} wins!',
      tie: "It's a tie",
      rematch: 'Rematch',
    },
    status: {
      connecting: 'Connecting…',
      reconnecting: 'Reconnecting…',
      slowConnection: 'Slow connection',
      getReady: 'Get ready',
      inPlay: 'In play',
      roundOver: 'Round over',
    },
    rules: {
      objective:
        'Outlast every other worm in the arena. Eat glowing food to grow longer and score points.',
      gameplay:
        'Your worm follows your cursor — hold and steer. The arena is wide-open; the danger is everyone else’s trail. Bump into a wall or any worm’s body and you die.',
      survive:
        'Cut other worms off so they hit your trail, then sweep up the food they drop. Stay close to the edge of the pack — never trapped in a corner.',
      powerups:
        'Optional pickups give a 3-second speed burst, a one-hit shield, a 30% shrink to escape, or 2 seconds of ghosting through trails.',
    },
  },
};

import { landing } from './landing-fr';

export const frMessages = {
  glimworm_v1: {
    name: 'Glimworm',
    description: 'Une bataille de vers lumineux pour 2 à 10 joueurs.',
    tagline: 'Maintenez le doigt, glissez, survivez.',
    landing,
    variant: {
      battleRoyale: {
        name: 'Battle Royale',
        description: "Le dernier ver en vie gagne. L'arène se réduit.",
      },
      timeAttack: {
        name: 'Contre la montre',
        description:
          "90 secondes. Le meilleur score gagne. Personne n'est éliminé.",
      },
      livesHeats: {
        name: 'Vies + Manches',
        description: 'Trois vies chacun. Le dernier avec des vies gagne.',
      },
    },
    powerup: {
      speed: { name: 'Accélération', tip: 'Sprint de 3 secondes.' },
      shield: { name: 'Bouclier', tip: 'Absorbe un coup.' },
      shrink: { name: 'Rétrécir', tip: 'Perdez 30% de longueur pour fuir.' },
      ghost: { name: 'Fantôme', tip: '2 s à travers les traînées.' },
    },
    lobby: {
      pickColor: 'Choisissez la couleur de votre ver',
      fillWithBots: 'Remplir avec des bots',
      waitingForPlayers: "En attente d'au moins 2 vers…",
      variant: 'Mode',
      powerups: 'Bonus',
      powerupsOn: 'Activés',
      powerupsOff: 'Désactivés',
    },
    hud: {
      timer: 'Temps',
      lives: 'Vies',
      safeZone: 'Zone',
      score: 'Score',
    },
    death: { youDied: 'Vous êtes mort', spectating: 'Spectateur' },
    result: {
      winner: '{{name}} gagne !',
      tie: 'Égalité',
      rematch: 'Revanche',
    },
    status: {
      connecting: 'Connexion…',
      reconnecting: 'Reconnexion…',
      slowConnection: 'Connexion lente',
    },
    rules: {
      objective:
        'Survivez à tous les autres vers de l’arène. Mangez la nourriture lumineuse pour grandir et marquer des points.',
      gameplay:
        'Votre ver suit le curseur — maintenez et dirigez. L’arène est ouverte ; le danger, ce sont les traînées des autres. Toucher un mur ou un corps adverse vous tue.',
      survive:
        'Coupez la route des autres pour qu’ils heurtent votre traînée, puis ramassez la nourriture qu’ils laissent. Restez au bord du peloton, jamais coincé dans un angle.',
      powerups:
        'Bonus optionnels : sprint de 3 s, bouclier d’un coup, rétrécissement de 30% ou 2 s à travers les traînées.',
    },
  },
};

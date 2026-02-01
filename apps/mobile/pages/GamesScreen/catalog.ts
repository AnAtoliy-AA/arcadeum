import type { LanguagePreference } from '@/stores/settings';

export type GameStatus = 'In prototype' | 'In design' | 'Roadmap';

export interface GameSectionItem {
  title: string;
  description: string;
}

export interface GameStep {
  title: string;
  detail: string;
}

export interface GameCatalogueEntry {
  id: string;
  name: string;
  tagline: string;
  summary: string;
  overview: string;
  status: GameStatus;
  players: string;
  duration: string;
  tags: string[];
  bestFor: string[];
  mechanics: string[];
  highlights: GameSectionItem[];
  howToPlay: GameStep[];
  comingSoon: GameSectionItem[];
  isPlayable?: boolean;
  isHidden?: boolean;
  localizations?: Partial<
    Record<LanguagePreference, GameCatalogueLocalization>
  >;
}

export interface GameCatalogueLocalization {
  tagline?: string;
  summary?: string;
  overview?: string;
  players?: string;
  duration?: string;
  tags?: string[];
  bestFor?: string[];
  mechanics?: string[];
  highlights?: GameSectionItem[];
  howToPlay?: GameStep[];
  comingSoon?: GameSectionItem[];
}

export const gamesCatalog: GameCatalogueEntry[] = [
  {
    id: 'critical_v1',
    name: 'Critical',
    tagline:
      'Dodge the detonations, weaponize your deck, and stay nine lives ahead.',
    summary:
      'Push your luck, avoid the exploding cats, and sabotage opponents with wild cards.',
    overview: `Critical brings the beloved party-card chaos online with simultaneous turns, smart animations, and optional house rules. Our rules engine tracks every interaction so you can focus on bluffing, defusing, and taunting your friends in real time. Setup follows the official deck prep: make sure there is one fewer Exploding Cat than players, give every player a Defuse plus four additional cards, then shuffle the remaining Defuse cards and bombs back into the draw pile. On your turn you may play any number of cards (including combos), resolve their effects with optional Nope responses, and then draw to end your turn unless an Attack pushed the obligation to the next player. Card effects mirror the physical rules: Attack ends your turn and forces the next player to take two draws, Skip ends your turn without drawing, Favor takes a random card from an opponent, Shuffle randomizes the draw pile, See the Future reveals the top three cards, Nope cancels any action except Defuse or Exploding Cat resolution, Defuse prevents an explosion and lets you tuck the bomb back anywhere in the deck, and drawing an Exploding Cat without a Defuse eliminates you from the round. The five cat personalities—Tacocat, Hairy Potato Cat, Rainbow Ralphing Cat, Cattermelon, and Bearded Cat—gain power only when played as pairs or three-of-a-kind, which is why single copies stay inactive until you assemble a combo.`,
    status: 'In prototype',
    players: '2-5 players',
    duration: '15 min',
    tags: ['Card game', 'Party', 'Humor'],
    bestFor: ['Quick sessions', 'Remote game nights', 'New players'],
    mechanics: ['Push your luck', 'Deck manipulation', 'Take that'],
    highlights: [
      {
        title: 'Adaptive rule engine',
        description:
          'Server-side state enforces defuse, skip, and attack chains instantly—even with simultaneous reactions.',
      },
      {
        title: 'Drama-friendly animations',
        description:
          'Explosions, cat antics, and slow-mo defuses amplify every turn without slowing gameplay.',
      },
      {
        title: 'Quick rematch loops',
        description:
          'Queue rematches with one tap and keep your lobby intact for back-to-back chaos.',
      },
    ],
    howToPlay: [
      {
        title: 'Set up the deck',
        detail:
          'Deal four cards plus one Defuse to each player, trim the Critical to players minus one, then shuffle the remaining Defuse cards and bombs back into the deck.',
      },
      {
        title: 'Take your turn',
        detail:
          'Play as many cards as you like (including combos) in any order, respond with Nope cards to cancel opponents, and finish by drawing—unless an Attack passed extra draws to you.',
      },
      {
        title: 'Know every card',
        detail:
          'Attack ends your turn and forces the next player to draw twice; Skip ends your turn with no draw; Favor forces another player to give you one card; Shuffle reshuffles the draw pile; See the Future peeks at the top three cards; Nope cancels any action except a Defuse or Exploding Cat resolution; Defuse stops an explosion and lets you hide the bomb back in the deck; Exploding Cat knocks you out if you cannot Defuse.',
      },
      {
        title: 'Cat combos explained',
        detail:
          'Tacocat, Hairy Potato Cat, Rainbow Ralphing Cat, Cattermelon, and Bearded Cat have power only when played as pairs or trios—pairs steal a random card, trios let you name and take a specific card. Because single cat cards lack standalone actions, the tabletop UI keeps them disabled until you assemble the required combo.',
      },
    ],
    comingSoon: [
      {
        title: 'Ranked ladders',
        description:
          'Seasonal ladders with cosmetic unlocks and stat tracking for competitive crews.',
      },
      {
        title: 'Custom deck builder',
        description:
          'Upload your own cat art and card ideas for community-voted variants.',
      },
    ],
    isPlayable: true,
    localizations: {
      es: {
        overview:
          'Critical ofrece el caos del juego original con turnos simultáneos, animaciones inteligentes y reglas opcionales para tu grupo. La preparación sigue las reglas oficiales: usa un Exploding Cat menos que la cantidad de jugadores, reparte a cada persona un Defuse más cuatro cartas adicionales y vuelve a barajar los Defuse sobrantes y las bombas en el mazo. En tu turno puedes jugar tantas cartas como quieras (incluyendo combinaciones), resolver sus efectos mientras los demás pueden responder con Nope y, al final, robar una carta salvo que un Attack haya pasado la obligación al siguiente jugador. Cada carta conserva su efecto físico: Attack termina tu turno y obliga al siguiente jugador a robar dos cartas, Skip termina tu turno sin robar, Favor roba una carta al azar a otro jugador, Shuffle baraja el mazo, See the Future muestra las tres primeras cartas, Nope cancela cualquier acción excepto un Defuse o la resolución de un Exploding Cat, Defuse evita la explosión y te permite esconder la bomba en cualquier parte del mazo, y robar un Exploding Cat sin Defuse te elimina de la ronda. Las cinco personalidades felinas —Tacocat, Hairy Potato Cat, Rainbow Ralphing Cat, Cattermelon y Bearded Cat— solo tienen poder cuando se juegan en pareja o trío, por lo que las cartas individuales permanecen inactivas hasta que completes la combinación.',
        howToPlay: [
          {
            title: 'Prepara el mazo',
            detail:
              'Reparte cuatro cartas más un Defuse a cada jugador, deja en el mazo una cantidad de Critical igual al número de jugadores menos uno y baraja allí los Defuse restantes junto con las bombas.',
          },
          {
            title: 'Juega tu turno',
            detail:
              'Puedes jugar todas las cartas que quieras en cualquier orden, lanzar combinaciones y permitir que otros respondan con Nope antes de terminar tu turno. Finaliza robando una carta, a menos que un Attack haya pasado las robas al siguiente jugador.',
          },
          {
            title: 'Conoce cada carta',
            detail:
              'Attack termina tu turno y obliga al siguiente jugador a robar dos cartas; Skip termina tu turno sin robar; Favor te da una carta aleatoria de otro jugador; Shuffle baraja el mazo; See the Future revela las tres primeras cartas; Nope cancela cualquier acción excepto Defuse o la resolución de un Exploding Cat; Defuse detiene la explosión y te deja colocar la bomba en cualquier posición; un Exploding Cat sin Defuse te elimina.',
          },
          {
            title: 'Combina los gatos',
            detail:
              'Tacocat, Hairy Potato Cat, Rainbow Ralphing Cat, Cattermelon y Bearded Cat solo activan efectos cuando se juegan en parejas o tríos: las parejas roban una carta aleatoria y los tríos te permiten nombrar y tomar una carta específica. Por eso las cartas individuales permanecen deshabilitadas hasta que completes la combinación.',
          },
        ],
      },
      fr: {
        overview:
          'Critical transpose le chaos du jeu original avec des tours simultanés, des animations travaillées et des variantes maison facultatives. La mise en place respecte les règles officielles : utilisez une carte Exploding Cat de moins que le nombre de joueurs, donnez à chacun un Defuse ainsi que quatre cartes supplémentaires, puis mélangez les Defuse restants et les bombes dans la pioche. À votre tour, jouez autant de cartes que vous le souhaitez (y compris des combinaisons), appliquez leurs effets pendant que les adversaires peuvent répondre avec Nope, puis piochez pour terminer le tour, sauf si une carte Attack a reporté l’obligation sur le joueur suivant. Chaque carte conserve son effet physique : Attack termine votre tour et impose deux pioches au joueur suivant, Skip termine le tour sans pioche, Favor vous fait prendre une carte au hasard chez un adversaire, Shuffle mélange la pioche, See the Future révèle les trois prochaines cartes, Nope annule toute action sauf un Defuse ou la résolution d’un Exploding Cat, Defuse empêche l’explosion et vous permet de replacer la bombe où vous le souhaitez, et piocher un Exploding Cat sans Defuse vous élimine de la manche. Les cinq chats —Tacocat, Hairy Potato Cat, Rainbow Ralphing Cat, Cattermelon et Bearded Cat— ne gagnent du pouvoir qu’en paire ou en trio, d’où l’inactivité des cartes seules tant que la combinaison n’est pas réunie.',
        howToPlay: [
          {
            title: 'Préparez la pioche',
            detail:
              'Distribuez quatre cartes et un Defuse à chaque joueur, gardez un nombre de cartes Exploding Cat égal au nombre de joueurs moins un, puis mélangez les Defuse restants et les bombes dans la pioche.',
          },
          {
            title: 'Jouez votre tour',
            detail:
              'Jouez autant de cartes que vous le souhaitez dans l’ordre de votre choix, composez des combos et laissez les autres répondre avec Nope avant de terminer. Finissez en piochant une carte, sauf si une carte Attack a transféré les pioches au joueur suivant.',
          },
          {
            title: 'Maîtrisez chaque carte',
            detail:
              'Attack termine votre tour et impose deux pioches au joueur suivant ; Skip termine votre tour sans piocher ; Favor vous fait prendre une carte aléatoire à un adversaire ; Shuffle mélange la pioche ; See the Future révèle les trois premières cartes ; Nope annule toute action sauf un Defuse ou la résolution d’un Exploding Cat ; Defuse arrête l’explosion et vous permet de replacer la bombe ; piocher un Exploding Cat sans Defuse vous élimine.',
          },
          {
            title: 'Comprendre les combos de chats',
            detail:
              'Tacocat, Hairy Potato Cat, Rainbow Ralphing Cat, Cattermelon et Bearded Cat n’ont d’effet qu’en paire ou en trio : les paires volent une carte au hasard et les trios vous laissent nommer et prendre une carte précise. C’est pourquoi les cartes seules restent inactives tant que la combinaison n’est pas réunie.',
          },
        ],
      },
    },
  },
  {
    id: 'texas_holdem_v1',
    name: "Texas Hold'em",
    tagline:
      'Classic poker showdowns with real-time betting and hand evaluation.',
    summary:
      "Build hands, bluff rivals, and claim pots in structured Texas Hold'em rounds.",
    overview: `Texas Hold'em features a full state machine handling pre-flop betting, flop/turn/river reveals, showdown evaluation, and pot distribution. Each round follows standard rules: post blinds, deal hole cards, bet pre-flop starting UTG, burn+flop (3 cards), bet post-flop, burn+turn, bet, burn+river, bet, showdown. Server evaluates 7-card hands (2 hole + 5 community) for rank (royal flush to high card) and splits pots among ties. UI shows hole cards (private), community (shared), chips, current bet, pot, turn order, action buttons (fold/check/call/raise/all-in), player states. History logs actions, bets, reveals.`,
    status: 'In prototype',
    players: '2-10 players',
    duration: '20-60 min',
    tags: ['Poker', 'Betting', 'Bluffing'],
    bestFor: ['Strategy groups', 'Cash game fans', 'Tournament play'],
    mechanics: ['Betting rounds', 'Hand evaluation', 'Position play'],
    highlights: [
      {
        title: 'Automatic hand evaluator',
        description: 'Server ranks all possible hands instantly—no disputes.',
      },
      {
        title: 'Real-time betting',
        description:
          'Structured turns with position awareness and pot odds display.',
      },
      {
        title: 'Side pot support',
        description: 'Handles all-ins and uneven stacks cleanly.',
      },
    ],
    howToPlay: [
      {
        title: 'Post blinds & deal',
        detail: 'Small/big blinds posted, 2 hole cards dealt to each player.',
      },
      {
        title: 'Betting rounds',
        detail:
          'Pre-flop (UTG first), flop (3 cards), turn (1), river (1), showdown.',
      },
      {
        title: 'Actions',
        detail: 'Fold, check/call/raise to current bet, all-in anytime.',
      },
      {
        title: 'Showdown',
        detail: 'Best 5-card hand from 7 cards wins pot (ties split).',
      },
    ],
    comingSoon: [
      {
        title: 'Tournament mode',
        description: 'Multi-table brackets with chip progression.',
      },
      {
        title: 'Hand history replay',
        description: 'Review past hands with decision trees.',
      },
    ],
    isPlayable: false, // Temporarily unavailable
    isHidden: true, // Temporarily hidden from UI
  },
  {
    id: 'coup',
    name: 'Coup',
    tagline: 'Bluffs, betrayals, and lightning-fast influence battles.',
    summary:
      'Bluff, deduce, and outmaneuver rivals in a fast-paced game of influence.',
    overview:
      'Our Coup build focuses on crisp UI for role reveals, automated challenge resolution, and rich telemetry to sharpen your reads. Whether you play with friends or jump into matchmaking, every decision resolves in seconds.',
    status: 'In design',
    players: '2-6 players',
    duration: '10 min',
    tags: ['Bluffing', 'Strategy'],
    bestFor: ['High-stakes bluffing', 'Short sessions', 'Voice chat squads'],
    mechanics: ['Hidden roles', 'Bluffing', 'Resource management'],
    highlights: [
      {
        title: 'Challenge timeline',
        description:
          'Automatic timers keep challenges brisk and highlight role history to help inform your calls.',
      },
      {
        title: 'Influence tracker',
        description:
          'Visual influence counters show who is vulnerable without revealing hidden roles.',
      },
      {
        title: 'Table talk overlays',
        description:
          'Optional voice-synced captions make remote banter easier to follow.',
      },
    ],
    howToPlay: [
      {
        title: 'Claim actions',
        detail:
          'On your turn, take an action—income, foreign aid, tax, assassinate, or coup. Some require role claims.',
      },
      {
        title: 'Bluff or believe',
        detail:
          'Opponents may challenge your claim. Lose the challenge and you burn influence; win and they do.',
      },
      {
        title: 'Eliminate influence',
        detail:
          'Be the last player with influence to seize control of the city.',
      },
    ],
    comingSoon: [
      {
        title: 'Ranked matchmaking',
        description:
          'Skill-based pairing with Elo-style ratings and seasonal resets.',
      },
      {
        title: 'Alliance mode',
        description:
          'Cooperative variant where pairs coordinate bluff strategies for team victories.',
      },
    ],
  },
  {
    id: 'pandemic-lite',
    name: 'Pandemic: Rapid Response',
    tagline: 'Coordinated chaos against global outbreaks.',
    summary:
      'Coordinate with friends in real time to stop global outbreaks before time runs out.',
    overview:
      'Race the clock to deliver supplies worldwide. Our version emphasizes collaborative tools, shared dashboards, and a tactical timeline so everyone knows the plan—no matter the device.',
    status: 'Roadmap',
    players: '2-4 players',
    duration: '20 min',
    tags: ['Co-op', 'Strategy'],
    bestFor: ['Team synergy', 'Voice coordination', 'Experienced groups'],
    mechanics: [
      'Dice allocation',
      'Real-time coordination',
      'Resource management',
    ],
    highlights: [
      {
        title: 'Shared mission board',
        description:
          'Visualize current outbreaks, supply routes, and role abilities at a glance.',
      },
      {
        title: 'Timed challenge mode',
        description:
          'Optional countdown events increase intensity for elite crews.',
      },
      {
        title: 'Role guidance',
        description:
          'Contextual prompts help new players master their specialist abilities fast.',
      },
    ],
    howToPlay: [
      {
        title: 'Roll and assign dice',
        detail:
          'Each round, roll dice to determine available actions, then assign them to planes, deliveries, or research.',
      },
      {
        title: 'Coordinate deliveries',
        detail:
          'Work together to load planes and deliver supplies to cities before outbreaks trigger.',
      },
      {
        title: 'Manage the timer',
        detail:
          'Every decision eats the timeline—communicate constantly to stay ahead of crises.',
      },
    ],
    comingSoon: [
      {
        title: 'Campaign progression',
        description:
          'Persistent world map with evolving challenges and unlockable specialists.',
      },
      {
        title: 'Coach mode',
        description:
          'AI assistant suggests optimal dice assignments for new crews.',
      },
    ],
  },
];

export function getGameById(id: string): GameCatalogueEntry | undefined {
  return gamesCatalog.find((game) => game.id === id);
}

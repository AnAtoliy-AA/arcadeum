import type { CreateRoomMessages } from './en';

export const fr: CreateRoomMessages = {
  header: {
    eyebrow: 'Nouveau salon',
    title: 'Créer un salon',
    intro:
      'Choisissez un jeu, un style et un nom de salon. Nous ouvrons ensuite le lobby et vous donnons un lien à partager avec vos amis.',
    quick:
      'Tout est déjà rempli : vous pouvez créer le salon tout de suite. Modifiez ce que vous voulez ci-dessous.',
  },
  progress: {
    label: 'Étapes pour créer un salon',
    stepOf: 'Étape {{current}} sur {{total}}',
    done: 'Terminé',
  },
  steps: {
    game: {
      title: 'Choisissez un jeu',
      why: 'Cela détermine les règles pour tout le monde.',
    },
    preset: {
      title: 'Choisissez une configuration de départ',
      why: 'Un geste remplit des valeurs raisonnables. Vous pouvez tout modifier ensuite.',
    },
    look: {
      title: 'Choisissez un style',
      why: 'Le thème change uniquement les couleurs et les visuels. Les règles restent les mêmes.',
    },
    packs: {
      title: 'Paquets de cartes',
      why: "Les paquets supplémentaires ajoutent des cartes et des surprises. Première partie ? Gardez seulement le paquet de base, c'est le plus simple.",
    },
    room: {
      title: 'Nommez votre salon',
      why: 'Vos amis verront ce nom dans la liste du lobby et dans votre invitation.',
    },
    more: {
      title: "Plus d'options",
      why: 'Tout est facultatif. Passez cette étape si vous voulez juste jouer.',
      show: "Afficher plus d'options",
      hide: 'Masquer les options',
    },
  },
  game: {
    playing: 'Vous créez un salon pour',
    change: 'Changer de jeu',
    done: 'Garder ce jeu',
    pickerTitle: 'Tous les jeux',
    pickerHint: 'Choisissez un jeu, votre choix est enregistré tout de suite.',
    selected: 'Choisi',
    comingSoon: 'Bientôt',
    players: '{{label}} joueurs',
    cycleTheme: 'Thème suivant',
  },
  presets: {
    label: 'Configurations de départ',
    ranked: {
      label: 'Classé 1 contre 1',
      hint: 'Salon public pour 2 joueurs. Le résultat compte pour votre classement.',
    },
    friends: {
      label: 'Entre amis',
      hint: 'Masqué dans la liste du lobby. Vos amis rejoignent avec votre lien.',
    },
    party: {
      label: 'Grande fête',
      hint: 'Salon public avec la table complète et toutes les règles amusantes activées.',
    },
    custom:
      'Configuration personnalisée. Vous avez modifié quelque chose après avoir choisi.',
  },
  theme: {
    groupLabel: 'Thème de {{game}}',
    current: 'Thème choisi : {{name}}',
  },
  packs: {
    summaryCore: 'Base seulement',
    summaryExtra: '{{n}} paquets en plus',
    selectAll: 'Ajouter tous les paquets',
    clearExtras: 'Revenir à la base seule',
    show: 'Choisir les paquets',
    hide: 'Masquer les paquets',
    alwaysOn: 'toujours inclus',
    cards: '{{n}} cartes',
  },
  rules: {
    title: 'Règles maison',
    why: 'De petits changements dans le déroulement du jeu. Laissez-les désactivées pour les règles standard.',
    combos: {
      title: 'Combos de cartes action',
      desc: 'Permet de jouer des paires de cartes action en combo.',
    },
    idle: {
      title: "Jeu automatique en cas d'inactivité",
      desc: "Si quelqu'un ne répond plus, le jeu joue un coup sûr à sa place pour que personne n'attende.",
    },
    teams: {
      title: 'Mode équipes',
      desc: 'Les joueurs sont répartis en équipes et gagnent ensemble.',
    },
    teamsPachisi: {
      title: 'Jeu par équipes (2 contre 2)',
      desc: 'Quatre joueurs, deux équipes. Les partenaires sont en face et gagnent quand tous leurs pions sont arrivés. Exactement 4 joueurs requis.',
    },
    none: "Ce jeu n'a pas de règles maison supplémentaires.",
    comingSoon: 'Bientôt',
  },
  details: {
    roomName: 'Nom du salon',
    required: 'obligatoire',
    roomNameHelp: 'Visible par toute personne qui voit votre salon.',
    roomNamePlaceholder: 'Par exemple : Partie du vendredi',
    errorRequired: 'Donnez un nom à votre salon pour que vos amis le trouvent.',
    errorTooLong: 'Le nom doit faire moins de {{max}} caractères.',
    players: 'Joueurs',
    playersHelp:
      'Auto remplit la table de {{min}} à {{max}} joueurs. Choisissez un nombre pour fixer une limite.',
    auto: 'Auto',
    upTo: "Jusqu'à {{n}}",
    fixedPlayers: 'Ce jeu se joue toujours à {{n}} joueurs.',
    decrease: 'Moins de joueurs',
    increase: 'Plus de joueurs',
    resetAuto: 'Revenir à Auto',
    visibility: 'Qui peut rejoindre',
    visibilityHelp: {
      public:
        'Public : tout le monde le trouve dans le lobby et peut rejoindre.',
      unlisted:
        'Lien seulement : masqué dans la liste. Seuls ceux qui ont votre lien peuvent rejoindre.',
      private:
        'Sur invitation : masqué dans la liste. Partagez votre lien pour faire entrer des gens.',
    },
    visibilityPublic: 'Public',
    visibilityUnlisted: 'Lien seulement',
    visibilityPrivate: 'Sur invitation',
    notes: 'Message pour les joueurs',
    notesHelp:
      'Une courte note vue par ceux qui rejoignent, comme "débutants bienvenus".',
    notesPlaceholder: 'Débutants bienvenus',
    password: 'Mot de passe',
    passwordHelp:
      'Les joueurs doivent le saisir pour rejoindre. Laissez vide pour aucun mot de passe.',
    passwordPlaceholder: 'Définissez un mot de passe',
    ranked: 'Partie classée',
    rankedHelp:
      'Le résultat modifie le classement de chaque joueur pour ce jeu. À activer pour les parties sérieuses.',
  },
  summary: {
    title: 'Votre salon',
    subtitle:
      'Aperçu en direct. Il se met à jour quand vous changez les réglages.',
    room: 'Salon',
    game: 'Jeu',
    theme: 'Thème',
    players: 'Joueurs',
    access: 'Qui peut rejoindre',
    packs: 'Paquets',
    rules: 'Règles maison',
    rulesNone: 'Règles standard',
    ranked: 'Classée',
    yes: 'Oui',
    no: 'Non',
    guide: 'Règles et comment jouer',
  },
  cta: {
    create: 'Créer le salon',
    creating: 'Création de votre salon...',
    next: 'Après le clic, nous créons le salon et ouvrons son lobby, où vous trouverez un lien pour inviter vos amis.',
    shortcut: 'Astuce : appuyez sur Ctrl ou Cmd + Entrée pour créer.',
    whyNeedName: 'Ajoutez un nom de salon ci-dessus pour continuer.',
    whyUnavailable:
      "Ce jeu ou ce thème n'est pas encore ouvert, impossible de créer un salon.",
    comingSoon: 'Bientôt',
  },
  errors: {
    submitTitle: "Nous n'avons pas pu créer votre salon",
    submitHelp:
      'Vos réglages sont conservés. Vérifiez votre connexion et réessayez.',
    retry: 'Réessayer',
    catalogTitle: 'Impossible de vérifier quels jeux sont ouverts',
    catalogHelp: 'Vous pouvez quand même essayer de créer un salon.',
  },
};

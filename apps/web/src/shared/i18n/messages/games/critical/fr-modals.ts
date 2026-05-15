export const modals = {
  common: { cancel: 'Annuler', confirm: 'Confirmer', close: 'Fermer' },
  omniscience: {
    title: 'Omniscience',
    subtitle: 'Vous voyez toutes les cartes en jeu !',
    emptyHand: 'Pas de cartes en main.',
  },
  alterTheFuture: {
    title: "Altérer l'Avenir",
    description: 'Réorganisez le dessus du paquet. Le n°1 sera pioché.',
    confirm: 'Confirmer',
  },
  shareTheFuture: {
    title: "Partager l'Avenir",
  },
  eventCombo: {
    title: 'Jouer un Combo',
    selectType: 'Sélectionner le type de Combo',
    pairTrio: 'Paire/Trio',
    selectComboCard: 'Sélectionner une carte',
    fiver: 'Cinq',
    anyFive: '5 cartes différentes',
    selectMode: 'Sélectionner le mode de Combo',
    pair: 'Paire',
    pairDesc: 'Carte aléatoire de la cible',
    trio: 'Trio',
    trioDesc: 'Choisir une carte spécifique',
    trioMode: '2-3 cartes',
    selectTarget: 'Sélectionner le Joueur Cible',
    selectCard: 'Sélectionner la Carte à Demander',
    cardsCount: '{{count}} cartes',
    confirm: 'Jouer le Combo',
    stashCards: 'Sélectionner {{count}} cartes différentes',
    pickDiscard: 'Choisir une carte dans la pile de défausse',
    selectCardHint: 'Sélectionnez une carte ci-dessous',
    pickCardBlind: "Choisissez une carte (à l'aveugle)",
    cardLabel: 'Carte {{index}}',
  },
  seeTheFuture: { title: 'Cartes du Dessus', confirm: 'Compris !' },
  targetedAttack: {
    title: 'Attaque Ciblée',
    selectPlayer: 'Sélectionner un Joueur',
    description:
      'Choisissez un joueur pour prendre 2 tours à la place du joueur suivant.',
  },
  favor: {
    title: 'Demander une Faveur',
    selectPlayer: 'Sélectionner un Joueur',
    description:
      'Le joueur sélectionné vous donnera une carte aléatoire de sa main.',
    cardsCount: '{{count}} cartes',
    confirm: 'Prendre Carte Aléatoire',
  },
  giveFavor: {
    title: 'Donner une Carte',
    description:
      '{{player}} a demandé une faveur. Choisissez une carte à lui donner.',
    confirm: 'Donner Carte',
  },
  defuse: {
    title: "Désamorcer l'Incident Critique !",
    description: "Choisissez où placer l'Incident Critique dans le paquet",
    positionLabel: 'Position dans le paquet :',
    confirm: 'Placer la Carte',
  },
  stash: {
    title: 'Tour de Pouvoir',
    description:
      "Sélectionnez jusqu'à 3 cartes à protéger dans votre réserve. Les cartes cachées ne peuvent pas être volées ou données.",
    confirm: 'Réserver Cartes',
  },
  mark: {
    title: 'Marquer Joueur',
    description:
      "Choisissez un joueur à marquer. Une carte aléatoire de sa main sera marquée. S'il la joue ou la défausse, vous la volez !",
    confirm: 'Marquer Joueur',
  },
  stealDraw: {
    title: 'Je Prends Ça',
    description:
      "Choisissez un joueur. La prochaine carte qu'il piochera sera volée et ajoutée à votre main à la place !",
    confirm: 'Confirmer le Vol',
  },
};

export const adminEconomyFr = {
  title: "Paramètres d'économie",
  subtitle:
    "Remplacez les valeurs d'économie à la volée. Les changements prennent effet après le TTL du cache (60 s par défaut) ou après rafraîchissement.",
  loading: 'Chargement…',
  empty: "Aucun paramètre d'économie trouvé.",
  keys: {
    game_win_coin_reward: {
      name: 'Récompense de victoire',
      description: "Pièces créditées à chaque gagnant à la fin d'une partie.",
    },
    gem_to_coin_rate: {
      name: 'Taux gemmes-pièces',
      description: 'Nombre de pièces obtenues par gemme convertie.',
    },
    referral_reward_coins_per: {
      name: 'Bonus de parrainage',
      description: 'Pièces créditées au parrain pour chaque filleul confirmé.',
    },
    referral_tier_1_bonus_coins: {
      name: 'Bonus palier 1 (3 invités)',
      description:
        'Bonus unique de pièces lorsque le parrain atteint 3 parrainages réussis.',
    },
    referral_tier_2_bonus_coins: {
      name: 'Bonus palier 2 (5 invités)',
      description:
        'Bonus unique de pièces lorsque le parrain atteint 5 parrainages réussis.',
    },
    referral_tier_3_bonus_coins: {
      name: 'Bonus palier 3 (10 invités)',
      description:
        'Bonus unique de pièces lorsque le parrain atteint 10 parrainages réussis.',
    },
  },
  table: {
    key: 'Paramètre',
    current: 'Valeur actuelle',
    default: 'Défaut',
    source: 'Source',
    lastChanged: 'Dernière modification',
    actions: 'Actions',
  },
  sources: {
    override: 'Remplacement admin',
    env: "Variable d'environnement",
    default: 'Valeur par défaut',
  },
  buttons: {
    edit: 'Modifier',
    reset: 'Réinitialiser',
    history: 'Historique',
    refreshCache: 'Rafraîchir le cache',
  },
  editDialog: {
    title: 'Modifier {{key}}',
    currentLabel: 'Actuel',
    newValueLabel: 'Nouvelle valeur',
    save: 'Enregistrer',
    cancel: 'Annuler',
  },
  auditDrawer: {
    title: 'Historique de {{key}}',
    empty: "Aucun changement pour l'instant.",
    from: 'De',
    to: 'À',
    changedBy: '{{name}}',
    changedAt: '{{date}}',
  },
  errors: {
    invalidValue:
      'La valeur doit être un entier positif inférieur à 1 000 000.',
    keyNotFound: 'Paramètre inconnu.',
    forbidden: "Vous n'avez pas la permission.",
    generic: 'Impossible de sauvegarder. Veuillez réessayer.',
  },
  toasts: {
    saved: 'Enregistré {{key}} = {{value}}.',
    reset: 'Réinitialisé {{key}} à la valeur par défaut.',
    cacheCleared: 'Cache vidé sur cette instance.',
  },
};

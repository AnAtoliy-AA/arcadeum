export const adminEconomyFr = {
  title: "Paramètres d'économie",
  table: {
    key: 'Clé',
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

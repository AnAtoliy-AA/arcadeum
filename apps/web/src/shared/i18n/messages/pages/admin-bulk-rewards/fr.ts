export const adminBulkRewardsFr = {
  title: 'Récompenses en Masse',
  subtitle:
    'Envoyer des récompenses (pièces, gemmes, arcadeum ou objets) à tous les utilisateurs enregistrés.',
  form: {
    type: {
      label: 'Type de Récompense',
      coinsLabel: 'Pièces',
      gemsLabel: 'Gemmes',
      arcadeumLabel: 'Arcadeum',
      itemLabel: 'Objet',
    },
    amount: {
      label: 'Montant',
      placeholder: 'Entrer le montant',
    },
    itemId: {
      label: "ID de l'Objet",
      placeholder: "Entrer l'ID de l'objet du catalogue",
    },
    reason: {
      label: 'Raison (optionnel)',
      placeholder: 'ex. Bonus de vacances, Compensation',
    },
    submit: 'Envoyer à Tous les Utilisateurs',
    submitting: 'Envoi en cours...',
  },
  result: {
    success: 'Récompenses envoyées avec succès !',
    partial: 'Récompenses partiellement envoyées.',
    statusFailed: "Échec de l'envoi des récompenses.",
    total: 'Total des utilisateurs',
    successful: 'Réussies',
    failed: 'Échouées',
    errors: 'Erreurs',
  },
  confirm: {
    title: 'Confirmer la Récompense en Masse',
    message:
      'Cela enverra {amount} {type} à tous les utilisateurs enregistrés. Êtes-vous sûr ?',
    confirm: 'Confirmer',
    cancel: 'Annuler',
  },
  validation: {
    amountRequired: 'Le montant est requis',
    itemIdRequired: "L'ID de l'objet est requis pour les récompenses d'objets",
    invalidAmount: 'Le montant doit être entre 1 et 1 000 000',
  },
};

export type AdminBulkRewardsI18n = typeof adminBulkRewardsFr;

export const adminXpBackfillFr = {
  title: 'XP Backfill',
  subtitle:
    'Recalculer et attribuer les XP à tous les utilisateurs existants en fonction de leurs parties jouées. Formule : victoires × 100 + défaites × 40 + matchs nuls × 60.',
  form: {
    submit: 'Lancer le Backfill',
    dryRun: 'Essai (aperçu uniquement)',
    submitting: 'Exécution...',
  },
  result: {
    success: 'Backfill terminé avec succès !',
    dryRun: 'Essai terminé — aucune modification effectuée.',
    affected: 'Utilisateurs mis à jour',
    skipped: 'Utilisateurs ignorés',
    details: 'Détails',
    noUsers: 'Aucun utilisateur avec des statistiques de jeu trouvé.',
    close: 'Fermer',
  },
  confirm: {
    title: 'Confirmer le XP Backfill',
    message:
      'Cela recalculera les XP pour tous les utilisateurs selon leur historique de jeu. Les utilisateurs dont le XP actuel est déjà supérieur seront ignorés. Continuer ?',
    confirm: 'Confirmer',
    cancel: 'Annuler',
  },
};

export type AdminXpBackfillI18n = typeof adminXpBackfillFr;

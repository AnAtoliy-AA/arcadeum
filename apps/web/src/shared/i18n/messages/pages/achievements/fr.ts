export const achievementsFr = {
  title: 'Succès',
  subtitle: 'Débloquez des succès en jouant et en atteignant des objectifs.',
  claim: 'Réclamer',
  claimed: '✓ Réclamé',
  locked: '🔒',
  unlocked: '✓',
  xpReward: '+{n} XP',
  progress: '{current} / {target}',
  categories: {
    gameplay: 'Jeu',
    social: 'Social',
    collection: 'Collection',
    competitive: 'Compétitif',
  },
  rarities: {
    common: 'Commun',
    rare: 'Rare',
    epic: 'Épique',
    legendary: 'Légendaire',
  },
  errors: {
    alreadyClaimed: 'Déjà réclamé.',
    unauthorized: 'Connectez-vous pour voir les succès.',
    generic: 'Impossible de réclamer. Veuillez réessayer.',
  },
  toasts: {
    claimed: 'Vous avez réclamé {n} XP !',
    unlocked: 'Succès débloqué : {name} !',
  },
};

export type AchievementsI18n = typeof achievementsFr;

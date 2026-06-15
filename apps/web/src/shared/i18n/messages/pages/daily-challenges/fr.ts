export const dailyChallengesFr = {
  title: 'Défis Quotidiens',
  subtitle:
    'Complétez des défis pour gagner des récompenses. Nouveaux défis chaque jour.',
  claim: 'Réclamer',
  claimed: '✓ Réclamé',
  allCompleted: 'Tous les défis sont terminés. Revenez demain.',
  progress: '{current} / {target}',
  rewards: {
    coins: '{n} pièces',
    gems: '{n} gemmes',
  },
  errors: {
    alreadyClaimed: 'Déjà réclamé.',
    unauthorized: 'Connectez-vous pour réclamer votre récompense.',
    generic: 'Impossible de réclamer. Veuillez réessayer.',
  },
  toasts: {
    claimed: 'Vous avez réclamé {n} {type} !',
  },
};

export type DailyChallengesI18n = typeof dailyChallengesFr;

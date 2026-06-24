export const dailyChallengesEs = {
  title: 'Desafíos Diarios',
  subtitle:
    'Completa desafíos para ganar recompensas. Nuevos desafíos cada día.',
  claim: 'Reclamar',
  claimed: '✓ Reclamado',
  allCompleted: 'Todos los desafíos completados. Vuelve mañana.',
  progress: '{current} / {target}',
  rewards: {
    coins: '{n} monedas',
    gems: '{n} gemas',
  },
  errors: {
    alreadyClaimed: 'Ya reclamado.',
    unauthorized: 'Inicia sesión para reclamar tu recompensa.',
    generic: 'No se pudo reclamar. Inténtalo de nuevo.',
  },
  toasts: {
    claimed: '¡Reclamaste {n} {type}!',
  },
};

export type DailyChallengesI18n = typeof dailyChallengesEs;

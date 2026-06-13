export const achievementsEs = {
  title: 'Logros',
  subtitle: 'Desbloquea logros jugando y alcanzando hitos.',
  claim: 'Reclamar',
  claimed: '✓ Reclamado',
  locked: '🔒',
  unlocked: '✓',
  xpReward: '+{n} XP',
  progress: '{current} / {target}',
  categories: {
    gameplay: 'Juego',
    social: 'Social',
    collection: 'Colección',
    competitive: 'Competitivo',
  },
  rarities: {
    common: 'Común',
    rare: 'Raro',
    epic: 'Épico',
    legendary: 'Legendario',
  },
  errors: {
    alreadyClaimed: 'Ya reclamado.',
    unauthorized: 'Inicia sesión para ver logros.',
    generic: 'No se pudo reclamar. Inténtalo de nuevo.',
  },
  toasts: {
    claimed: '¡Reclamaste {n} XP!',
    unlocked: '¡Logro desbloqueado: {name}!',
  },
};

export type AchievementsI18n = typeof achievementsEs;

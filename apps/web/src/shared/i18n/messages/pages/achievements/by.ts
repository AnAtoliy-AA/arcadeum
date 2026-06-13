export const achievementsBy = {
  title: 'Дасягненні',
  subtitle: 'Адкрывайце дасягненні, гуляючы і дасягаючы мэтаў.',
  claim: 'Атрымаць',
  claimed: '✓ Атрымана',
  locked: '🔒',
  unlocked: '✓',
  xpReward: '+{n} XP',
  progress: '{current} / {target}',
  categories: {
    gameplay: 'Гульнявы працэс',
    social: 'Сацыяльнае',
    collection: 'Калекцыя',
    competitive: 'Спаборніцкае',
  },
  rarities: {
    common: 'Звычайнае',
    rare: 'Рэдкае',
    epic: 'Эпічнае',
    legendary: 'Легендарнае',
  },
  errors: {
    alreadyClaimed: 'Ужо атрымана.',
    unauthorized: 'Увайдзіце, каб бачыць дасягненні.',
    generic: 'Не ўдалося атрымаць. Паспрабуйце яшчэ раз.',
  },
  toasts: {
    claimed: 'Вы атрымалі {n} XP!',
    unlocked: 'Дасягненне адкрыта: {name}!',
  },
};

export type AchievementsI18n = typeof achievementsBy;

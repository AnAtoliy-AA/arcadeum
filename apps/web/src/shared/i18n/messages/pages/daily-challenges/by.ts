export const dailyChallengesBy = {
  title: 'Штодзённыя заданні',
  subtitle:
    'Выконвайце заданні, каб атрымаць узнагароды. Новыя заданні кожны дзень.',
  claim: 'Атрымаць',
  claimed: '✓ Атрымана',
  allCompleted: 'Усе заданні выкананы! Вяртайцеся заўтра.',
  progress: '{current} / {target}',
  rewards: {
    coins: '{n} манет',
    gems: '{n} гемаў',
  },
  errors: {
    alreadyClaimed: 'Ужо атрымана.',
    unauthorized: 'Увайдзіце, каб атрымаць узнагароду.',
    generic: 'Не ўдалося атрымаць. Паспрабуйце яшчэ раз.',
  },
  toasts: {
    claimed: 'Вы атрымалі {n} {type}!',
  },
};

export type DailyChallengesI18n = typeof dailyChallengesBy;

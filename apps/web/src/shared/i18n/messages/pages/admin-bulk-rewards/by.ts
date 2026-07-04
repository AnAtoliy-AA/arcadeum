export const adminBulkRewardsBy = {
  title: 'Масавыя Ўзнагароды',
  subtitle:
    'Адправіць узнагароды (манеты, гемы, arcadeum ці прадметы) усім зарэгістраваным карыстальнікам.',
  form: {
    type: {
      label: 'Тып Узнагароды',
      coinsLabel: 'Манеты',
      gemsLabel: 'Гемы',
      arcadeumLabel: 'Arcadeum',
      itemLabel: 'Прадмет',
    },
    amount: {
      label: 'Колькасць',
      placeholder: 'Увядзіце колькасць',
    },
    itemId: {
      label: 'ID Прадмета',
      placeholder: 'Увядзіце ID прадмета з каталога',
    },
    reason: {
      label: 'Прычына (неабавязкова)',
      placeholder: 'напр. Святочны бонус, Кампенсацыя',
    },
    submit: 'Адправіць Усім Карыстальнікам',
    submitting: 'Адпраўка...',
  },
  result: {
    success: 'Узнагароды паспяхова адпраўлены!',
    partial: 'Узнагароды часткова адпраўлены.',
    statusFailed: 'Не ўдалося адправіць узнагароды.',
    total: 'Усяго карыстальнікаў',
    successful: 'Паспяховыя',
    failed: 'Няўдалыя',
    errors: 'Памылкі',
  },
  confirm: {
    title: 'Пацвердзіць Масавую Ўзнагароду',
    message:
      'Гэта адправіць {amount} {type} усім зарэгістраваным карыстальнікам. Вы ўпэўнены?',
    confirm: 'Пацвердзіць',
    cancel: 'Скасаваць',
  },
  validation: {
    amountRequired: 'Колькасць абавязкова',
    itemIdRequired: 'ID прадмета абавязковы для узнагарод у выглядзе прадметаў',
    invalidAmount: 'Колькасць павінна быць ад 1 да 1 000 000',
  },
};

export type AdminBulkRewardsI18n = typeof adminBulkRewardsBy;

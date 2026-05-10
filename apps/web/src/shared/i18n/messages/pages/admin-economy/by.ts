// Belarusian mirrors Russian for these short admin labels.
export const adminEconomyBy = {
  title: 'Настройкі эканомікі',
  keys: {
    game_win_coin_reward: {
      name: 'Узнагарода за перамогу',
      description:
        'Манеты, якія налічваюцца кожнаму пераможцу пасля заканчэння гульнявой сесіі.',
    },
    gem_to_coin_rate: {
      name: 'Курс гемаў у манеты',
      description: 'Колькі манет дае адзін гем пры канвертацыі.',
    },
    referral_reward_coins_per: {
      name: 'Бонус за рэферала',
      description:
        'Манеты, якія атрымлівае запрашальнік за кожнага паспяховага рэферала.',
    },
    referral_tier_1_bonus_coins: {
      name: 'Бонус узроўню 1 (3 запрошаных)',
      description:
        'Аднаразовы бонус манет, калі запрашальнік дасягае 3 паспяховых запрашэнняў.',
    },
    referral_tier_2_bonus_coins: {
      name: 'Бонус узроўню 2 (5 запрошаных)',
      description:
        'Аднаразовы бонус манет, калі запрашальнік дасягае 5 паспяховых запрашэнняў.',
    },
    referral_tier_3_bonus_coins: {
      name: 'Бонус узроўню 3 (10 запрошаных)',
      description:
        'Аднаразовы бонус манет, калі запрашальнік дасягае 10 паспяховых запрашэнняў.',
    },
  },
  table: {
    key: 'Настройка',
    current: 'Бягучае значэнне',
    default: 'Па змаўчанні',
    source: 'Крыніца',
    lastChanged: 'Апошняя змена',
    actions: 'Дзеянні',
  },
  sources: {
    override: 'Змена адміністратарам',
    env: 'Зменная асяроддзя',
    default: 'Значэнне па змаўчанні',
  },
  buttons: {
    edit: 'Рэдагаваць',
    reset: 'Скінуць да змаўчання',
    history: 'Гісторыя',
    refreshCache: 'Абнавіць кэш',
  },
  editDialog: {
    title: 'Рэдагаваць {{key}}',
    currentLabel: 'Бягучае',
    newValueLabel: 'Новае значэнне',
    save: 'Захаваць',
    cancel: 'Адмена',
  },
  auditDrawer: {
    title: 'Гісторыя: {{key}}',
    empty: 'Змен пакуль няма.',
    from: 'З',
    to: 'У',
    changedBy: '{{name}}',
    changedAt: '{{date}}',
  },
  errors: {
    invalidValue: 'Значэнне мусіць быць дадатным цэлым лікам да 1 000 000.',
    keyNotFound: 'Невядомая настройка.',
    forbidden: 'У вас няма правоў.',
    generic: 'Не ўдалося захаваць. Паўтарыце спробу.',
  },
  toasts: {
    saved: 'Захавана {{key}} = {{value}}.',
    reset: 'Скінута {{key}} да змаўчання.',
    cacheCleared: 'Кэш ачышчаны на гэтым экзэмпляры.',
  },
};

// Belarusian mirrors Russian for these short admin labels.
export const adminEconomyBy = {
  title: 'Настройкі эканомікі',
  table: {
    key: 'Ключ',
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

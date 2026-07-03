export const adminUsersBy = {
  title: 'Карыстальнікі',
  search: { placeholder: 'Пошук па імі, email або псеўданіме' },
  filter: {
    role: { all: 'Усе ролі', placeholder: 'Фільтр па ролі' },
    status: {
      all: 'Усе статусы',
      placeholder: 'Фільтр па статусу',
    },
  },
  table: {
    username: 'Імя карыстальніка',
    email: 'Email',
    role: 'Роля',
    createdAt: 'Створаны',
    actions: 'Дзеянні',
  },
  empty: {
    noResults: 'Няма карыстальнікаў па фільтру.',
    noUsers: 'Карыстальнікаў пакуль няма.',
  },
  pagination: {
    prev: 'Назад',
    next: 'Наперад',
    of: 'Старонка {current} з {total}',
  },
  totalLabel: '{total} карыстальнікаў',
  selfTooltip: 'Вы не можаце змяніць сваю ўласную ролю.',
  role: {
    free: 'Бясплатны',
    premium: 'Прэміум',
    vip: 'VIP',
    supporter: 'Спонсар',
    moderator: 'Мадэратар',
    tester: 'Тэстар',
    developer: 'Распрацоўшчык',
    admin: 'Адмін',
  },
  status: {
    active: 'Актыўны',
    blocked: 'Заблакіраваны',
    deleted: 'Выдалены',
  },
  actions: {
    block: 'Заблакіраваць',
    unblock: 'Разблакіраваць',
    remove: 'Выдаліць',
    restore: 'Аднавіць',
  },
  errors: {
    SELF_ROLE_CHANGE_FORBIDDEN: 'Вы не можаце змяніць сваю ўласную ролю.',
    LAST_ADMIN_PROTECTED: 'Нельга паніжаць апошняга адміністратара.',
    USER_NOT_FOUND: 'Карыстальнік не знойдзены.',
    INVALID_USER_ID: 'Няправільны ідэнтыфікатар карыстальніка.',
    CANNOT_BLOCK_SELF: 'Вы не можаце заблакіраваць сябе.',
    CANNOT_DELETE_SELF: 'Вы не можаце выдаліць сябе.',
    generic: 'Нешта пайшло не так. Калі ласка, паспрабуйце яшчэ раз.',
  },
};

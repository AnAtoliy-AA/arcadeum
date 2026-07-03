export const adminUsersRu = {
  title: 'Пользователи',
  search: {
    placeholder: 'Поиск по имени, email или отображаемому имени',
  },
  filter: {
    role: { all: 'Все роли', placeholder: 'Фильтр по роли' },
    status: { all: 'Все статусы', placeholder: 'Фильтр по статусу' },
  },
  table: {
    username: 'Имя пользователя',
    email: 'Email',
    role: 'Роль',
    createdAt: 'Создан',
    actions: 'Действия',
  },
  empty: {
    noResults: 'Нет пользователей по фильтру.',
    noUsers: 'Пользователей пока нет.',
  },
  pagination: {
    prev: 'Назад',
    next: 'Вперёд',
    of: 'Страница {current} из {total}',
  },
  totalLabel: '{total} пользователей',
  selfTooltip: 'Нельзя изменить свою собственную роль.',
  role: {
    free: 'Бесплатный',
    premium: 'Премиум',
    vip: 'VIP',
    supporter: 'Спонсор',
    moderator: 'Модератор',
    tester: 'Тестер',
    developer: 'Разработчик',
    admin: 'Админ',
  },
  status: {
    active: 'Активный',
    blocked: 'Заблокирован',
    deleted: 'Удалён',
  },
  actions: {
    block: 'Заблокировать',
    unblock: 'Разблокировать',
    remove: 'Удалить',
    restore: 'Восстановить',
  },
  errors: {
    SELF_ROLE_CHANGE_FORBIDDEN: 'Нельзя изменить свою собственную роль.',
    LAST_ADMIN_PROTECTED: 'Нельзя понизить последнего администратора.',
    USER_NOT_FOUND: 'Пользователь не найден.',
    INVALID_USER_ID: 'Неверный идентификатор пользователя.',
    CANNOT_BLOCK_SELF: 'Нельзя заблокировать себя.',
    CANNOT_DELETE_SELF: 'Нельзя удалить себя.',
    generic: 'Что-то пошло не так. Попробуйте ещё раз.',
  },
};

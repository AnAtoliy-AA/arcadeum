export const adminBlockedIpsRu = {
  title: 'Заблокированные IP',
  empty: 'Нет заблокированных IP-адресов.',
  table: {
    ip: 'IP-адрес',
    reason: 'Причина',
    expiresAt: 'Истекает',
    actions: 'Действия',
  },
  unblock: 'Разблокировать',
  clearAll: 'Очистить все',
  totalLabel: '{total} заблокированных IP',
  confirmClearAll: 'Вы уверены, что хотите разблокировать все IP?',
  errors: {
    generic: 'Произошла ошибка. Попробуйте снова.',
  },
};

export type AdminBlockedIpsI18n = typeof adminBlockedIpsRu;

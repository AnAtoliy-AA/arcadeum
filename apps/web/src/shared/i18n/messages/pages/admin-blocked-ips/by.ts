export const adminBlockedIpsBy = {
  title: 'Заблакіраваныя IP',
  empty: 'Няма заблакіраваных IP-адрасоў.',
  table: {
    ip: 'IP-адрас',
    reason: 'Прычына',
    expiresAt: 'Дзейнічае да',
    actions: 'Дзеянні',
  },
  unblock: 'Разблакіраваць',
  clearAll: 'Ачысціць усе',
  totalLabel: '{total} заблакіраваных IP',
  confirmClearAll: 'Вы ўпэўнены, што хочаце разблакіраваць усе IP?',
  errors: {
    generic: 'Здарылася памылка. Паспрабуйце яшчэ раз.',
  },
};

export type AdminBlockedIpsI18n = typeof adminBlockedIpsBy;

export const adminBlockedIpsFr = {
  title: 'IPs Bloqués',
  empty: "Aucun IP n'est actuellement bloqué.",
  table: {
    ip: 'Adresse IP',
    reason: 'Raison',
    expiresAt: 'Expire',
    actions: 'Actions',
  },
  unblock: 'Débloquer',
  clearAll: 'Tout effacer',
  totalLabel: '{total} IP(s) bloqué(s)',
  confirmClearAll: 'Êtes-vous sûr de vouloir débloquer tous les IPs ?',
  errors: {
    generic: "Une erreur s'est produite. Veuillez réessayer.",
  },
};

export type AdminBlockedIpsI18n = typeof adminBlockedIpsFr;

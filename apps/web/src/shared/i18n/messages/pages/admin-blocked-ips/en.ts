export const adminBlockedIpsEn = {
  title: 'Blocked IPs',
  empty: 'No IPs are currently blocked.',
  table: {
    ip: 'IP Address',
    reason: 'Reason',
    expiresAt: 'Expires',
    actions: 'Actions',
  },
  unblock: 'Unblock',
  clearAll: 'Clear All',
  totalLabel: '{total} blocked IP(s)',
  confirmClearAll: 'Are you sure you want to unblock all IPs?',
  errors: {
    generic: 'Something went wrong. Please retry.',
  },
};

export type AdminBlockedIpsI18n = typeof adminBlockedIpsEn;

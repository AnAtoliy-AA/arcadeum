export const adminBlockedIpsEs = {
  title: 'IP Bloqueados',
  empty: 'No hay IPs bloqueados actualmente.',
  table: {
    ip: 'Dirección IP',
    reason: 'Razón',
    expiresAt: 'Expira',
    actions: 'Acciones',
  },
  unblock: 'Desbloquear',
  clearAll: 'Limpiar todo',
  totalLabel: '{total} IP(s) bloqueado(s)',
  confirmClearAll: '¿Estás seguro de que quieres desbloquear todos los IPs?',
  errors: {
    generic: 'Algo salió mal. Por favor, inténtalo de nuevo.',
  },
};

export type AdminBlockedIpsI18n = typeof adminBlockedIpsEs;

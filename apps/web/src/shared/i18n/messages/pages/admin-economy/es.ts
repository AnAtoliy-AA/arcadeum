export const adminEconomyEs = {
  title: 'Configuración de economía',
  table: {
    key: 'Clave',
    current: 'Valor actual',
    default: 'Predeterminado',
    source: 'Origen',
    lastChanged: 'Último cambio',
    actions: 'Acciones',
  },
  sources: {
    override: 'Anulación de admin',
    env: 'Variable de entorno',
    default: 'Valor predeterminado',
  },
  buttons: {
    edit: 'Editar',
    reset: 'Restablecer',
    history: 'Historial',
    refreshCache: 'Actualizar caché',
  },
  editDialog: {
    title: 'Editar {{key}}',
    currentLabel: 'Actual',
    newValueLabel: 'Nuevo valor',
    save: 'Guardar',
    cancel: 'Cancelar',
  },
  auditDrawer: {
    title: 'Historial de {{key}}',
    empty: 'Sin cambios todavía.',
    from: 'De',
    to: 'A',
    changedBy: '{{name}}',
    changedAt: '{{date}}',
  },
  errors: {
    invalidValue: 'El valor debe ser un entero positivo hasta 1.000.000.',
    keyNotFound: 'Configuración desconocida.',
    forbidden: 'No tienes permiso.',
    generic: 'No se pudo guardar. Por favor, inténtalo de nuevo.',
  },
  toasts: {
    saved: 'Guardado {{key}} = {{value}}.',
    reset: 'Restablecido {{key}} al valor predeterminado.',
    cacheCleared: 'Caché limpiada en esta instancia.',
  },
};

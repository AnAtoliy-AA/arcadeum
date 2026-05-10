export const adminEconomyEs = {
  title: 'Configuración de economía',
  keys: {
    game_win_coin_reward: {
      name: 'Recompensa por victoria',
      description: 'Monedas otorgadas a cada ganador al finalizar una partida.',
    },
    gem_to_coin_rate: {
      name: 'Tasa gemas a monedas',
      description: 'Cuántas monedas produce una gema al convertir.',
    },
    referral_reward_coins_per: {
      name: 'Bono por referido',
      description: 'Monedas que recibe el invitador por cada referido exitoso.',
    },
    referral_tier_1_bonus_coins: {
      name: 'Bono nivel 1 (3 invitados)',
      description: 'Bono único de monedas al alcanzar 3 referidos exitosos.',
    },
    referral_tier_2_bonus_coins: {
      name: 'Bono nivel 2 (5 invitados)',
      description: 'Bono único de monedas al alcanzar 5 referidos exitosos.',
    },
    referral_tier_3_bonus_coins: {
      name: 'Bono nivel 3 (10 invitados)',
      description: 'Bono único de monedas al alcanzar 10 referidos exitosos.',
    },
  },
  table: {
    key: 'Ajuste',
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

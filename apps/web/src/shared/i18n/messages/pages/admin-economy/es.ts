export const adminEconomyEs = {
  title: 'Configuración de economía',
  subtitle:
    'Anula los valores de economía en tiempo real. Los cambios se aplican tras el TTL de la caché (60 s por defecto) o al refrescarla.',
  loading: 'Cargando…',
  empty: 'No se encontraron ajustes de economía.',
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
    daily_reward_day_1: {
      name: 'Recompensa diaria — Día 1',
      description: 'Monedas otorgadas el primer día de la racha de 7 días.',
    },
    daily_reward_day_2: {
      name: 'Recompensa diaria — Día 2',
      description: 'Monedas otorgadas el segundo día de la racha de 7 días.',
    },
    daily_reward_day_3: {
      name: 'Recompensa diaria — Día 3',
      description: 'Monedas otorgadas el tercer día de la racha de 7 días.',
    },
    daily_reward_day_4: {
      name: 'Recompensa diaria — Día 4',
      description: 'Monedas otorgadas el cuarto día de la racha de 7 días.',
    },
    daily_reward_day_5: {
      name: 'Recompensa diaria — Día 5',
      description: 'Monedas otorgadas el quinto día de la racha de 7 días.',
    },
    daily_reward_day_6: {
      name: 'Recompensa diaria — Día 6',
      description: 'Monedas otorgadas el sexto día de la racha de 7 días.',
    },
    daily_reward_day_7: {
      name: 'Recompensa diaria — Día 7',
      description: 'Monedas otorgadas el séptimo día de la racha de 7 días.',
    },
    daily_reward_day_7_bonus_gems: {
      name: 'Recompensa diaria — Bono de gemas del Día 7',
      description:
        'Gemas otorgadas además de las monedas el Día 7 de la racha.',
    },
    shop_allow_gems: {
      name: 'Tienda: permitir gemas',
      description: 'Permitir el uso de gemas en la tienda.',
    },
    shop_allow_arcadeum: {
      name: 'Tienda: permitir Arcadeum',
      description: 'Permitir el uso de Arcadeum en la tienda.',
    },
    gems_allow_arcadeum: {
      name: 'Gemas: permitir Arcadeum',
      description: 'Permitir la conversión de gemas a Arcadeum.',
    },
    gem_to_usd_rate: {
      name: 'Tasa gemas a USD',
      description: 'Tasa de conversión de una gema a dólares estadounidenses.',
    },
    arcadeum_discount_percent: {
      name: 'Descuento Arcadeum (%)',
      description: 'Porcentaje de descuento al comprar con Arcadeum.',
    },
    geo_block_enabled: {
      name: 'Bloqueo geográfico',
      description: 'Activar el bloqueo de acceso por geolocalización.',
    },
    vpn_detection_enabled: {
      name: 'Detección de VPN',
      description: 'Activar la detección y bloqueo de conexiones VPN.',
    },
    signup_reward_coins: {
      name: 'Recompensa de registro: monedas',
      description:
        'Cantidad de monedas otorgadas a un nuevo usuario al registrarse.',
    },
    signup_reward_gems: {
      name: 'Recompensa de registro: gemas',
      description:
        'Cantidad de gemas otorgadas a un nuevo usuario al registrarse.',
    },
    social_reward_gems: {
      name: 'Recompensa por suscripción a redes: gemas',
      description:
        'Cantidad de gemas otorgadas por suscripción/seguimiento a cada red social.',
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
    reset: 'Restablecer predeterminado',
    enable: 'Habilitar',
    disable: 'Deshabilitar',
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
    invalidValue: 'El valor debe ser un entero no negativo hasta 1.000.000.',
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

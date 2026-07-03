export const adminBulkRewardsEs = {
  title: 'Recompensas Masivas',
  subtitle:
    'Enviar recompensas (monedas, gemas, arcadeum o artículos) a todos los usuarios registrados.',
  form: {
    type: {
      label: 'Tipo de Recompensa',
      coinsLabel: 'Monedas',
      gemsLabel: 'Gemas',
      arcadeumLabel: 'Arcadeum',
      itemLabel: 'Artículo',
    },
    amount: {
      label: 'Cantidad',
      placeholder: 'Ingresar cantidad',
    },
    itemId: {
      label: 'ID del Artículo',
      placeholder: 'Ingresar ID del artículo del catálogo',
    },
    reason: {
      label: 'Razón (opcional)',
      placeholder: 'ej. Bono de vacaciones, Compensación',
    },
    submit: 'Enviar a Todos los Usuarios',
    submitting: 'Enviando...',
  },
  result: {
    success: '¡Recompensas enviadas exitosamente!',
    partial: 'Recompensas parcialmente enviadas.',
    statusFailed: 'Error al enviar recompensas.',
    total: 'Total de usuarios',
    successful: 'Exitosas',
    failed: 'Fallidas',
    errors: 'Errores',
  },
  confirm: {
    title: 'Confirmar Recompensa Masiva',
    message:
      'Esto enviará {amount} {type} a todos los usuarios registrados. ¿Estás seguro?',
    confirm: 'Confirmar',
    cancel: 'Cancelar',
  },
  validation: {
    amountRequired: 'La cantidad es requerida',
    itemIdRequired:
      'El ID del artículo es requerido para recompensas de artículos',
    invalidAmount: 'La cantidad debe estar entre 1 y 1,000,000',
  },
};

export type AdminBulkRewardsI18n = typeof adminBulkRewardsEs;

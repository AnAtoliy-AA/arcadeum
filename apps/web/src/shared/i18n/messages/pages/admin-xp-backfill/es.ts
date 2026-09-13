export const adminXpBackfillEs = {
  title: 'XP Backfill',
  subtitle:
    'Recalcular y asignar XP a todos los usuarios existentes basándose en sus partidas jugadas. Fórmula: victorias × 100 + derrotas × 40 + empates × 60.',
  form: {
    submit: 'Ejecutar Backfill',
    dryRun: 'Prueba (solo vista previa)',
    submitting: 'Ejecutando...',
  },
  result: {
    success: 'Backfill completado con éxito.',
    dryRun: 'Prueba completada — no se realizaron cambios.',
    affected: 'Usuarios actualizados',
    skipped: 'Usuarios omitidos',
    details: 'Detalles',
    noUsers: 'No se encontraron usuarios con estadísticas de juego.',
    close: 'Cerrar',
  },
  confirm: {
    title: 'Confirmar XP Backfill',
    message:
      'Esto recalculará XP para todos los usuarios según su historial de juego. Los usuarios cuyo XP actual ya sea mayor serán omitidos. ¿Continuar?',
    confirm: 'Confirmar',
    cancel: 'Cancelar',
  },
};

export type AdminXpBackfillI18n = typeof adminXpBackfillEs;

export const adminXpBackfillRu = {
  title: 'XP Backfill',
  subtitle:
    'Пересчитать и назначить XP всем существующим пользователям на основе их сыгранных игр. Формула: победы × 100 + поражения × 40 + ничьи × 60.',
  form: {
    submit: 'Запустить Backfill',
    dryRun: 'Пробный запуск (только просмотр)',
    submitting: 'Выполняется...',
  },
  result: {
    success: 'Backfill успешно завершён!',
    dryRun: 'Пробный запуск завершён — изменения не внесены.',
    affected: 'Пользователей обновлено',
    skipped: 'Пользователей пропущено',
    details: 'Детали',
    noUsers: 'Пользователей с игровой статистикой не найдено.',
    close: 'Закрыть',
  },
  confirm: {
    title: 'Подтвердить XP Backfill',
    message:
      'Это пересчитает XP для всех пользователей на основе их игровой истории. Пользователи, чей текущий XP уже выше, будут пропущены. Продолжить?',
    confirm: 'Подтвердить',
    cancel: 'Отмена',
  },
};

export type AdminXpBackfillI18n = typeof adminXpBackfillRu;

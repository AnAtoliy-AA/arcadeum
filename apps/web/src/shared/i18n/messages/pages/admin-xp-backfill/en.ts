export const adminXpBackfillEn = {
  title: 'XP Backfill',
  subtitle:
    'Recalculate and assign XP to all existing users based on their played games. Uses formula: wins × 100 + losses × 40 + draws × 60.',
  form: {
    submit: 'Run Backfill',
    dryRun: 'Dry Run (preview only)',
    submitting: 'Running...',
  },
  result: {
    success: 'Backfill completed successfully!',
    dryRun: 'Dry run completed — no changes were made.',
    affected: 'Users updated',
    skipped: 'Users skipped',
    details: 'Details',
    noUsers: 'No users with game stats found.',
    close: 'Close',
  },
  confirm: {
    title: 'Confirm XP Backfill',
    message:
      'This will recalculate XP for all users based on their game history. Users whose current XP is already higher will be skipped. Continue?',
    confirm: 'Confirm',
    cancel: 'Cancel',
  },
};

export type AdminXpBackfillI18n = typeof adminXpBackfillEn;

export const adminEconomyEn = {
  title: 'Economy settings',
  table: {
    key: 'Key',
    current: 'Current value',
    default: 'Default',
    source: 'Source',
    lastChanged: 'Last changed',
    actions: 'Actions',
  },
  sources: {
    override: 'Admin override',
    env: 'Environment',
    default: 'Code default',
  },
  buttons: {
    edit: 'Edit',
    reset: 'Reset to default',
    history: 'History',
    refreshCache: 'Refresh cache',
  },
  editDialog: {
    title: 'Edit {{key}}',
    currentLabel: 'Current',
    newValueLabel: 'New value',
    save: 'Save',
    cancel: 'Cancel',
  },
  auditDrawer: {
    title: 'History for {{key}}',
    empty: 'No changes yet.',
    from: 'From',
    to: 'To',
    changedBy: '{{name}}',
    changedAt: '{{date}}',
  },
  errors: {
    invalidValue: 'Value must be a positive integer up to 1,000,000.',
    keyNotFound: 'Unknown setting.',
    forbidden: 'You do not have permission.',
    generic: 'Could not save. Please retry.',
  },
  toasts: {
    saved: 'Saved {{key}} = {{value}}.',
    reset: 'Reset {{key}} to default.',
    cacheCleared: 'Cache cleared on this instance.',
  },
};

export type AdminEconomyI18n = typeof adminEconomyEn;

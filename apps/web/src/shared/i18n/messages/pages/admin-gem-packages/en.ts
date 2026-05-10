export const adminGemPackagesEn = {
  title: 'Gem Packages',
  actions: {
    new: '+ New package',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    save: 'Save',
  },
  table: {
    name: 'Name',
    gems: 'Gems',
    bonusGems: 'Bonus gems',
    price: 'Price',
    currency: 'Currency',
    status: 'Status',
    actions: 'Actions',
    active: 'Active',
    inactive: 'Inactive',
  },
  form: {
    sections: {
      details: 'Package details',
    },
    name: 'Package name',
    namePlaceholder: 'e.g. Starter Pack',
    gems: 'Gems',
    gemsPlaceholder: 'e.g. 100',
    bonusGems: 'Bonus gems',
    bonusGemsPlaceholder: '0',
    priceUsd: 'Price (USD)',
    pricePlaceholder: 'e.g. 4.99',
    isActive: 'Active',
  },
  empty: {
    noResults: 'No packages match your filters.',
    noPackages: 'No gem packages yet.',
  },
  errors: {
    loadFailed: 'Could not load gem packages.',
    saveFailed: 'Could not save gem package.',
    deleteFailed: 'Could not delete gem package.',
    nameRequired: 'Package name is required.',
    gemsRequired: 'Gems amount is required.',
    priceRequired: 'Price is required.',
    generic: 'Something went wrong. Please try again.',
  },
  confirm: {
    deleteTitle: 'Delete package',
    deleteBody:
      'Are you sure you want to delete "{name}"? This cannot be undone.',
    deleteConfirm: 'Delete',
    deleteCancel: 'Cancel',
  },
};

export type AdminGemPackagesI18n = typeof adminGemPackagesEn;

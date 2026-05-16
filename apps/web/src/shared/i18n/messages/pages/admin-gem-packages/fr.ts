import type { AdminGemPackagesI18n } from './en';

export const adminGemPackagesFr: AdminGemPackagesI18n = {
  title: 'Packs de gemmes',
  actions: {
    new: '+ Nouveau pack',
    edit: 'Modifier',
    delete: 'Supprimer',
    cancel: 'Annuler',
    save: 'Enregistrer',
  },
  table: {
    name: 'Nom',
    gems: 'Gemmes',
    bonusGems: 'Gemmes bonus',
    price: 'Prix',
    currency: 'Devise',
    status: 'Statut',
    actions: 'Actions',
    active: 'Actif',
    inactive: 'Inactif',
  },
  form: {
    sections: {
      details: 'Détails du pack',
    },
    name: 'Nom du pack',
    namePlaceholder: 'ex. Pack de démarrage',
    gems: 'Gemmes',
    gemsPlaceholder: 'ex. 100',
    bonusGems: 'Gemmes bonus',
    bonusGemsPlaceholder: '0',
    priceUsd: 'Prix (USD)',
    pricePlaceholder: 'ex. 4.99',
    isActive: 'Actif',
  },
  empty: {
    noResults: 'Aucun pack ne correspond aux filtres.',
    noPackages: 'Aucun pack de gemmes pour le moment.',
  },
  errors: {
    loadFailed: 'Impossible de charger les packs de gemmes.',
    saveFailed: "Impossible d'enregistrer le pack.",
    deleteFailed: 'Impossible de supprimer le pack.',
    nameRequired: 'Le nom du pack est obligatoire.',
    gemsRequired: 'La quantité de gemmes est obligatoire.',
    priceRequired: 'Le prix est obligatoire.',
    generic: "Quelque chose s'est mal passé. Veuillez réessayer.",
  },
  confirm: {
    deleteTitle: 'Supprimer le pack',
    deleteBody:
      'Êtes-vous sûr de vouloir supprimer « {name} » ? Cette action est irréversible.',
    deleteConfirm: 'Supprimer',
    deleteCancel: 'Annuler',
  },
};

import type { AdminGemPackagesI18n } from './en';

export const adminGemPackagesEs: AdminGemPackagesI18n = {
  title: 'Paquetes de gemas',
  actions: {
    new: '+ Nuevo paquete',
    edit: 'Editar',
    delete: 'Eliminar',
    cancel: 'Cancelar',
    save: 'Guardar',
  },
  table: {
    name: 'Nombre',
    gems: 'Gemas',
    bonusGems: 'Gemas bono',
    price: 'Precio',
    currency: 'Divisa',
    status: 'Estado',
    actions: 'Acciones',
    active: 'Activo',
    inactive: 'Inactivo',
  },
  form: {
    sections: {
      details: 'Detalles del paquete',
    },
    name: 'Nombre del paquete',
    namePlaceholder: 'p. ej. Pack inicial',
    gems: 'Gemas',
    gemsPlaceholder: 'p. ej. 100',
    bonusGems: 'Gemas bono',
    bonusGemsPlaceholder: '0',
    priceUsd: 'Precio (USD)',
    pricePlaceholder: 'p. ej. 4.99',
    isActive: 'Activo',
  },
  empty: {
    noResults: 'Ningún paquete coincide con los filtros.',
    noPackages: 'Aún no hay paquetes de gemas.',
  },
  errors: {
    loadFailed: 'No se pudieron cargar los paquetes de gemas.',
    saveFailed: 'No se pudo guardar el paquete.',
    deleteFailed: 'No se pudo eliminar el paquete.',
    nameRequired: 'El nombre del paquete es obligatorio.',
    gemsRequired: 'La cantidad de gemas es obligatoria.',
    priceRequired: 'El precio es obligatorio.',
    generic: 'Algo salió mal. Por favor, inténtalo de nuevo.',
  },
  confirm: {
    deleteTitle: 'Eliminar paquete',
    deleteBody:
      '¿Estás seguro de que quieres eliminar "{name}"? Esta acción no se puede deshacer.',
    deleteConfirm: 'Eliminar',
    deleteCancel: 'Cancelar',
  },
};

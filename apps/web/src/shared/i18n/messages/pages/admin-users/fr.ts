export const adminUsersFr = {
  title: 'Utilisateurs',
  search: {
    placeholder: "Recherche par nom d'utilisateur, email ou nom",
  },
  filter: {
    role: { all: 'Tous les rôles', placeholder: 'Filtrer par rôle' },
    status: {
      all: 'Tous les statuts',
      placeholder: 'Filtrer par statut',
    },
  },
  table: {
    username: "Nom d'utilisateur",
    email: 'Email',
    role: 'Rôle',
    createdAt: 'Créé le',
    actions: 'Actions',
  },
  empty: {
    noResults: 'Aucun utilisateur ne correspond aux filtres.',
    noUsers: 'Aucun utilisateur pour le moment.',
  },
  pagination: {
    prev: 'Précédent',
    next: 'Suivant',
    of: 'Page {current} sur {total}',
  },
  totalLabel: '{total} utilisateurs',
  selfTooltip: 'Vous ne pouvez pas changer votre propre rôle.',
  role: {
    free: 'Gratuit',
    premium: 'Premium',
    vip: 'VIP',
    supporter: 'Soutien',
    moderator: 'Modérateur',
    tester: 'Testeur',
    developer: 'Développeur',
    admin: 'Admin',
  },
  status: {
    active: 'Actif',
    blocked: 'Bloqué',
    deleted: 'Supprimé',
  },
  actions: {
    block: 'Bloquer',
    unblock: 'Débloquer',
    remove: 'Supprimer',
    restore: 'Restaurer',
  },
  errors: {
    SELF_ROLE_CHANGE_FORBIDDEN: 'Vous ne pouvez pas changer votre propre rôle.',
    LAST_ADMIN_PROTECTED:
      'Impossible de rétrograder le dernier administrateur.',
    USER_NOT_FOUND: 'Utilisateur introuvable.',
    INVALID_USER_ID: 'Identifiant utilisateur invalide.',
    CANNOT_BLOCK_SELF: 'Vous ne pouvez pas vous bloquer.',
    CANNOT_DELETE_SELF: 'Vous ne pouvez pas vous supprimer.',
    generic: "Quelque chose s'est mal passé. Veuillez réessayer.",
  },
};

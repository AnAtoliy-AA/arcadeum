export const adminUsersEs = {
  title: 'Usuarios',
  search: { placeholder: 'Buscar por usuario, email o nombre' },
  filter: {
    role: { all: 'Todos los roles', placeholder: 'Filtrar por rol' },
    status: {
      all: 'Todos los estados',
      placeholder: 'Filtrar por estado',
    },
  },
  table: {
    username: 'Usuario',
    email: 'Email',
    role: 'Rol',
    createdAt: 'Creado',
    actions: 'Acciones',
  },
  empty: {
    noResults: 'No hay usuarios que coincidan con los filtros.',
    noUsers: 'Aún no hay usuarios.',
  },
  pagination: {
    prev: 'Anterior',
    next: 'Siguiente',
    of: 'Página {current} de {total}',
  },
  totalLabel: '{total} usuarios',
  selfTooltip: 'No puedes cambiar tu propio rol.',
  role: {
    free: 'Gratis',
    premium: 'Premium',
    vip: 'VIP',
    supporter: 'Patrocinador',
    moderator: 'Moderador',
    tester: 'Tester',
    developer: 'Desarrollador',
    admin: 'Admin',
  },
  status: {
    active: 'Activo',
    blocked: 'Bloqueado',
    deleted: 'Eliminado',
  },
  actions: {
    block: 'Bloquear',
    unblock: 'Desbloquear',
    remove: 'Eliminar',
    restore: 'Restaurar',
  },
  errors: {
    SELF_ROLE_CHANGE_FORBIDDEN: 'No puedes cambiar tu propio rol.',
    LAST_ADMIN_PROTECTED: 'No se puede degradar al último administrador.',
    USER_NOT_FOUND: 'Usuario no encontrado.',
    INVALID_USER_ID: 'Identificador de usuario no válido.',
    CANNOT_BLOCK_SELF: 'No puedes bloquearte a ti mismo.',
    CANNOT_DELETE_SELF: 'No puedes eliminarte a ti mismo.',
    generic: 'Algo salió mal. Inténtalo de nuevo.',
  },
};

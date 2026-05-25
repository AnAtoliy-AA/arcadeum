import type { DeepPartial } from '../base-types';

export const en = {
  unknownGame: 'Unknown Game',
  loading: 'Loading history...',
  loginRequired: 'Login required to view history',
  list: {
    emptyNoEntries: 'No game history yet',
    emptySignedOut: 'Sign in to view your game history',
    noMoreEntries: 'No more entries to show',
  },
  search: {
    label: 'Search history',
    placeholder: 'Search by room name or participant...',
    noResults: 'No games match your search',
  },
  filter: {
    label: 'Filter by status',
    all: 'All Statuses',
    clear: 'Clear Filters',
  },
  filters: {
    title: 'Search & Filter',
    description: 'Find games by name, participant, or status',
  },
  pagination: {
    showing: 'Showing {{count}} of {{total}} games',
    loadMore: 'Load More',
    loading: 'Loading...',
  },
  status: {
    lobby: 'Lobby',
    in_progress: 'In Progress',
    completed: 'Completed',
    waiting: 'Waiting',
    active: 'Active',
  },
  actions: {
    viewDetails: 'View Details',
    refresh: 'Refresh',
    retry: 'Retry',
  },
  detail: {
    backToList: 'Back',
    loading: 'Loading details...',
    lastActivity: 'Last activity: {{timestamp}}',
    rematchTitle: 'Start a Rematch',
    rematchDescription: 'Select participants to invite to a new game.',
    rematchAction: 'Start Rematch',
    rematchCreating: 'Creating...',
    participantsTitle: 'Participants',
    hostLabel: 'Host',
    removeTitle: 'Remove from History',
    removeDescription:
      'This will remove this entry from your history. This action cannot be undone.',
    removeAction: 'Remove',
    removeConfirm: 'Remove',
    removeRemoving: 'Removing...',
    removeCancel: 'Cancel',
    logsTitle: 'Activity Log',
    noLogs: 'No activity logged.',
    scopePlayers: 'Players',
    scopeAll: 'All',
    sender: 'From {{name}}',
  },
  errors: {
    authRequired: 'Authentication required',
    detailRemoved: 'This game has been removed from history.',
    detailFailed: 'Failed to load details',
    rematchMinimum: 'Select at least one participant',
    removeFailed: 'Failed to remove from history',
  },
};

export const es = {
  unknownGame: 'Juego desconocido',
  loading: 'Cargando historial...',
  loginRequired: 'Se requiere iniciar sesión para ver el historial',
  list: {
    emptyNoEntries: 'Aún no hay historial de juegos',
    emptySignedOut: 'Inicia sesión para ver tu historial de juegos',
    noMoreEntries: 'No hay más entradas para mostrar',
  },
  search: {
    label: 'Buscar en el historial',
    placeholder: 'Buscar por sala o participante...',
    noResults: 'Ningún juego coincide con tu búsqueda',
  },
  filter: {
    label: 'Filtrar por estado',
    all: 'Todos los estados',
    clear: 'Limpiar filtros',
  },
  filters: {
    title: 'Buscar y filtrar',
    description: 'Encuentra juegos por nombre, participante o estado',
  },
  pagination: {
    showing: 'Mostrando {{count}} de {{total}} juegos',
    loadMore: 'Cargar más',
    loading: 'Cargando...',
  },
  status: {
    lobby: 'Sala de espera',
    in_progress: 'En progreso',
    completed: 'Completado',
    waiting: 'Esperando',
    active: 'Activo',
  },
  actions: {
    viewDetails: 'Ver detalles',
    refresh: 'Actualizar',
    retry: 'Reintentar',
  },
  detail: {
    backToList: 'Volver',
    loading: 'Cargando detalles...',
    lastActivity: 'Última actividad: {{timestamp}}',
    rematchTitle: 'Iniciar revancha',
    rematchDescription:
      'Selecciona a los participantes que quieras invitar a un nuevo juego.',
    rematchAction: 'Iniciar revancha',
    rematchCreating: 'Creando...',
    participantsTitle: 'Participantes',
    hostLabel: 'Anfitrión',
    removeTitle: 'Eliminar del historial',
    removeDescription:
      'Esto eliminará esta entrada de tu historial. Esta acción no se puede deshacer.',
    removeAction: 'Eliminar',
    removeConfirm: 'Eliminar',
    removeRemoving: 'Eliminando...',
    removeCancel: 'Cancelar',
    logsTitle: 'Registro de actividad',
    noLogs: 'Sin actividad registrada.',
    scopePlayers: 'Jugadores',
    scopeAll: 'Todo',
    sender: 'De {{name}}',
  },
  errors: {
    authRequired: 'Se requiere autenticación',
    detailRemoved: 'Este juego ha sido eliminado del historial.',
    detailFailed: 'No se pudieron cargar los detalles',
    rematchMinimum: 'Selecciona al menos un participante',
    removeFailed: 'No se pudo eliminar del historial',
  },
};

export const fr = {
  unknownGame: 'Jeu inconnu',
  loading: "Chargement de l'historique...",
  loginRequired: "Connexion requise pour voir l'historique",
  list: {
    emptyNoEntries: 'Aucun historique de jeu pour le moment',
    emptySignedOut: 'Connectez-vous pour voir votre historique de jeu',
    noMoreEntries: "Plus d'entrées à afficher",
  },
  search: {
    label: "Rechercher dans l'historique",
    placeholder: 'Rechercher par salon ou participant...',
    noResults: 'Aucun jeu ne correspond à votre recherche',
  },
  filter: {
    label: 'Filtrer par statut',
    all: 'Tous les statuts',
    clear: 'Effacer les filtres',
  },
  filters: {
    title: 'Rechercher et filtrer',
    description: 'Trouvez des jeux par nom, participant ou statut',
  },
  pagination: {
    showing: '{{count}} sur {{total}} parties affichées',
    loadMore: 'Charger plus',
    loading: 'Chargement...',
  },
  status: {
    lobby: "Salon d'attente",
    in_progress: 'En cours',
    completed: 'Terminé',
    waiting: 'En attente',
    active: 'Actif',
  },
  actions: {
    viewDetails: 'Voir les détails',
    refresh: 'Actualiser',
    retry: 'Réessayer',
  },
  detail: {
    backToList: 'Retour',
    loading: 'Chargement des détails...',
    lastActivity: 'Dernière activité : {{timestamp}}',
    rematchTitle: 'Lancer une revanche',
    rematchDescription:
      'Sélectionnez les participants à inviter à une nouvelle partie.',
    rematchAction: 'Lancer la revanche',
    rematchCreating: 'Création...',
    participantsTitle: 'Participants',
    hostLabel: 'Hôte',
    removeTitle: "Supprimer de l'historique",
    removeDescription:
      'Cette entrée sera retirée de votre historique. Cette action est irréversible.',
    removeAction: 'Supprimer',
    removeConfirm: 'Supprimer',
    removeRemoving: 'Suppression...',
    removeCancel: 'Annuler',
    logsTitle: "Journal d'activité",
    noLogs: 'Aucune activité enregistrée.',
    scopePlayers: 'Joueurs',
    scopeAll: 'Tout',
    sender: 'De {{name}}',
  },
  errors: {
    authRequired: 'Authentification requise',
    detailRemoved: "Cette partie a été retirée de l'historique.",
    detailFailed: 'Impossible de charger les détails',
    rematchMinimum: 'Sélectionnez au moins un participant',
    removeFailed: "Impossible de supprimer de l'historique",
  },
};

export const ru = {
  unknownGame: 'Неизвестная игра',
  loading: 'Загрузка истории...',
  loginRequired: 'Войдите, чтобы просмотреть историю игр',
  list: {
    emptyNoEntries: 'История игр пуста',
    emptySignedOut: 'Войдите, чтобы просмотреть свою историю игр',
    noMoreEntries: 'Больше записей нет',
  },
  search: {
    label: 'Поиск по истории',
    placeholder: 'Поиск по названию комнаты или участнику...',
    noResults: 'Игры не найдены',
  },
  filter: {
    label: 'Фильтр по статусу',
    all: 'Все статусы',
    clear: 'Очистить фильтры',
  },
  filters: {
    title: 'Поиск и фильтрация',
    description: 'Найдите игры по названию, участнику или статусу',
  },
  pagination: {
    showing: 'Показано {{count}} из {{total}} игр',
    loadMore: 'Загрузить еще',
    loading: 'Загрузка...',
  },
  status: {
    lobby: 'Лобби',
    in_progress: 'В процессе',
    completed: 'Завершено',
    waiting: 'Ожидание',
    active: 'Активно',
  },
  actions: {
    viewDetails: 'Подробнее',
    refresh: 'Обновить',
    retry: 'Повторить',
  },
  detail: {
    backToList: 'Назад',
    loading: 'Загрузка деталей...',
    lastActivity: 'Последняя активность: {{timestamp}}',
    rematchTitle: 'Начать реванш',
    rematchDescription: 'Выберите участников для приглашения в новую игру.',
    rematchAction: 'Начать реванш',
    rematchCreating: 'Создание...',
    participantsTitle: 'Участники',
    hostLabel: 'Организатор',
    removeTitle: 'Удалить из истории',
    removeDescription:
      'Это удалит запись из вашей истории. Это действие нельзя отменить.',
    removeAction: 'Удалить',
    removeConfirm: 'Удалить',
    removeRemoving: 'Удаление...',
    removeCancel: 'Отмена',
    logsTitle: 'Журнал активности',
    noLogs: 'Активность не записана.',
    scopePlayers: 'Игроки',
    scopeAll: 'Все',
    sender: 'От {{name}}',
  },
  errors: {
    authRequired: 'Требуется аутентификация',
    detailRemoved: 'Эта игра была удалена из истории.',
    detailFailed: 'Не удалось загрузить детали',
    rematchMinimum: 'Выберите хотя бы одного участника',
    removeFailed: 'Не удалось удалить из истории',
  },
};

export const by = {
  unknownGame: 'Невядомая гульня',
  loading: 'Загрузка гісторыі...',
  loginRequired: 'Увайдзіце, каб прагледзець гісторыю гульняў',
  list: {
    emptyNoEntries: 'Гісторыя гульняў пустая',
    emptySignedOut: 'Увайдзіце, каб праглядзець сваю гісторыю гульняў',
    noMoreEntries: 'Больш запісаў няма',
  },
  search: {
    label: 'Пошук па гісторыі',
    placeholder: 'Пошук па назве пакоя або ўдзельніку...',
    noResults: 'Гульні не знойдзены',
  },
  filter: {
    label: 'Фільтр па статусе',
    all: 'Усе статусы',
    clear: 'Ачысціць фільтры',
  },
  filters: {
    title: 'Пошук і фільтрацыя',
    description: 'Знайдзіце гульні па назве, удзельніку або статусе',
  },
  pagination: {
    showing: 'Паказана {{count}} з {{total}} гульняў',
    loadMore: 'Загрузіць яшчэ',
    loading: 'Загрузка...',
  },
  status: {
    lobby: 'Лобі',
    in_progress: 'У працэсе',
    completed: 'Завершана',
    waiting: 'Чаканне',
    active: 'Актыўна',
  },
  actions: {
    viewDetails: 'Падрабязней',
    refresh: 'Абнавіць',
    retry: 'Паўтарыць',
  },
  detail: {
    backToList: 'Назад',
    loading: 'Загрузка дэталяў...',
    lastActivity: 'Апошняя актыўнасць: {{timestamp}}',
    rematchTitle: 'Пачаць рэванш',
    rematchDescription: 'Выберыце ўдзельнікаў для запрашэння ў новую гульню.',
    rematchAction: 'Пачаць рэванш',
    rematchCreating: 'Стварэнне...',
    participantsTitle: 'Удзельнікі',
    hostLabel: 'Арганізатар',
    removeTitle: 'Выдаліць з гісторыі',
    removeDescription:
      'Гэта выдаліць запіс з вашай гісторыі. Гэта дзеянне нельга адмяніць.',
    removeAction: 'Выдаліць',
    removeConfirm: 'Выдаліць',
    removeRemoving: 'Выдаленне...',
    removeCancel: 'Адмена',
    logsTitle: 'Журнал актыўнасці',
    noLogs: 'Актыўнасць не запісана.',
    scopePlayers: 'Гульцы',
    scopeAll: 'Усе',
    sender: 'Ад {{name}}',
  },
  errors: {
    authRequired: 'Патрабуецца аўтэнтыфікацыя',
    detailRemoved: 'Гэта гульня была выдаленая з гісторыі.',
    detailFailed: 'Не ўдалося загрузіць дэталі',
    rematchMinimum: 'Выберыце хаця б аднаго ўдзельніка',
    removeFailed: 'Не ўдалося выдаліць з гісторыі',
  },
};

export const historyMessages = {
  en,
  es,
  fr,
  ru,
  by,
} as const;

/** Derived type with Partial wrapper for backward compatibility */
export type HistoryMessages = DeepPartial<typeof en>;

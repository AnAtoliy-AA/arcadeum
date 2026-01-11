import type { DeepPartial, Locale } from '../types';

const historyMessagesDefinition = {
  en: {
    unknownGame: 'Unknown Game',
    loading: 'Loading history...',
    list: {
      emptyNoEntries: 'No game history yet',
      emptySignedOut: 'Sign in to view your game history',
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
  },
  es: {
    list: {
      emptyNoEntries: 'Aún no hay historial de juegos',
      emptySignedOut: 'Inicia sesión para ver tu historial de juegos',
    },
    status: {
      lobby: 'Sala de espera',
      in_progress: 'En progreso',
      completed: 'Completado',
      waiting: 'Esperando',
      active: 'Activo',
    },
  },
  fr: {
    list: {
      emptyNoEntries: 'Aucun historique de jeu pour le moment',
      emptySignedOut: 'Connectez-vous pour voir votre historique de jeu',
    },
    status: {
      lobby: "Salon d'attente",
      in_progress: 'En cours',
      completed: 'Terminé',
      waiting: 'En attente',
      active: 'Actif',
    },
  },
} satisfies Record<Locale, Record<string, unknown>>;

export const historyMessages = historyMessagesDefinition;

/** Derived type with Partial wrapper for backward compatibility */
export type HistoryMessages = DeepPartial<
  (typeof historyMessagesDefinition)['en']
>;

/**
 * Centralized route definitions for the web application.
 * Use these constants for all navigation and redirects to maintain consistency.
 */

export const routes = {
  // Main pages
  home: '/',
  auth: '/auth',
  authCallback: '/auth/callback',

  // Games
  games: '/games',
  gameDetail: (id: string) => `/games/${id}`,
  gameCreate: '/games/create',
  gameRoom: (id: string) => `/games/rooms/${id}`,

  // Chat
  chats: '/chats',
  chat: (id: string) => `/chat/${id}`,

  // User
  settings: '/settings',
  history: '/history',
  stats: '/stats',

  // Support & Payments
  support: '/support',
  payment: '/payment',

  // Legal
  terms: '/terms',
  privacy: '/privacy',
  contact: '/contact',
} as const;

export type RoutePath = (typeof routes)[keyof typeof routes];

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
  chat: '/chat',
  chatDetail: (id: string) => `/chat/${id}`,

  // User
  settings: '/settings',
  history: '/history',
  stats: '/stats',
  referrals: '/referrals',

  // Admin (visible only to role==='admin')
  admin: '/admin',
  adminUsers: '/admin/users',

  // Support & Payments
  support: '/support',
  payment: '/payment',
  paymentSuccess: '/payment/success',
  paymentCancel: '/payment/cancel',
  notes: '/notes',

  // Legal
  terms: '/terms',
  privacy: '/privacy',
  contact: '/contact',
  cookies: '/cookies',
  help: '/help',

  // Community & Content
  blog: '/blog',
  community: '/community',
  rewards: '/rewards',
  tournaments: '/tournaments',
  wallet: '/wallet',
  shop: '/shop',
  leaderboards: '/leaderboards',
  developers: '/developers',

  // System
  offline: '/offline',
  testCrash: '/test-crash',
} as const;

export type RoutePath = (typeof routes)[keyof typeof routes];

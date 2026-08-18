import { helpFaq } from '../help-faq/en';

export const helpEn = {
  title: 'Arcadeum Help Center',
  subtitle: 'Guides, gameplay rules, account management, and troubleshooting',
  description:
    'Browse knowledge base articles, search frequently asked questions, or connect with our support team.',
  searchPlaceholder: 'Search help guides, topics, and FAQs…',
  noResults: 'No help articles found matching "{query}"',
  allFaqs: 'All Questions',
  status: {
    title: 'Platform Status',
    operational: 'All Systems Operational',
    gateway: 'WebSocket Match Gateway: 100% Online',
    cloud: 'Game Engine Cloud: Normal Latency',
  },
  categories: [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Create rooms, invite friends, and play without an account.',
      icon: '🚀',
    },
    {
      id: 'games-rules',
      title: 'Games & Rules',
      description: 'Official rules, variants, timers, and scoring mechanics.',
      icon: '♟️',
    },
    {
      id: 'account-security',
      title: 'Account & Security',
      description: 'Profile settings, password recovery, and privacy controls.',
      icon: '🔒',
    },
    {
      id: 'rewards-economy',
      title: 'Coins & Rewards',
      description: 'Daily login streaks, quest milestones, and shop unlocks.',
      icon: '💎',
    },
    {
      id: 'tournaments-ranking',
      title: 'Tournaments & Rankings',
      description: 'Bracket progression, Elo calculation, and seasonal ladder.',
      icon: '🏆',
    },
    {
      id: 'technical-support',
      title: 'Technical & Connectivity',
      description:
        'Troubleshoot disconnects, reconnect to games, and latency tips.',
      icon: '🛠️',
    },
  ],
  contactChannels: {
    title: 'Need Direct Assistance?',
    subtitle:
      'Our community moderators and engineering team are ready to help.',
    discord: 'Join Community Discord',
    tickets: 'Submit Support Ticket',
    email: 'support@arcadeum.net',
  },
  faq: helpFaq,
  comingSoon: 'More interactive guides coming soon.',
};

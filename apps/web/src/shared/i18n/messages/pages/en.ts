import { adminAnnouncementsEn } from './admin-announcements/en';
import { adminTournamentsEn } from './admin-tournaments/en';
import { walletEn } from './wallet/en';
import { adminWalletEn } from './admin-wallet/en';
import { gemsEn } from './gems/en';
import { adminGemPackagesEn } from './admin-gem-packages/en';

export const en = {
  admin: {
    title: 'Admin',
    welcome: 'Welcome to the admin area',
    welcomeBody:
      'Feature panels will appear here as they ship. Use the sidebar to navigate.',
    signedInAs: 'Signed in as {username}',
    nav: {
      dashboard: 'Dashboard',
      users: 'Users',
      payments: 'Payments',
      announcements: 'Announcements',
      tournaments: 'Tournaments',
      comingSoon: 'Coming soon',
    },
    error: {
      title: 'Something went wrong',
      body: 'An error occurred while loading this admin page.',
      retry: 'Try again',
    },
    users: {
      title: 'Users',
      search: { placeholder: 'Search by username, email, or display name' },
      filter: {
        role: { all: 'All roles', placeholder: 'Filter by role' },
      },
      table: {
        username: 'Username',
        email: 'Email',
        role: 'Role',
        createdAt: 'Created',
        actions: 'Actions',
      },
      empty: {
        noResults: 'No users match your filters.',
        noUsers: 'No users yet.',
      },
      pagination: {
        prev: 'Previous',
        next: 'Next',
        of: 'Page {current} of {total}',
      },
      totalLabel: '{total} users',
      selfTooltip: "You can't change your own role.",
      role: {
        free: 'Free',
        premium: 'Premium',
        vip: 'VIP',
        supporter: 'Supporter',
        moderator: 'Moderator',
        tester: 'Tester',
        developer: 'Developer',
        admin: 'Admin',
      },
      errors: {
        SELF_ROLE_CHANGE_FORBIDDEN: "You can't change your own role.",
        LAST_ADMIN_PROTECTED: "Can't demote the last admin.",
        USER_NOT_FOUND: 'User not found.',
        INVALID_USER_ID: 'Invalid user id.',
        generic: 'Something went wrong. Please try again.',
      },
    },
    payments: {
      title: 'Payments',
      search: { placeholder: 'Search by note, name, or transaction id' },
      filter: {
        visibility: {
          label: 'Visibility',
          all: 'All',
          public: 'Public only',
          private: 'Private only',
        },
      },
      table: {
        user: 'User',
        amount: 'Amount',
        note: 'Note',
        visibility: 'Visibility',
        createdAt: 'Created',
        transactionId: 'Transaction',
      },
      chip: {
        public: 'Public',
        private: 'Private',
        anonymous: 'Anonymous',
      },
      empty: {
        noResults: 'No payment notes match your filters.',
        noNotes: 'No payment notes yet.',
      },
      pagination: {
        prev: 'Previous',
        next: 'Next',
        of: 'Page {current} of {total}',
      },
      totalLabel: '{total} notes',
    },
    announcements: adminAnnouncementsEn,
    tournaments: adminTournamentsEn,
    wallet: adminWalletEn,
  },
  tournaments: {
    title: 'Tournaments',
    subtitle: 'Compete against the best players worldwide',
    description:
      'Join exciting tournaments, climb the brackets, and compete for exclusive prizes and bragging rights. New tournaments are added regularly — find one that fits your schedule and skill level.',
    features: [
      {
        title: 'Dynamic Brackets',
        description:
          'Follow your progress through live, real-time updated tournament brackets.',
      },
      {
        title: 'Exclusive Rewards',
        description:
          'Win premium cosmetics, boosters, and seasonal rewards unique to each event.',
      },
      {
        title: 'Skill-Based Matchmaking',
        description:
          'Compete against players of similar skill levels for a fair and challenging experience.',
      },
    ],
    comingSoon: 'Tournament mode is coming soon. Stay tuned!',
    list: {
      loading: 'Loading tournaments…',
      empty: 'No tournaments yet. Check back soon!',
      card: {
        registered: '{count} / {max} registered',
        prize: 'Prize',
        entryFee: 'Entry fee',
        prizePool: 'Prize pool',
        registerCta: 'Register',
        unregisterCta: 'Unregister',
        signInToRegister: 'Sign in to register',
        full: 'Join waitlist',
        registrationClosed: 'Registration closed',
        confirmRegister: {
          title: 'Confirm entry',
          body: 'This tournament costs {fee} coins. Your balance: {balance} coins.',
          confirm: 'Pay & Register',
          cancel: 'Cancel',
        },
        confirmUnregister: {
          refund: "You'll be refunded {amount} coins.",
          title: 'Cancel registration',
          body: 'Are you sure?',
          confirm: 'Yes, cancel',
          cancelButton: 'No, keep me in',
        },
        errors: {
          insufficientFunds: 'Not enough coins to enter.',
        },
        effectiveStatus: {
          scheduled: 'Scheduled',
          registration_open: 'Registration open',
          registration_closed: 'Registration closed',
          live: 'Live',
          awaiting_results: 'Awaiting results',
          completed: 'Completed',
          cancelled: 'Cancelled',
        },
        gameType: {
          critical_v1: 'Critical',
          sea_battle_v1: 'Sea Battle',
        },
      },
    },
  },
  blog: {
    title: 'Gaming Blog',
    subtitle: 'News, tips, and stories from the community',
    description:
      'Stay updated with the latest game guides, platform announcements, strategy tips, and stories from players around the world.',
    features: [
      {
        title: 'Latest News',
        description:
          'Get the first look at new games, features, and platform updates.',
      },
      {
        title: 'Pro Tips',
        description:
          'Learn advanced strategies and tips from the top-ranked players in the community.',
      },
      {
        title: 'Community Stories',
        description:
          'Read about the experiences and achievements of our most dedicated gamers.',
      },
    ],
    comingSoon: 'Articles are coming soon. Check back later!',
  },
  community: {
    title: 'Join the Community',
    subtitle: 'Connect with fellow gamers worldwide',
    description:
      'Share strategies, discuss your favorite games, participate in community events, and make friends who love board games as much as you do.',
    sections: {
      discord: {
        title: 'Discord',
        description:
          'Join our active community on Discord to discuss games, report bugs, and meet other players.',
      },
      twitter: {
        title: 'Twitter / X',
        description:
          'Follow us for the latest news, updates, and announcements.',
      },
      github: {
        title: 'Github',
        description:
          'Arcadeum is open-source. Contribute to the project on Github.',
      },
    },
    comingSoon: 'Community hub is coming soon. Stay tuned!',
  },
  cookies: {
    title: 'Cookie Policy',
    lastUpdated: 'Last updated: March 25, 2026',
    sections: {
      whatAreCookies: {
        title: 'What Are Cookies?',
        content:
          'Cookies are small text files stored on your device when you visit our platform. They help us deliver a better experience by remembering your preferences and keeping you signed in.',
      },
      howWeUse: {
        title: 'How We Use Cookies',
        intro: 'We use cookies for the following purposes:',
        items: [
          'Essential cookies — required for the platform to function correctly (e.g., session management, authentication).',
          'Preference cookies — remember your language, theme, and layout settings.',
          'Analytics cookies — help us understand how players use the platform so we can improve it.',
        ],
      },
      thirdParty: {
        title: 'Third-Party Cookies',
        content:
          'We do not use cookies for tracking across third-party sites. Any analytics tools we use are configured to respect your privacy.',
      },
      managing: {
        title: 'Managing Cookies',
        content:
          'You can disable or delete cookies through your browser settings at any time. Please note that disabling essential cookies may affect the functionality of the platform.',
      },
      contact: {
        title: 'Questions?',
        content:
          'If you have any questions about our use of cookies, please reach out through our support page.',
      },
    },
  },
  developers: {
    title: 'Developers',
    subtitle: 'Build on top of the Arcadeum platform',
    description:
      'Explore our APIs, webhooks, and developer tools to integrate Arcadeum into your own projects. Full documentation and sandbox access available.',
    features: [
      {
        title: 'RESTful APIs',
        description:
          'Access player data, game history, and leaderboards through our secure REST APIs.',
      },
      {
        title: 'WebSocket Events',
        description:
          'Integrate real-time game updates and notifications into your own applications.',
      },
      {
        title: 'Sandboxed Environment',
        description:
          'Test your integrations in a risk-free environment before going live.',
      },
    ],
    comingSoon: 'Developer portal is coming soon. Join the waitlist!',
  },
  help: {
    title: 'Help Center',
    subtitle: 'Find answers to common questions',
    description:
      "Browse articles about gameplay, account management, billing, and more. If you can't find what you're looking for, our support team is ready to help.",
    features: [
      {
        title: 'Searchable FAQ',
        description:
          'Quickly find answers to your questions through our extensive knowledge base.',
      },
      {
        title: 'Direct Support',
        description:
          'Open a support ticket and get personalized help from our dedicated team.',
      },
      {
        title: 'Community Help',
        description:
          'Connect with other players to share troubleshooting tips and gameplay advice.',
      },
    ],
    comingSoon: 'Help center is coming soon.',
  },
  leaderboards: {
    title: 'Leaderboards',
    subtitle: 'See where you rank among top players',
    description:
      'Track your position across all games, compare stats with friends, and follow the top players in each category. Rankings update in real time after every match.',
    live: 'Live',
    capturedAt: 'Captured {time}',
    hero: {
      eyebrow: 'Live · Season 4',
      title: 'Race the leaderboard.',
      tagline:
        'Updated every 30 seconds. Top 100 players gear up for the Champions Cup.',
    },
    ticker: { live: 'Live' },
    modes: {
      all: { name: 'All games', subtitle: 'Combined ladder', icon: '◎' },
      critical: { name: 'Critical', subtitle: 'High-stakes cards', icon: '♠' },
      sea_battle: {
        name: 'Sea Battle',
        subtitle: 'Naval strategy',
        icon: '⚓',
      },
    },
    cup: {
      eyebrow: 'Tournament',
      title: 'Autumn Cup',
      endsIn: 'Ends in',
      prizePool: 'Prize pool',
      participants: 'Participants',
      qualifiedLabel: 'Qualified',
      comingSoon: 'Coming soon',
      comingSoonBody: 'Live tournaments and prize pools are coming soon.',
    },
    mythic: {
      label: 'Mythic',
      streak: '{count}-game streak',
      leadOver: '+{delta} over #2',
      recentLabel: 'Last 12 matches',
      challenge: '⚔ Challenge',
      watch: '▶ Watch replay',
      follow: 'Follow',
      runnerUp: 'Runner · Up',
      thirdPlace: '3rd · Place',
    },
    controls: {
      global: 'Global',
      perGame: 'Per-game',
      tournaments: 'Tournaments',
      friends: 'Friends',
      regional: 'Regional',
      searchPlaceholder: 'Find player…',
      jumpToMe: '↓ Jump to me',
      ranges: {
        today: 'Today',
        week: 'Week',
        month: 'Month',
        season: 'Season',
      },
    },
    table: {
      rank: '#',
      player: 'Player',
      region: 'Region',
      rating: 'Rating',
      record: 'W–L–D',
      winrate: 'Winrate',
      form: 'Form',
      trend: 'Trend',
    },
    trend: {
      up: 'Up {n}',
      down: 'Down {n}',
      same: 'No change',
    },
    climbers: { title: 'Top climbers' },
    fallers: { title: 'Biggest drops' },
    squads: { title: 'Top squads', members: '{count} members' },
    regions: {
      title: 'By region',
      na: 'North America',
      eu: 'Europe',
      sa: 'South America',
      asia: 'Asia',
      oceania: 'Oceania',
      africa: 'Africa',
      me: 'Middle East',
    },
    rewards: {
      title: 'Reward ladder',
      mythic: 'Mythic crown + 12k gold',
      diamond: 'Diamond shard + 6k gold',
      platinum: 'Platinum trophy + 3k gold',
      gold: '1k gold + cosmetic',
    },
    self: {
      pinned: 'Your rank',
      unranked: 'Unranked — play 5 ranked games to appear',
      share: 'Share',
    },
    loadMore: 'Load more',
    freshness: {
      updatedAt: 'Updated {ago}',
      justNow: 'just now',
      secondsAgo: '{n}s ago',
      minutesAgo: '{n}m ago',
      hoursAgo: '{n}h ago',
    },
    profile: {
      eyebrow: 'Player',
      placeholder:
        'Full profile with rating history, recent matches, and squad info is coming soon.',
      back: 'Back to leaderboard',
    },
    empty: {
      title: 'No rankings yet',
      body: 'Be the first to climb the ladder.',
    },
    errorState: {
      title: "Couldn't load leaderboard",
      retry: 'Retry',
    },
    features: [
      {
        title: 'Friends Leaderboard',
        description:
          'See how you stack up against your friends and challenge them for the top spot.',
      },
      {
        title: 'Global Rankings',
        description: 'Compete for the #1 spot globally across all our games.',
      },
      {
        title: 'Season History',
        description:
          "Review your past performance and see how you've improved over time.",
      },
    ],
    comingSoon: 'Global leaderboards are coming soon!',
  },
  rewards: {
    title: 'Rewards',
    subtitle: 'Earn exclusive bonuses as you play',
    description:
      'Our rewards program is designed to thank our most active players. Earn points for every match, unlock seasonal badges, and trade your hard-earned bonuses for premium in-game items.',
    features: [
      {
        title: 'Daily Bonuses',
        description:
          'Sign in every day to claim your daily reward and maintain your streak.',
      },
      {
        title: 'Seasonal Passes',
        description:
          'Unlock a dedicated track of rewards by participating in seasonal events.',
      },
      {
        title: 'Referral Program',
        description:
          'Invite your friends to Arcadeum and earn bonuses for every new player who joins.',
      },
    ],
    comingSoon: 'Rewards shop is coming soon. Start earning points today!',
  },
  wallet: walletEn,
  gems: gemsEn,
  adminGemPackages: adminGemPackagesEn,
};

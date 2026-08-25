import { helpEn } from './help/en';
import { adminAnnouncementsEn } from './admin-announcements/en';
import { adminTournamentsEn } from './admin-tournaments/en';
import { walletEn } from './wallet/en';
import { adminWalletEn } from './admin-wallet/en';
import { gemsEn } from './gems/en';
import { adminGemPackagesEn } from './admin-gem-packages/en';
import { adminEconomyEn } from './admin-economy/en';
import { adminStatisticsEn } from './admin-statistics/en';
import { dailyRewardsEn } from './daily-rewards/en';
import { dailyChallengesEn } from './daily-challenges/en';
import { achievementsEn } from './achievements/en';
import { shopEn } from './shop/en';
import { adminShopEn } from './admin-shop/en';
import { adminGamesEn } from './admin-games/en';
import { adminBlockedIpsEn } from './admin-blocked-ips/en';
import { adminUsersEn } from './admin-users/en';
import { adminBulkRewardsEn } from './admin-bulk-rewards/en';
import { friendsEn } from './friends/en';
import { clansEn } from './clans/en';
import { eventsEn } from './events/en';
import { seasonsEn } from './seasons/en';
import { communityEn } from './community/en';
import { rewardsEn } from './rewards/en';
import { developersEn } from './developers/en';
import { blogEn } from './blog/en';
import { changelogEn } from './changelog/en';
import { roadmapEn } from './roadmap/en';

export const en = {
  admin: {
    title: 'Admin',
    welcome: 'Welcome to the admin area',
    welcomeBody:
      'Feature panels will appear here as they ship. Use the sidebar to navigate.',
    signedInAs: 'Signed in as {username}',
    nav: {
      dashboard: 'Dashboard',
      statistics: 'Statistics',
      users: 'Users',
      payments: 'Payments',
      announcements: 'Announcements',
      tournaments: 'Tournaments',
      economy: 'Economy',
      shop: 'Shop',
      gemPackages: 'Gem Packages',
      games: 'Games',
      gameRules: 'Game Rules',
      bulkRewards: 'Bulk Rewards',
      blockedIps: 'Blocked IPs',
      geoBlock: 'Geo-Blocking',
      comingSoon: 'Coming soon',
    },
    statistics: adminStatisticsEn,
    dashboard: {
      title: 'Command Center',
      subtitle:
        'System health, key metrics, and administrative modules overview',
      systemHealth: 'System Health',
      statusOnline: 'Operational',
      statusDegraded: 'Degraded',
      database: 'Database',
      collections: 'Collections',
      totalDocuments: 'Total Documents',
      dataSize: 'Data Size (MB)',
      storageSize: 'Storage Size (MB)',
      indexSize: 'Index Size (MB)',
      activeModules: 'Active Modules',
      modulesTitle: 'Administrative Modules',
      modulesSubtitle:
        'Direct access to manage games, players, transactions, and security',
      modules: {
        statistics: {
          title: 'Platform Analytics',
          description:
            'Inspect MAU, DAU, engagement retention, playtime, and revenue telemetry',
        },
        users: {
          title: 'User Management',
          description: 'Manage player accounts, roles, statuses, and bans',
        },
        payments: {
          title: 'Payments & Notes',
          description:
            'Audit payment records, transactions, and internal notes',
        },
        tournaments: {
          title: 'Tournaments',
          description:
            'Schedule and manage competitive tournaments and prize pools',
        },
        gemPackages: {
          title: 'Gem Packages',
          description: 'Configure purchasable gem tiers, pricing, and bonuses',
        },
        shop: {
          title: 'Shop & Cosmetics',
          description:
            'Manage inventory items, cosmetic rarities, and item grants',
        },
        economy: {
          title: 'Economy & Treasury',
          description:
            'Monitor token circulation, faucet grants, and reward sinks',
        },
        bulkRewards: {
          title: 'Bulk Rewards',
          description:
            'Distribute mass currency rewards to selected player cohorts',
        },
        games: {
          title: 'Game Visibility',
          description:
            'Control multiplayer game mode availability and live status',
        },
        gameRules: {
          title: 'Game Rules',
          description:
            'Configure gameplay rule variants, turn timers, and mechanics',
        },
        announcements: {
          title: 'Announcements',
          description:
            'Broadcast global banners, updates, and maintenance alerts',
        },
        blockedIps: {
          title: 'Blocked IPs',
          description: 'Inspect, ban, and manage malicious IP address blocks',
        },
        geoBlock: {
          title: 'Geo-Blocking',
          description:
            'Configure jurisdictional access rules and territory blocks',
        },
      },
      openPanel: 'Open Panel',
      collectionsOverview: 'Database Collections Breakdown',
      collectionName: 'Collection',
      docsCount: 'Documents',
      sizeMb: 'Size (MB)',
      avgDocSize: 'Avg Obj Size',
      indexesCount: 'Indexes',
      liveStatus: 'Live Status',
      environment: 'Environment',
    },
    error: {
      title: 'Something went wrong',
      body: 'An error occurred while loading this admin page.',
      retry: 'Try again',
    },
    users: adminUsersEn,
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
    blockedIps: adminBlockedIpsEn,
    bulkRewards: adminBulkRewardsEn,
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
  blog: blogEn,
  community: communityEn,
  cookies: {
    title: 'Cookie Policy',
    lastUpdated: 'Last updated: August 16, 2026',
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
  developers: developersEn,
  help: helpEn,
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
      critical_v1: {
        name: 'Critical',
        subtitle: 'High-stakes cards',
        icon: '♠',
      },
      sea_battle_v1: {
        name: 'Sea Battle',
        subtitle: 'Naval strategy',
        icon: '⚓',
      },
      texas_holdem_v1: {
        name: "Texas Hold'em Poker",
        subtitle: 'Poker tables',
        icon: '♣',
      },
      glimworm_v1: {
        name: 'Glimworm',
        subtitle: 'Neon snake arena',
        icon: '🐍',
      },
      tic_tac_toe_v1: {
        name: 'Tic-Tac-Toe',
        subtitle: 'Classic 3-in-a-row',
        icon: '✕',
      },
      cascade_v1: {
        name: 'Cascade',
        subtitle: 'Card stacking',
        icon: '▥',
      },
      chess_v1: { name: 'Chess', subtitle: 'Classic strategy', icon: '♞' },
      checkers_v1: { name: 'Checkers', subtitle: 'Board classic', icon: '●' },
      cat_dash_v1: { name: 'Cat Dash', subtitle: 'Cat racing', icon: '🐱' },
      backgammon_v1: {
        name: 'Backgammon',
        subtitle: 'Board strategy',
        icon: '🎲',
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
  rewards: rewardsEn,
  wallet: walletEn,
  gems: gemsEn,
  adminGemPackages: adminGemPackagesEn,
  adminEconomy: adminEconomyEn,
  dailyRewards: dailyRewardsEn,
  dailyChallenges: dailyChallengesEn,
  achievements: achievementsEn,
  shop: shopEn,
  adminShop: adminShopEn,
  adminGames: adminGamesEn,
  friends: friendsEn,
  clans: clansEn,
  events: eventsEn,
  seasons: seasonsEn,
  changelog: changelogEn,
  roadmap: roadmapEn,
};

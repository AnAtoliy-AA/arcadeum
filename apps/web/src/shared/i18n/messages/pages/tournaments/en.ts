export const tournamentsEn = {
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
      viewBracket: 'View bracket',
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
  bracket: {
    title: 'Bracket',
    loading: 'Loading bracket…',
    empty: 'Bracket has not been generated yet.',
    tbd: 'TBD',
    winner: 'Winner',
    backToList: 'Back to tournaments',
    errors: {
      locked:
        'The bracket is locked because some results were already reported.',
      notEnoughPlayers: 'Not enough players to generate a bracket.',
    },
  },
};

export type TournamentsI18n = typeof tournamentsEn;

export const en = {
  bell: {
    aria: 'Notifications',
    empty: 'No notifications yet',
    title: 'Notifications',
    markAllRead: 'Mark all read',
  },
  settings: {
    title: 'Notifications',
    description:
      'Pick which notifications you want. Everything is off by default - turn on only what you want to be alerted about.',
    permission: {
      granted: 'Notifications are enabled in your browser.',
      denied:
        'Your browser has blocked notifications. Update site settings to enable.',
      enable: 'Enable browser notifications',
    },
    iosInstallHint:
      'On iOS you need to add Arcadeum to your home screen before notifications can work. Tap the Share button, then "Add to Home Screen".',
  },
  categories: {
    daily_reward_ready: {
      label: 'Daily reward ready',
      description: 'Tells you when your streak window opens.',
    },
    tournament_starting_soon: {
      label: 'Tournament starting soon',
      description:
        'Alerts you ~10 minutes before a tournament you’re registered for begins.',
    },
    tournament_registration_opened: {
      label: 'New tournament published',
      description: 'Lets you know when registration opens for a new event.',
    },
    announcement_new: {
      label: 'New announcement',
      description: 'New patch notes, drops, and other site-wide announcements.',
    },
    friend_request: {
      label: 'Friend requests',
      description: 'Notifies you when someone sends a friend request.',
    },
    friend_accepted: {
      label: 'Friend request accepted',
      description: 'Notifies you when someone accepts your friend request.',
    },
    game_invitation: {
      label: 'Game invitations',
      description: 'Notifies you when someone invites you to a game room.',
    },
    gift_received: {
      label: 'Gifts',
      description: 'Notifies you when someone sends you a gift.',
    },
  },
  daily_reward_ready: {
    title: 'Daily reward ready',
    body: 'Your streak is waiting - claim it now.',
  },
  tournament_starting_soon: {
    title: '{{name}} starts in {{minutes}} min',
    body: 'Get in before the bracket locks.',
  },
  tournament_registration_opened: {
    title: 'New tournament: {{name}}',
    body: 'Registration is open. Tap to view.',
  },
  announcement_new: {
    title: '{{title}}',
    body: '{{excerpt}}',
  },
  friend_request: {
    title: 'New friend request',
    body: '{{username}} wants to be your friend.',
  },
  friend_accepted: {
    title: 'Friend request accepted',
    body: '{{username}} accepted your friend request.',
  },
  game_invitation: {
    title: 'Game invitation',
    body: '{{hostName}} invited you to play {{gameId}}.',
  },
  rematch_accepted: {
    title: 'Rematch accepted',
    body: '{{opponentName}} accepted your rematch. Join game!',
  },
  rematch_declined: {
    title: 'Rematch declined',
    body: '{{opponentName}} declined the rematch.',
  },
  gift_received: {
    title: 'Gift from {{senderName}}',
    body: '{{itemName}}: {{message}}',
  },
};

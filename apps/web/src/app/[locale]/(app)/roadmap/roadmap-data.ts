export type Tier = {
  id: string;
  label: string;
  effort: string;
  color: string;
  gradient: string;
  icon: string;
  features: { title: string; desc: string; effort: string }[];
};

export const TIERS: Tier[] = [
  {
    id: 'tier1',
    label: 'Quick Wins',
    effort: '1–3 days each',
    color: '#22c55e',
    gradient:
      'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))',
    icon: '⚡',
    features: [
      {
        title: 'Account-less Stat Tracking',
        desc: 'Local browser-based win/loss records, streaks, and favorite game — no signup needed.',
        effort: '1–2 days',
      },
      {
        title: 'In-game Emotes',
        desc: 'Quick reactions (👍 😂 🤔 🎉 😤 💀) displayed as animated bubbles.',
        effort: '1–2 days',
      },
      {
        title: 'House Rules / Game Config',
        desc: 'Toggleable settings per game — grid size, ship count, special weapons, board variants.',
        effort: '2–3 days',
      },
      {
        title: 'Dark Mode',
        desc: "System-wide theme toggle using Tamagui's built-in theme system.",
        effort: '1 day',
      },
      {
        title: 'Undo / Take-Back',
        desc: 'Request an undo in casual games — opponent must approve.',
        effort: '1–2 days',
      },
      {
        title: 'Password-Protected Rooms',
        desc: 'Set a password on private rooms for invite-only play.',
        effort: '1 day',
      },
    ],
  },
  {
    id: 'tier2',
    label: 'Core Additions',
    effort: '2–7 days each',
    color: '#3b82f6',
    gradient:
      'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))',
    icon: '🎮',
    features: [
      {
        title: 'Chess',
        desc: 'Full rules including castling, en passant, promotion. Bot with minimax + alpha-beta pruning. Chess960 variant.',
        effort: '5–7 days',
      },
      {
        title: 'Checkers',
        desc: 'Standard 8x8 with forced captures, multi-jump, king promotion. International draughts variant.',
        effort: '4–5 days',
      },
      {
        title: 'AI Difficulty Tiers',
        desc: 'Easy / Medium / Hard / Expert for each bot. Random → heuristics → deep search.',
        effort: '2–3 days/game',
      },
      {
        title: 'Matchmaking Queue',
        desc: 'Real-time queue system — find opponents instantly or fall back to bots.',
        effort: '3–5 days',
      },
      {
        title: 'Ranked Play (ELO)',
        desc: 'Per-game skill ratings with tiers: Bronze → Grandmaster. Seasonal resets.',
        effort: '5–7 days',
      },
      {
        title: 'Achievements & Badges',
        desc: 'Collectible milestones — first win, streaks, difficulty clears. Displayed on profile.',
        effort: '3–4 days',
      },
      {
        title: 'Audio Cues',
        desc: 'Short sounds for emotes, turns, game events. Web Audio API with mute toggle.',
        effort: '1 day',
      },
    ],
  },
  {
    id: 'tier3',
    label: 'Card & Board Games',
    effort: '4–7 days each',
    color: '#a855f7',
    gradient:
      'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.05))',
    icon: '♠️',
    features: [
      {
        title: 'Hearts',
        desc: '4-player trick-taking — queen of spades, shooting the moon, passing phase.',
        effort: '5–7 days',
      },
      {
        title: 'Spades',
        desc: '4-player trick-taking with bidding, nil bid, partnerships.',
        effort: '5–7 days',
      },
      {
        title: 'Backgammon',
        desc: '24-point board, bearing off, doubling cube. Probability-based bot.',
        effort: '5–7 days',
      },
      {
        title: 'Pachisi',
        desc: 'Original Ludo — 4-player race game with dice and home stretch.',
        effort: '4–5 days',
      },
      {
        title: 'Post-Game Analysis',
        desc: 'Review where mistakes were made — position evaluation, turning points, material graphs.',
        effort: '3–5 days',
      },
      {
        title: 'Move Hints / Coach Mode',
        desc: 'Optional AI hints during gameplay — suggest the best move with brief explanation.',
        effort: '2–3 days',
      },
    ],
  },
  {
    id: 'tier4',
    label: 'Community & Social',
    effort: '3–10 days each',
    color: '#f59e0b',
    gradient:
      'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
    icon: '👥',
    features: [
      {
        title: 'Go (Baduk)',
        desc: '9×9 / 13×13 / 19×19. Liberty counting, capture, ko rule. MCTS bot.',
        effort: '10–14 days',
      },
      {
        title: 'Clans / Groups',
        desc: 'Persistent groups with chat, internal leaderboards, and group challenges.',
        effort: '5–7 days',
      },
      {
        title: 'Game Replays',
        desc: 'Record and share game replays with step-by-step playback and speed controls.',
        effort: '4–5 days',
      },
      {
        title: 'Spectator Mode',
        desc: 'Watch ongoing matches with live reactions. Spectator count displayed.',
        effort: '3–4 days',
      },
      {
        title: 'Community Game Nights',
        desc: 'Scheduled events — featured game, time window, live status, post-event stats.',
        effort: '3–4 days',
      },
    ],
  },
  {
    id: 'tier5',
    label: 'Platform Polish',
    effort: '1–10 days each',
    color: '#ec4899',
    gradient:
      'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(236,72,153,0.05))',
    icon: '✨',
    features: [
      {
        title: 'Chess Clock (Universal Timer)',
        desc: 'Configurable time controls for any turn-based game. Flag system.',
        effort: '3–4 days',
      },
      {
        title: 'Cross-Game Stats Dashboard',
        desc: 'Single view of all stats — total games, win rate, streaks, time played.',
        effort: '2–3 days',
      },
      {
        title: 'Interactive Tutorials',
        desc: 'Step-by-step guided walkthroughs for each game before first play.',
        effort: '3–5 days',
      },
      {
        title: 'Daily Challenges',
        desc: 'Rotating daily objectives with streak bonuses and cosmetic rewards.',
        effort: '2–3 days',
      },
      {
        title: 'Season System',
        desc: 'Quarterly seasons with soft resets, seasonal cosmetics, and leaderboards.',
        effort: '5–7 days',
      },
      {
        title: 'Colorblind Modes',
        desc: 'Deuteranopia / Protanopia / Tritanopia presets with pattern overlays.',
        effort: '1–2 days',
      },
      {
        title: 'Screen Reader & Keyboard Navigation',
        desc: 'Full ARIA labels, keyboard-only board control, focus indicators.',
        effort: '4–6 days',
      },
      {
        title: 'PWA Support',
        desc: 'Installable as an app — service worker, offline caching, manifest.',
        effort: '2–3 days',
      },
      {
        title: 'Offline Bot Mode',
        desc: 'Play vs AI without internet — cached engines, WASM bots, sync on reconnect.',
        effort: '3–5 days',
      },
      {
        title: 'Push Notifications',
        desc: '"It\'s your turn!" browser push notifications with deep links.',
        effort: '3–4 days',
      },
      {
        title: 'Web Share API',
        desc: 'One-tap sharing of game results to social media or clipboard.',
        effort: '1 day',
      },
      {
        title: 'Tournament System',
        desc: 'Single-elimination and round-robin brackets with timed rounds.',
        effort: '7–10 days',
      },
      {
        title: 'Leaderboards',
        desc: 'Global, per-game, and friends-only leaderboards with real-time updates.',
        effort: '3–4 days',
      },
    ],
  },
];

export const PHASES = [
  {
    phase: 1,
    features:
      'Stats + Emotes + House Rules + Dark Mode + Undo + Password Rooms',
    days: '8–12',
    color: '#22c55e',
  },
  {
    phase: 2,
    features: 'Chess + Checkers + AI Difficulty + Audio + Coach Mode',
    days: '14–20',
    color: '#3b82f6',
  },
  {
    phase: 3,
    features: 'Matchmaking Queue + Ranked/ELO + Achievements + Leaderboards',
    days: '15–20',
    color: '#6366f1',
  },
  {
    phase: 4,
    features: 'Hearts + Spades + Backgammon + Pachisi + Post-game Analysis',
    days: '22–28',
    color: '#a855f7',
  },
  {
    phase: 5,
    features: 'Go + Clans + Game Nights + Replays + Spectator Mode',
    days: '28–38',
    color: '#f59e0b',
  },
  {
    phase: 6,
    features: 'Tournaments + Seasons + Daily Challenges + Colorblind + A11y',
    days: '20–28',
    color: '#f97316',
  },
  {
    phase: 7,
    features: 'PWA + Offline + Push Notifications + Share + Timer System',
    days: '10–16',
    color: '#ec4899',
  },
  {
    phase: 8,
    features: 'Board Game Creator + Mobile Port + Monetization',
    days: '35–51',
    color: '#14b8a6',
  },
];

export const STATS = [
  { label: 'Features', value: '31', icon: '📋' },
  { label: 'Phases', value: '8', icon: '🗺️' },
  { label: 'Est. Days', value: '152–213', icon: '⏱️' },
  { label: 'New Games', value: '7', icon: '♟️' },
];

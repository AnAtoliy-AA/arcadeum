import type { Phase, StatItem } from './roadmap-types';

export const PHASES: Phase[] = [
  {
    phase: 1,
    title: 'Core UX',
    features:
      'Stats + Emotes + House Rules + Dark Mode + Undo + Password Rooms',
    days: '8–12',
    color: '#22c55e',
    status: '100% Completed',
  },
  {
    phase: 2,
    title: 'Growth & SEO',
    features: 'Chess + Checkers + AI Difficulty + Audio + Coach Mode',
    days: '14–20',
    color: '#3b82f6',
    status: '100% Completed',
  },
  {
    phase: 3,
    title: 'Classic Games',
    features: 'Matchmaking Queue + Ranked/ELO + Achievements + Leaderboards',
    days: '15–20',
    color: '#6366f1',
    status: '100% Completed',
  },
  {
    phase: 4,
    title: 'Competitive',
    features: 'Hearts + Spades + Backgammon + Pachisi + Post-game Analysis',
    days: '22–28',
    color: '#a855f7',
    status: '100% Completed',
  },
  {
    phase: 5,
    title: 'Retention',
    features: 'Go + Clans + Game Nights + Replays + Spectator Mode',
    days: '28–38',
    color: '#f59e0b',
    status: '100% Completed',
  },
  {
    phase: 6,
    title: 'Card & Board',
    features: 'Tournaments + Seasons + Daily Challenges + Colorblind + A11y',
    days: '20–28',
    color: '#f97316',
    status: '100% Completed',
  },
  {
    phase: 7,
    title: 'Advanced Social',
    features: 'PWA + Offline + Push Notifications + Share + Timer System',
    days: '10–16',
    color: '#ec4899',
    status: '100% Completed',
  },
  {
    phase: 8,
    title: 'Platform Growth',
    features: 'Board Game Creator + Mobile Port + Monetization',
    days: '35–51',
    color: '#14b8a6',
    status: 'PWA & Offline Done',
  },
  {
    phase: 9,
    title: 'Creator Tools',
    features: 'Visual Board Game Creator (ARC-901)',
    days: '20',
    color: '#06b6d4',
    status: 'Deferred',
  },
  {
    phase: 10,
    title: 'Single-Player',
    features: 'Solitaire + Minesweeper + Sudoku + 2048 (ARC-924)',
    days: '12',
    color: '#8b5cf6',
    status: '100% Completed',
  },
  {
    phase: 11,
    title: 'Growth Acceleration',
    features: 'Funnel Tracking + Sea Battle Spearhead + Viral Challenge Flow',
    days: '30',
    color: '#0ea5e9',
    status: 'Code Complete',
  },
  {
    phase: 12,
    title: 'Player Retention Loops',
    features:
      'Daily Habit + Async Turn-Based + Quests & Battle Pass + Social Leagues (ARC-930–ARC-934)',
    days: '20',
    color: '#d946ef',
    status: 'In Progress',
  },
  {
    phase: 13,
    title: 'High-Performance Engine',
    features:
      'Web Worker AI + Instant Room Boot + WebSocket Delta Sync + Core Web Vitals (ARC-935–ARC-938)',
    days: '15',
    color: '#f43f5e',
    status: 'In Progress',
  },
];

export const STATS: StatItem[] = [
  { label: 'Features', value: '58', icon: '📋' },
  { label: 'Implemented', value: '42', icon: '✅' },
  { label: 'In Progress', value: '5', icon: '⏳' },
  { label: 'Planned', value: '11', icon: '🗺️' },
];

import { Types } from 'mongoose';
import { EventStatus } from './schemas/event.schema';

export interface DefaultSeedEvent {
  title: string;
  description: string;
  gameType: string;
  status: EventStatus;
  startTime: Date;
  endTime: Date;
  prizeBadge: string | null;
  participants: {
    userId: Types.ObjectId;
    displayName: string;
    avatarUrl: string | null;
    gamesPlayed: number;
    wins: number;
    points: number;
    registeredAt: Date;
  }[];
  activeGamesCount: number;
  mvpPoints: number;
  mvpDisplayName?: string;
}

export function buildDefaultSeedEvents(): DefaultSeedEvent[] {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const oneDay = 24 * oneHour;

  return [
    {
      title: 'Friday Night Blitz Chess',
      description:
        'Join the community blitz chess showdown. Fast 3-minute rounds with double points for winning streaks!',
      gameType: 'chess',
      status: 'active',
      startTime: new Date(now - 30 * 60 * 1000),
      endTime: new Date(now + 2 * oneHour),
      prizeBadge: 'champion_crown',
      participants: [
        {
          userId: new Types.ObjectId(),
          displayName: 'GrandmasterAlex',
          avatarUrl: null,
          gamesPlayed: 4,
          wins: 4,
          points: 12,
          registeredAt: new Date(now - 40 * 60 * 1000),
        },
        {
          userId: new Types.ObjectId(),
          displayName: 'KnightRider',
          avatarUrl: null,
          gamesPlayed: 3,
          wins: 2,
          points: 7,
          registeredAt: new Date(now - 35 * 60 * 1000),
        },
        {
          userId: new Types.ObjectId(),
          displayName: 'TacticianPro',
          avatarUrl: null,
          gamesPlayed: 2,
          wins: 1,
          points: 4,
          registeredAt: new Date(now - 20 * 60 * 1000),
        },
      ],
      activeGamesCount: 2,
      mvpPoints: 12,
      mvpDisplayName: 'GrandmasterAlex',
    },
    {
      title: 'Sea Battle Armada Clash',
      description:
        'Fleet commanders assemble! Compete in radar-enabled naval battles to secure the Admiral badge.',
      gameType: 'sea-battle',
      status: 'upcoming',
      startTime: new Date(now + 1 * oneDay),
      endTime: new Date(now + 1 * oneDay + 3 * oneHour),
      prizeBadge: 'admiral_ribbon',
      participants: [],
      activeGamesCount: 0,
      mvpPoints: 0,
    },
    {
      title: 'Sunday Backgammon Derby',
      description:
        'High stakes doubling cube action with the classic 24-point board masters.',
      gameType: 'backgammon',
      status: 'upcoming',
      startTime: new Date(now + 3 * oneDay),
      endTime: new Date(now + 3 * oneDay + 4 * oneHour),
      prizeBadge: 'golden_dice',
      participants: [],
      activeGamesCount: 0,
      mvpPoints: 0,
    },
    {
      title: 'Checkers King Invitational',
      description:
        'Crown your tactical prowess and jump your way to victory in the Checkers Championship.',
      gameType: 'checkers',
      status: 'upcoming',
      startTime: new Date(now + 4 * oneDay),
      endTime: new Date(now + 4 * oneDay + 3 * oneHour),
      prizeBadge: 'king_crest',
      participants: [],
      activeGamesCount: 0,
      mvpPoints: 0,
    },
    {
      title: 'Go Zenith Championship',
      description:
        'Master territory control and strategic stone encirclement in the Go Grand Tournament.',
      gameType: 'go',
      status: 'upcoming',
      startTime: new Date(now + 5 * oneDay),
      endTime: new Date(now + 5 * oneDay + 4 * oneHour),
      prizeBadge: 'zenith_stone',
      participants: [],
      activeGamesCount: 0,
      mvpPoints: 0,
    },
    {
      title: 'Spades Nil Mastery Cup',
      description:
        'Bid fearlessly and outplay partnerships in the premier Spades showdown.',
      gameType: 'spades',
      status: 'upcoming',
      startTime: new Date(now + 6 * oneDay),
      endTime: new Date(now + 6 * oneDay + 3 * oneHour),
      prizeBadge: 'spade_overlord',
      participants: [],
      activeGamesCount: 0,
      mvpPoints: 0,
    },
    {
      title: 'Hearts Queen Hunt',
      description:
        'Shoot the moon and dodge penalty points in the intense Hearts tournament.',
      gameType: 'hearts',
      status: 'upcoming',
      startTime: new Date(now + 7 * oneDay),
      endTime: new Date(now + 7 * oneDay + 3 * oneHour),
      prizeBadge: 'queen_slayer',
      participants: [],
      activeGamesCount: 0,
      mvpPoints: 0,
    },
    {
      title: 'Glimworm Arena Night',
      description:
        'Survive the glowing arena and grow your serpent to legendary proportions.',
      gameType: 'glimworm',
      status: 'upcoming',
      startTime: new Date(now + 8 * oneDay),
      endTime: new Date(now + 8 * oneDay + 3 * oneHour),
      prizeBadge: 'luminescent_fang',
      participants: [],
      activeGamesCount: 0,
      mvpPoints: 0,
    },
    {
      title: 'Cat Dash Turbo Prix',
      description:
        'Sprint, dodge traps, and set track records in the Cat Dash community derby.',
      gameType: 'cat-dash',
      status: 'upcoming',
      startTime: new Date(now + 9 * oneDay),
      endTime: new Date(now + 9 * oneDay + 3 * oneHour),
      prizeBadge: 'speed_whiskers',
      participants: [],
      activeGamesCount: 0,
      mvpPoints: 0,
    },
    {
      title: 'Cascade Prism League',
      description:
        'Trigger massive combo chains in the fast-paced Cascade block puzzle cup.',
      gameType: 'cascade',
      status: 'upcoming',
      startTime: new Date(now + 10 * oneDay),
      endTime: new Date(now + 10 * oneDay + 3 * oneHour),
      prizeBadge: 'cascade_gem',
      participants: [],
      activeGamesCount: 0,
      mvpPoints: 0,
    },
  ];
}

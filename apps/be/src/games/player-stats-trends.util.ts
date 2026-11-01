import { BadRequestException } from '@nestjs/common';
import type { Model } from 'mongoose';
import type { PlayerStatRecord } from './schemas/player-stat-record.schema';
import type { PlayerStats } from './schemas/player-stats.schema';

export async function executePlayerStats(
  statsModel: Model<PlayerStats>,
  recordModel: Model<PlayerStatRecord>,
  userId: string,
): Promise<{
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  byGameType: Array<{
    gameId: string;
    totalGames: number;
    wins: number;
    winRate: number;
  }>;
  currentStreak: number;
  currentStreakType: 'won' | 'lost' | null;
  bestWinStreak: number;
  favoriteGame: string | null;
}> {
  if (userId.startsWith('anon_')) {
    return {
      totalGames: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      byGameType: [],
      currentStreak: 0,
      currentStreakType: null,
      bestWinStreak: 0,
      favoriteGame: null,
    };
  }

  const docs = await statsModel
    .find({ userId: { $eq: userId } })
    .lean<
      {
        gameId: string;
        totalGames: number;
        wins: number;
        losses: number;
        elo?: number;
      }[]
    >()
    .exec();

  const byGameType = docs.map((d) => ({
    gameId: d.gameId,
    totalGames: d.totalGames,
    wins: d.wins,
    elo: d.elo ?? 1200,
    winRate:
      d.totalGames > 0 ? Math.round((d.wins / d.totalGames) * 10000) / 100 : 0,
  }));

  const totalGames = docs.reduce((s, d) => s + d.totalGames, 0);
  const totalWins = docs.reduce((s, d) => s + d.wins, 0);

  const records = await recordModel
    .find({ userId: { $eq: userId } })
    .sort({ timestamp: -1 })
    .limit(200)
    .lean<{ result: string; gameId: string }[]>()
    .exec();

  let currentStreak = 0;
  let currentStreakType: 'won' | 'lost' | null = null;
  let bestWinStreak = 0;
  let tempWinStreak = 0;
  const gameCounts = new Map<string, number>();

  for (const record of records) {
    const r = record.result as 'won' | 'lost' | 'draw';
    gameCounts.set(record.gameId, (gameCounts.get(record.gameId) ?? 0) + 1);

    if (r === 'won') {
      tempWinStreak++;
      if (tempWinStreak > bestWinStreak) {
        bestWinStreak = tempWinStreak;
      }
    } else {
      tempWinStreak = 0;
    }

    if (currentStreakType === null && r !== 'draw') {
      currentStreakType = r;
      currentStreak = 1;
    } else if (currentStreakType === r) {
      currentStreak++;
    } else if (currentStreakType !== null) {
      break;
    }
  }

  let favoriteGame: string | null = null;
  let maxCount = 0;
  for (const [gameId, count] of gameCounts) {
    if (count > maxCount) {
      maxCount = count;
      favoriteGame = gameId;
    }
  }

  return {
    totalGames,
    wins: totalWins,
    losses: totalGames - totalWins,
    winRate: totalGames > 0 ? (totalWins / totalGames) * 100 : 0,
    byGameType,
    currentStreak,
    currentStreakType,
    bestWinStreak,
    favoriteGame,
  };
}

export async function executeHeadToHead(
  recordModel: Model<PlayerStatRecord>,
  userId1: string,
  userId2: string,
  gameIdFilter?: Record<string, unknown>,
): Promise<{
  player1: { wins: number; losses: number; draws: number };
  player2: { wins: number; losses: number; draws: number };
  totalGames: number;
}> {
  if (typeof userId2 !== 'string' || !userId2) {
    throw new BadRequestException('userId2 is required');
  }
  const match: Record<string, unknown> = {
    userId: { $in: [userId1, userId2] },
  };
  if (gameIdFilter) match.gameId = gameIdFilter;

  const buckets = await recordModel
    .aggregate<{ _id: { userId: string; result: string }; count: number }>([
      { $match: match },
      {
        $group: {
          _id: { userId: '$userId', result: '$result' },
          count: { $sum: 1 },
        },
      },
    ])
    .exec();

  const player1 = { wins: 0, losses: 0, draws: 0 };
  const player2 = { wins: 0, losses: 0, draws: 0 };

  for (const bucket of buckets) {
    const r = bucket._id.result as 'won' | 'lost' | 'draw';
    const target =
      bucket._id.userId === userId1
        ? player1
        : bucket._id.userId === userId2
          ? player2
          : null;
    if (!target) continue;
    if (r === 'won') target.wins += bucket.count;
    else if (r === 'lost') target.losses += bucket.count;
    else target.draws += bucket.count;
  }

  return {
    player1,
    player2,
    totalGames: Math.min(
      player1.wins + player1.losses + player1.draws,
      player2.wins + player2.losses + player2.draws,
    ),
  };
}

export async function executeTrends(
  recordModel: Model<PlayerStatRecord>,
  userId: string,
  gameIdFilter?: Record<string, unknown>,
  limit = 10,
): Promise<{
  records: Array<{
    result: 'won' | 'lost' | 'draw';
    timestamp: number;
    sessionId: string;
  }>;
  winRate: number;
  currentStreak: number;
  currentStreakType: 'won' | 'lost' | null;
}> {
  if (userId.startsWith('anon_')) {
    return {
      records: [],
      winRate: 0,
      currentStreak: 0,
      currentStreakType: null,
    };
  }

  const match: Record<string, unknown> = { userId: { $eq: userId } };
  if (gameIdFilter) match.gameId = gameIdFilter;

  const records = await recordModel
    .find(match)
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean<{ result: string; timestamp: number; sessionId: string }[]>()
    .exec();

  const mapped = records.map((r) => ({
    result: r.result as 'won' | 'lost' | 'draw',
    timestamp: r.timestamp,
    sessionId: r.sessionId,
  }));

  const wins = mapped.filter((r) => r.result === 'won').length;
  const winRate =
    mapped.length > 0 ? Math.round((wins / mapped.length) * 100) : 0;

  let currentStreak = 0;
  let currentStreakType: 'won' | 'lost' | null = null;
  for (const record of mapped) {
    if (record.result === 'draw') break;
    if (currentStreakType === null) {
      currentStreakType = record.result;
      currentStreak = 1;
    } else if (record.result === currentStreakType) {
      currentStreak++;
    } else {
      break;
    }
  }

  return { records: mapped, winRate, currentStreak, currentStreakType };
}

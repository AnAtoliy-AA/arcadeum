import type { Model } from 'mongoose';
import type { ChessPuzzleRushDocument } from './chess-puzzle-rush.schema';
import type { SubmitRushScoreDto } from './dto/submit-rush-score.dto';
import {
  BASELINE_RUSH_LEADERBOARD,
  type RushLeaderboardEntry,
  type SubmitRushRunResult,
} from './chess-puzzle-rush.types';

function sanitize(str: string): string {
  return str.replace(/[$.]/g, '_');
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export async function executeSubmitRushRun(
  puzzleRushModel: Model<ChessPuzzleRushDocument>,
  user: { id?: string; username?: string; avatar?: string } | undefined,
  dto: SubmitRushScoreDto,
): Promise<SubmitRushRunResult> {
  const rawUserId = user?.id ?? dto.userId ?? 'anonymous';
  const rawUsername = user?.username ?? dto.username ?? 'TacticalGuest';
  const rawAvatar = user?.avatar ?? dto.avatar ?? '';

  const safeUserId = sanitize(rawUserId);
  const safeUsername = sanitize(rawUsername).slice(0, 32);
  const safeAvatar = sanitize(rawAvatar);
  const safeMode = dto.mode === 'timed' ? 'timed' : 'survival';
  const safeScore = clamp(dto.score, 0, 1000);
  const safeStreak = clamp(dto.bestStreak, 0, 1000);
  const safeTime = clamp(dto.totalTimeSeconds, 0, 86400);
  const safeRating = clamp(dto.rating ?? 1200, 100, 4000);

  const prevBest = await puzzleRushModel
    .findOne({ userId: safeUserId, mode: safeMode })
    .sort({ score: -1 })
    .exec();

  const previousBestScore = prevBest ? prevBest.score : 0;
  const isNewBest = safeScore > previousBestScore;

  await puzzleRushModel.create({
    userId: safeUserId,
    username: safeUsername,
    avatar: safeAvatar,
    mode: safeMode,
    score: safeScore,
    bestStreak: safeStreak,
    totalTimeSeconds: safeTime,
    rating: safeRating,
    createdAt: new Date(),
  });

  const higherRuns = await puzzleRushModel.countDocuments({
    mode: safeMode,
    score: { $gt: safeScore },
  });
  const rank = higherRuns + 1;

  return {
    ok: true,
    rank,
    bestScore: Math.max(previousBestScore, safeScore),
    isNewBest,
  };
}

export async function executeGetRushLeaderboard(
  puzzleRushModel: Model<ChessPuzzleRushDocument>,
  mode: 'survival' | 'timed' = 'survival',
  limit = 20,
): Promise<RushLeaderboardEntry[]> {
  const safeMode = mode === 'timed' ? 'timed' : 'survival';
  const safeLimit = clamp(limit, 1, 50);

  const topRuns = await puzzleRushModel
    .find({ mode: safeMode })
    .sort({ score: -1, totalTimeSeconds: 1 })
    .limit(safeLimit)
    .exec();

  const realEntries: RushLeaderboardEntry[] = topRuns.map((r, idx) => ({
    rank: idx + 1,
    userId: r.userId,
    username: r.username,
    avatar: r.avatar,
    score: r.score,
    bestStreak: r.bestStreak,
    totalTimeSeconds: r.totalTimeSeconds,
    rating: r.rating,
    createdAt: r.createdAt.toISOString(),
  }));

  if (realEntries.length >= safeLimit) {
    return realEntries;
  }

  const seenUserIds = new Set(realEntries.map((e) => e.userId));
  const baselines = (BASELINE_RUSH_LEADERBOARD[safeMode] ?? []).filter(
    (b) => !seenUserIds.has(b.userId),
  );

  const combined = [...realEntries];
  for (const b of baselines) {
    if (combined.length >= safeLimit) break;
    combined.push({
      rank: combined.length + 1,
      ...b,
      createdAt: new Date().toISOString(),
    });
  }

  combined.sort(
    (a, b) => b.score - a.score || a.totalTimeSeconds - b.totalTimeSeconds,
  );
  return combined.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

import type { ActivityFeedService } from './activity-feed.service';

/** Extra context a live session hands to the post-match feed recorder. */
export interface MatchFeedContext {
  state?: Record<string, unknown> | null;
  replayId?: string | null;
}

interface DefinitionLike {
  achievementId: string;
  name: string;
}

/** Turn `checkAndUnlock` results into `achievement_unlocked` feed rows. */
export async function recordUnlockedAchievements(
  feed: ActivityFeedService,
  playerIds: string[],
  results: Array<PromiseSettledResult<string[]>>,
  definitions: DefinitionLike[],
): Promise<void> {
  const names = new Map(definitions.map((d) => [d.achievementId, d.name]));
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const userId = playerIds[i];
    if (r.status !== 'fulfilled' || !userId) continue;
    if (!Array.isArray(r.value) || r.value.length === 0) continue;
    await feed.recordAchievements(
      userId,
      r.value.map((id) => ({ id, name: names.get(id) ?? id })),
    );
  }
}

interface RecentFormsSource {
  getRecentForms(
    userIds: string[],
    gameId?: string,
  ): Promise<Map<string, { currentStreak: number }>>;
}

/** Record a `win_streak` row when a winner hits a streak milestone. */
export async function recordWinStreaks(
  feed: ActivityFeedService,
  stats: RecentFormsSource,
  humanWinners: string[],
  gameId: string,
): Promise<void> {
  if (humanWinners.length === 0) return;
  const forms = await stats.getRecentForms(humanWinners, gameId);
  for (const userId of humanWinners) {
    const streak = forms.get(userId)?.currentStreak ?? 0;
    await feed.recordWinStreak(userId, gameId, streak);
  }
}

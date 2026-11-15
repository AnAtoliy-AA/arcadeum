export interface RushLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  bestStreak: number;
  totalTimeSeconds: number;
  rating: number;
  createdAt: string;
}

export interface SubmitRushRunResult {
  ok: boolean;
  rank: number;
  bestScore: number;
  isNewBest: boolean;
}

export const BASELINE_RUSH_LEADERBOARD: Record<
  'survival' | 'timed',
  Array<Omit<RushLeaderboardEntry, 'rank' | 'createdAt'>>
> = {
  survival: [
    {
      userId: 'bot_magnus',
      username: 'MagnusVibe',
      score: 48,
      bestStreak: 48,
      totalTimeSeconds: 520,
      rating: 2650,
    },
    {
      userId: 'bot_anna',
      username: 'TacticalQueen',
      score: 41,
      bestStreak: 35,
      totalTimeSeconds: 460,
      rating: 2420,
    },
    {
      userId: 'bot_blitz',
      username: 'BlitzMaster99',
      score: 37,
      bestStreak: 28,
      totalTimeSeconds: 380,
      rating: 2350,
    },
    {
      userId: 'bot_checkmate',
      username: 'CheckmateArtist',
      score: 32,
      bestStreak: 24,
      totalTimeSeconds: 340,
      rating: 2180,
    },
    {
      userId: 'bot_tactics',
      username: 'TacticsBeast',
      score: 26,
      bestStreak: 19,
      totalTimeSeconds: 290,
      rating: 1950,
    },
  ],
  timed: [
    {
      userId: 'bot_blitz',
      username: 'BlitzMaster99',
      score: 39,
      bestStreak: 26,
      totalTimeSeconds: 180,
      rating: 2480,
    },
    {
      userId: 'bot_magnus',
      username: 'MagnusVibe',
      score: 35,
      bestStreak: 22,
      totalTimeSeconds: 180,
      rating: 2510,
    },
    {
      userId: 'bot_anna',
      username: 'TacticalQueen',
      score: 31,
      bestStreak: 18,
      totalTimeSeconds: 180,
      rating: 2320,
    },
    {
      userId: 'bot_tactics',
      username: 'TacticsBeast',
      score: 25,
      bestStreak: 15,
      totalTimeSeconds: 180,
      rating: 2010,
    },
    {
      userId: 'bot_rapid',
      username: 'RapidRook',
      score: 21,
      bestStreak: 12,
      totalTimeSeconds: 180,
      rating: 1860,
    },
  ],
};

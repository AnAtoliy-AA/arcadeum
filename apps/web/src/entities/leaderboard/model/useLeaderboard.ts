'use client';
import { useQuery } from '@/shared/hooks/useQuery';
import {
  getLeaderboard,
  type GetLeaderboardArgs,
} from '@/shared/api/leaderboard';

export function useLeaderboard(args: GetLeaderboardArgs = {}) {
  return useQuery({
    queryKey: [
      'leaderboard',
      args.mode ?? 'all',
      args.page ?? 1,
      args.selfId ?? null,
    ],
    queryFn: () => getLeaderboard(args),
  });
}

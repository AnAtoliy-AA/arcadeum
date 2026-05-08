'use client';
import { useQuery } from '@/shared/hooks/useQuery';
import {
  getLeaderboard,
  type GetLeaderboardArgs,
} from '@/shared/api/leaderboard';
import type { LeaderboardSnapshot } from '@/entities/leaderboard/model/types';

type UseLeaderboardArgs = GetLeaderboardArgs & {
  onSuccess?: (data: LeaderboardSnapshot) => void;
};

export function useLeaderboard({
  onSuccess,
  ...args
}: UseLeaderboardArgs = {}) {
  return useQuery({
    queryKey: [
      'leaderboard',
      args.mode ?? 'all',
      args.page ?? 1,
      args.selfId ?? null,
      args.accessToken ? 'authed' : 'anon',
      args.q?.trim() ?? '',
    ],
    queryFn: () => getLeaderboard(args),
    onSuccess,
  });
}

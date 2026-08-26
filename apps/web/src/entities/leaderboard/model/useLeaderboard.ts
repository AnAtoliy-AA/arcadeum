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
  mode,
  page,
  pageSize,
  selfId,
  accessToken,
  q,
  scope,
  range,
  onSuccess,
}: UseLeaderboardArgs = {}) {
  return useQuery({
    queryKey: [
      'leaderboard',
      mode ?? 'all',
      page ?? 1,
      selfId ?? null,
      accessToken ? 'authed' : 'anon',
      q?.trim() ?? '',
      scope ?? '',
      range ?? '',
    ],
    queryFn: () =>
      getLeaderboard({
        mode,
        page,
        pageSize,
        selfId,
        accessToken,
        q,
        scope,
        range,
      }),
    onSuccess,
  });
}

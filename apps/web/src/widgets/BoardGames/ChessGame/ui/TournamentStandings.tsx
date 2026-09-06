'use client';
import { useState, useEffect } from 'react';
import { GlassCard, Typography } from '@arcadeum/ui';
import { useLanguage } from '@/shared/i18n/context';

interface Standing {
  userId: string;
  displayName: string | null;
  points: number;
  streak: number;
  wins: number;
  draws: number;
  losses: number;
  rank?: number;
}

interface TournamentStandingsProps {
  tournamentId: string;
  format: 'arena' | 'swiss';
}

export function TournamentStandings({
  tournamentId,
  format,
}: TournamentStandingsProps) {
  const { messages } = useLanguage();
  const t = messages.games?.chess_v1?.tournament as
    | {
        standings?: {
          title?: string;
          rank?: string;
          player?: string;
          points?: string;
          streak?: string;
          wins?: string;
          draws?: string;
          losses?: string;
          score?: string;
        };
      }
    | undefined;

  const [standings, setStandings] = useState<Standing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchStandings = async () => {
      try {
        const endpoint =
          format === 'arena'
            ? `/api/chess/tournaments/${tournamentId}/arena-standings`
            : `/api/chess/tournaments/${tournamentId}/swiss-standings`;
        const res = await fetch(endpoint);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setStandings(data.standings ?? []);
        }
      } catch {
        // Silently fail — standings will be empty
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchStandings();
    const interval = setInterval(fetchStandings, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [tournamentId, format]);

  const sLabels = t?.standings;

  return (
    <GlassCard className="p-3">
      <Typography variant="caption" alpha="high" className="font-bold mb-2">
        {sLabels?.title ?? 'Standings'}
      </Typography>

      {isLoading && (
        <div className="flex justify-center p-2">
          <div className="animate-spin w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
        </div>
      )}

      {!isLoading && standings.length === 0 && (
        <Typography variant="body" alpha="medium" className="text-center p-2">
          No standings yet.
        </Typography>
      )}

      {!isLoading && standings.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[11px] font-bold opacity-50 px-2">
            <span className="w-6">#</span>
            <span className="flex-1">{sLabels?.player ?? 'Player'}</span>
            <span className="w-12 text-right">
              {format === 'arena'
                ? (sLabels?.points ?? 'Pts')
                : (sLabels?.score ?? 'Score')}
            </span>
            {format === 'arena' && (
              <span className="w-10 text-right">
                {sLabels?.streak ?? 'Str'}
              </span>
            )}
            <span className="w-8 text-right">{sLabels?.wins ?? 'W'}</span>
            <span className="w-8 text-right">{sLabels?.draws ?? 'D'}</span>
            <span className="w-8 text-right">{sLabels?.losses ?? 'L'}</span>
          </div>

          {standings.map((standing, index) => (
            <div
              key={standing.userId}
              className={`flex items-center gap-2 text-[13px] px-2 py-1 rounded ${
                index < 3 ? 'bg-[var(--glassBg)]' : ''
              }`}
            >
              <span className="w-6 font-bold">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
              </span>
              <span className="flex-1 truncate">
                {standing.displayName ?? `Player ${standing.userId.slice(0, 6)}`}
              </span>
              <span className="w-12 text-right font-bold">
                {standing.points}
              </span>
              {format === 'arena' && (
                <span className="w-10 text-right text-yellow-400">
                  {standing.streak > 0 ? `${standing.streak}🔥` : '-'}
                </span>
              )}
              <span className="w-8 text-right text-emerald-400">
                {standing.wins}
              </span>
              <span className="w-8 text-right text-gray-400">
                {standing.draws}
              </span>
              <span className="w-8 text-right text-red-400">
                {standing.losses}
              </span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

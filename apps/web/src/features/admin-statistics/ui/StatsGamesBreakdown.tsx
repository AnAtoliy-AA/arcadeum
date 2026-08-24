import type { ReactElement } from 'react';
import { GlassCard, Typography, Badge, SettingsIcon } from '@arcadeum/ui';
import type { AdminStatsGames } from '../types';

export interface StatsGamesBreakdownTranslations {
  title?: string;
  subtitle?: string;
  gameColumn?: string;
  totalMatchesColumn?: string;
  todayMatchesColumn?: string;
  playersColumn?: string;
  winRateColumn?: string;
  shareColumn?: string;
  liveMatches?: string;
  waitingRooms?: string;
  noGames?: string;
}

interface StatsGamesBreakdownProps {
  games?: AdminStatsGames;
  mode?: 'all' | 'registered' | 'anonymous';
  t?: StatsGamesBreakdownTranslations;
}

export function StatsGamesBreakdown({
  games,
  mode = 'all',
  t,
}: StatsGamesBreakdownProps): ReactElement {
  const byGame = games?.byGame ?? [];
  const activeRooms = games?.activeRooms ?? 0;
  const waitingRooms = games?.waitingRooms ?? 0;

  return (
    <GlassCard
      className="p-6 border border-[var(--borderColor)] flex flex-col gap-5 w-full"
      data-testid="stats-games-breakdown"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex flex-row items-center gap-2">
            <SettingsIcon size={18} />
            <Typography variant="subheading" uiSize="sm" weight="700">
              {t?.title ?? 'Per-Game Activity & Performance Breakdown'}
            </Typography>
          </div>
          <Typography variant="body" uiSize="xs" alpha="medium">
            {t?.subtitle ??
              'Match distribution, unique players, and game share (Registered vs Anonymous)'}
          </Typography>
        </div>

        <div className="flex flex-row items-center gap-3">
          <Badge variant="info" size="sm">
            {activeRooms} {t?.liveMatches ?? 'Live Matches'}
          </Badge>
          <Badge variant="neutral" size="sm">
            {waitingRooms} {t?.waitingRooms ?? 'Lobbies'}
          </Badge>
        </div>
      </div>

      {byGame.length === 0 ? (
        <div className="py-8 text-center text-sm text-[var(--colorTextSecondary,#a1a1aa)]">
          {t?.noGames ?? 'No game match data recorded yet'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--borderColor)] text-[var(--colorTextSecondary,#a1a1aa)] text-xs uppercase tracking-wider">
                <th className="py-2.5 px-3">{t?.gameColumn ?? 'Game'}</th>
                <th className="py-2.5 px-3 text-right">
                  {t?.totalMatchesColumn ?? 'Total Matches'}
                </th>
                <th className="py-2.5 px-3 text-right">
                  {t?.todayMatchesColumn ?? 'Today'}
                </th>
                <th className="py-2.5 px-3 text-right">
                  {t?.playersColumn ?? 'Players'}
                </th>
                <th className="py-2.5 px-3 text-right">
                  {t?.winRateColumn ?? 'W / L / D'}
                </th>
                <th className="py-2.5 px-3 text-right min-w-[120px]">
                  {t?.shareColumn ?? 'Share'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--borderColor)]">
              {byGame.map((game) => {
                const totalMatches = game.totalMatches ?? 0;
                const regMatches = game.registeredMatches ?? 0;
                const anonMatches = game.anonymousMatches ?? 0;
                const uniquePlayers = game.uniquePlayers ?? 0;
                const regPlayers = game.registeredPlayers ?? 0;
                const anonPlayers = game.anonymousPlayers ?? 0;
                const matchesToday = game.matchesToday ?? 0;
                const wins = game.wins ?? 0;
                const losses = game.losses ?? 0;
                const draws = game.draws ?? 0;
                const sharePercentage = game.sharePercentage ?? 0;

                const displayMatches =
                  mode === 'registered'
                    ? regMatches
                    : mode === 'anonymous'
                    ? anonMatches
                    : totalMatches;

                const displayPlayers =
                  mode === 'registered'
                    ? regPlayers
                    : mode === 'anonymous'
                    ? anonPlayers
                    : uniquePlayers;

                const winRate =
                  totalMatches > 0
                    ? Math.round((wins / totalMatches) * 100)
                    : 0;

                return (
                  <tr
                    key={game.gameId}
                    className="hover:bg-[rgba(255,255,255,0.03)] transition-colors"
                  >
                    <td className="py-3 px-3 font-semibold text-[var(--colorText)]">
                      <div className="flex flex-col">
                        <span className="capitalize">
                          {game.gameId?.replace('_v1', '').replace('_', ' ') ?? 'Unknown'}
                        </span>
                        <span className="text-[10px] text-[var(--colorTextSecondary,#a1a1aa)] font-mono">
                          {game.gameId}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right text-[var(--colorText)] font-medium">
                      <div className="flex flex-col items-end">
                        <span>{displayMatches.toLocaleString()}</span>
                        {mode === 'all' && (
                          <span className="text-[10px] text-[var(--colorTextSecondary,#a1a1aa)]">
                            Reg: {regMatches.toLocaleString()} | Anon:{' '}
                            {anonMatches.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right text-[var(--colorTextSecondary,#d4d4d8)]">
                      {matchesToday > 0 ? (
                        <span className="text-emerald-400 font-semibold">
                          +{matchesToday}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-[var(--colorTextSecondary,#d4d4d8)]">
                      <div className="flex flex-col items-end">
                        <span>{displayPlayers.toLocaleString()}</span>
                        {mode === 'all' && (
                          <span className="text-[10px] text-[var(--colorTextSecondary,#a1a1aa)]">
                            Reg: {regPlayers.toLocaleString()} | Anon:{' '}
                            {anonPlayers.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right text-xs">
                      <span className="text-emerald-400 font-medium">
                        {wins}
                      </span>{' '}
                      /{' '}
                      <span className="text-rose-400 font-medium">
                        {losses}
                      </span>{' '}
                      /{' '}
                      <span className="text-[var(--colorTextSecondary,#a1a1aa)]">
                        {draws}
                      </span>{' '}
                      <span className="text-[10px] text-[var(--colorTextSecondary,#a1a1aa)]">
                        ({winRate}%)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex flex-row items-center justify-end gap-2">
                        <div className="w-16 h-2 rounded-full bg-white/10 overflow-hidden">
                          <svg
                            viewBox="0 0 100 8"
                            className="w-full h-full block"
                          >
                            <rect
                              x={0}
                              y={0}
                              width={sharePercentage}
                              height={8}
                              rx={4}
                              className="fill-[var(--primary)]"
                            />
                          </svg>
                        </div>
                        <span className="text-xs font-mono text-[var(--colorTextSecondary,#d4d4d8)] w-10 text-right">
                          {sharePercentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}

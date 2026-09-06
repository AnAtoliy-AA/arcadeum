'use client';
import { useState, useEffect } from 'react';
import { GlassCard, Button, Typography } from '@arcadeum/ui';
import { useLanguage } from '@/shared/i18n/context';
import { useSessionStore } from '@/entities/session/store/sessionStore';
import { TournamentStandings } from './TournamentStandings';
import { TournamentTimer } from './TournamentTimer';

interface TournamentEntry {
  id: string;
  name: string;
  format: 'arena' | 'swiss';
  status: 'scheduled' | 'registration_open' | 'live' | 'completed';
  scheduledAt: string;
  registeredCount: number;
  maxPlayers: number;
  isRegistered: boolean;
  timeControl?: string;
  durationMinutes?: number;
  roundCount?: number;
  prizeDescription?: string;
}

interface ChessTournamentLobbyProps {
  tournaments: TournamentEntry[];
  isLoading?: boolean;
  onJoin: (tournamentId: string) => void;
  onLeave: (tournamentId: string) => void;
}

export function ChessTournamentLobby({
  tournaments,
  isLoading,
  onJoin,
  onLeave,
}: ChessTournamentLobbyProps) {
  const { messages } = useLanguage();
  const t = messages.games?.chess_v1?.tournament as
    | {
        title?: string;
        join?: string;
        leave?: string;
        arena?: string;
        swiss?: string;
        live?: string;
        upcoming?: string;
        completed?: string;
        players?: string;
        timeControl?: string;
        duration?: string;
        rounds?: string;
        prize?: string;
        noTournaments?: string;
      }
    | undefined;

  const [selectedTournament, setSelectedTournament] = useState<string | null>(
    null,
  );

  const liveTournaments = tournaments.filter((t) => t.status === 'live');
  const upcomingTournaments = tournaments.filter(
    (t) => t.status === 'scheduled' || t.status === 'registration_open',
  );
  const completedTournaments = tournaments.filter(
    (t) => t.status === 'completed',
  );

  const selected = tournaments.find((t) => t.id === selectedTournament);

  return (
    <div className="flex flex-col gap-3">
      <Typography variant="heading" uiSize="lg">
        {t?.title ?? 'Chess Tournaments'}
      </Typography>

      {isLoading && (
        <div className="flex justify-center p-4">
          <div className="animate-spin w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
        </div>
      )}

      {!isLoading && tournaments.length === 0 && (
        <GlassCard className="p-4 text-center">
          <Typography variant="body" alpha="medium">
            {t?.noTournaments ?? 'No tournaments available yet.'}
          </Typography>
        </GlassCard>
      )}

      {liveTournaments.length > 0 && (
        <div className="flex flex-col gap-2">
          <Typography variant="caption" alpha="high" className="font-bold">
            {t?.live ?? 'LIVE NOW'}
          </Typography>
          {liveTournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              onJoin={onJoin}
              onLeave={onLeave}
              onSelect={setSelectedTournament}
              labels={t}
            />
          ))}
        </div>
      )}

      {upcomingTournaments.length > 0 && (
        <div className="flex flex-col gap-2">
          <Typography variant="caption" alpha="high" className="font-bold">
            {t?.upcoming ?? 'UPCOMING'}
          </Typography>
          {upcomingTournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              onJoin={onJoin}
              onLeave={onLeave}
              onSelect={setSelectedTournament}
              labels={t}
            />
          ))}
        </div>
      )}

      {completedTournaments.length > 0 && (
        <div className="flex flex-col gap-2">
          <Typography variant="caption" alpha="medium" className="font-bold">
            {t?.completed ?? 'COMPLETED'}
          </Typography>
          {completedTournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              onJoin={onJoin}
              onLeave={onLeave}
              onSelect={setSelectedTournament}
              labels={t}
            />
          ))}
        </div>
      )}

      {selected && selected.status === 'live' && (
        <div className="flex flex-col gap-3 mt-2">
          <TournamentTimer
            tournamentId={selected.id}
            status={selected.status}
            scheduledAt={selected.scheduledAt}
          />
          <TournamentStandings
            tournamentId={selected.id}
            format={selected.format}
          />
        </div>
      )}
    </div>
  );
}

function TournamentCard({
  tournament,
  onJoin,
  onLeave,
  onSelect,
  labels,
}: {
  tournament: TournamentEntry;
  onJoin: (id: string) => void;
  onLeave: (id: string) => void;
  onSelect: (id: string) => void;
  labels:
    | {
        join?: string;
        leave?: string;
        arena?: string;
        swiss?: string;
        players?: string;
        timeControl?: string;
        duration?: string;
        rounds?: string;
        prize?: string;
      }
    | undefined;
}) {
  const statusColor =
    tournament.status === 'live'
      ? 'text-emerald-400'
      : tournament.status === 'registration_open'
        ? 'text-blue-400'
        : tournament.status === 'completed'
          ? 'text-gray-500'
          : 'text-yellow-400';

  return (
    <GlassCard
      className="p-3 cursor-pointer hover:border-[var(--primary)] transition-colors"
    >
      <div className="flex items-center justify-between" onClick={() => onSelect(tournament.id)}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[15px]">{tournament.name}</span>
            <span
              className={`text-[11px] font-bold uppercase ${statusColor}`}
            >
              {tournament.status === 'live'
                ? 'LIVE'
                : tournament.status === 'registration_open'
                  ? 'OPEN'
                  : tournament.status}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[12px] opacity-70">
            <span>
              {tournament.format === 'arena'
                ? (labels?.arena ?? 'Arena')
                : (labels?.swiss ?? 'Swiss')}
            </span>
            {tournament.timeControl && (
              <span>
                {labels?.timeControl ?? 'Time'}: {tournament.timeControl}
              </span>
            )}
            <span>
              {labels?.players ?? 'Players'}: {tournament.registeredCount}/
              {tournament.maxPlayers}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {tournament.prizeDescription && (
            <span className="text-[12px] opacity-70">
              {labels?.prize ?? 'Prize'}: {tournament.prizeDescription}
            </span>
          )}
          {tournament.status !== 'completed' && (
            <Button
              size="sm"
              variant={tournament.isRegistered ? 'outline' : 'primary'}
              onClick={(e) => {
                e.stopPropagation();
                if (tournament.isRegistered) {
                  onLeave(tournament.id);
                } else {
                  onJoin(tournament.id);
                }
              }}
            >
              {tournament.isRegistered
                ? (labels?.leave ?? 'Leave')
                : (labels?.join ?? 'Join')}
            </Button>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

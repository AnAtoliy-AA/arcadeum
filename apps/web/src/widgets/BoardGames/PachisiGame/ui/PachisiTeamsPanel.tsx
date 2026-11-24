'use client';

import { useMemo } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import {
  LobbyChoice,
  LobbyOptionGroup,
} from '@/features/games/ui/LobbyOptionKit';
import { TEAM_ACCENTS, teamOfSeat, type TeamIndex } from '../lib/teams';

export const TEAMS_PLAYER_COUNT = 4;

export interface TeamSeatMember {
  id: string;
  displayName?: string | null;
}

interface PachisiTeamsPanelProps {
  enabled: boolean;
  isHost: boolean;
  /** Room members in join order; join order is seat order. */
  members: readonly TeamSeatMember[];
  /** Room seat cap; null/undefined means "auto" (up to 4). */
  maxPlayers?: number | null;
  onChange: (enabled: boolean) => void;
}

/** Seats of each team: opposite seats (1/3 and 2/4) are partners. */
export function teamSeats(team: TeamIndex): number[] {
  return [0, 1, 2, 3].filter((seat) => teamOfSeat(seat) === team);
}

export function PachisiTeamsPanel({
  enabled,
  isHost,
  members,
  maxPlayers,
  onChange,
}: PachisiTeamsPanelProps) {
  const { t } = useTranslation();
  const incompatible =
    typeof maxPlayers === 'number' && maxPlayers !== TEAMS_PLAYER_COUNT;
  const items = useMemo(
    () => [
      { id: 'off', label: t('games.pachisi_v1.lobby.teams.off'), emoji: '👤' },
      { id: 'on', label: t('games.pachisi_v1.lobby.teams.on'), emoji: '🤝' },
    ],
    [t],
  );

  return (
    <LobbyOptionGroup
      title={t('games.pachisi_v1.lobby.teams.title')}
      hint={
        incompatible
          ? t('games.pachisi_v1.lobby.teams.needsFour')
          : t('games.pachisi_v1.lobby.teams.hint')
      }
      data-testid="pachisi-teams-panel"
    >
      <LobbyChoice
        aria-label={t('games.pachisi_v1.lobby.teams.title')}
        items={items}
        value={enabled ? 'on' : 'off'}
        onChange={(v) => onChange(v === 'on')}
        disabled={!isHost || (incompatible && !enabled)}
        testIdPrefix="pachisi-teams"
      />
      {enabled && (
        <div
          className="grid grid-cols-1 gap-2 sm:grid-cols-2"
          data-testid="pachisi-team-preview"
        >
          {([0, 1] as const).map((team) => (
            <div
              key={team}
              className="flex flex-col gap-1.5 rounded-xl border p-2.5"
              style={{
                borderColor: TEAM_ACCENTS[team].solid,
                backgroundColor: TEAM_ACCENTS[team].soft,
              }}
              data-testid={`pachisi-team-${team}`}
            >
              <span
                className="text-xs font-black uppercase tracking-wide"
                style={{ color: TEAM_ACCENTS[team].solid }}
              >
                {t('games.pachisi_v1.lobby.teams.teamLabel', { n: team + 1 })}
              </span>
              {teamSeats(team).map((seat) => {
                const member = members[seat];
                return (
                  <div
                    key={seat}
                    className="flex items-center justify-between gap-2 text-sm text-[var(--textPrimary)]"
                    data-testid={`pachisi-team-seat-${seat}`}
                  >
                    <span className="text-xs text-[var(--textMuted)]">
                      {t('games.pachisi_v1.lobby.teams.seatLabel', {
                        n: seat + 1,
                      })}
                    </span>
                    <span className="truncate font-semibold">
                      {member
                        ? member.displayName || member.id
                        : t('games.pachisi_v1.lobby.teams.openSeat')}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
          <p className="text-xs text-[var(--textMuted)] sm:col-span-2">
            {t('games.pachisi_v1.lobby.teams.description')}{' '}
            {t('games.pachisi_v1.lobby.teams.reorderHint')}
          </p>
        </div>
      )}
    </LobbyOptionGroup>
  );
}

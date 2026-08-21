'use client';

import React, { useCallback } from 'react';
import { Card, StatusBadge, Toggle, Typography } from '@arcadeum/ui';

import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import {
  TeamSetupPanel,
  TeamSlotsBoard,
  UnassignedPool,
  emitRemoveBotFromTeam,
  emitSetTeamMode,
  emitToggleHideShips,
  type SeaBattleTeam,
  type TeamSlotsMember,
} from '@/features/games/sea-battle/lobby';

interface SeaBattleTeamPanelProps {
  roomId: string;
  userId: string;
  hostId: string;
  isHost: boolean;
  teamMode: boolean;
  teams: SeaBattleTeam[];
  hideShipsFromTeammates: boolean;
  members: TeamSlotsMember[];
  teamStartBlocked: boolean;
  maxTotalPlayers: number;
}

/**
 * Single unified panel that hosts every team-mode control in one card. When
 * team mode is OFF the card collapses to just the host toggle; otherwise it
 * stacks header / config / slots / unassigned pool in a clear visual order so
 * nothing overlaps the lobby's Start button.
 */
export const SeaBattleTeamPanel = React.memo(function SeaBattleTeamPanel({
  roomId,
  userId,
  hostId,
  isHost,
  teamMode,
  teams,
  hideShipsFromTeammates,
  members,
  teamStartBlocked,
  maxTotalPlayers,
}: SeaBattleTeamPanelProps) {
  const { t } = useTranslation();

  const handleToggleTeamMode = useCallback(
    (next: boolean) => {
      emitSetTeamMode({ roomId, userId, enabled: next });
    },
    [roomId, userId],
  );

  const handleToggleHideShips = useCallback(
    (next: boolean) => {
      emitToggleHideShips({ roomId, userId, enabled: next });
    },
    [roomId, userId],
  );

  const enableLabel = t(
    'games.sea_battle_v1.teamMode.enableLabel' as TranslationKey,
  );
  const hideShipsLabel = t(
    'games.sea_battle_v1.teamMode.hideShipsLabel' as TranslationKey,
  );

  // Non-host viewers see nothing when team mode is off.
  if (!teamMode && !isHost) return null;

  const assigned = new Set(teams.flatMap((team) => team.playerIds));
  const unassignedMembers = members.filter((m) => !assigned.has(m.userId));
  const hasUnassigned = unassignedMembers.length > 0;

  const header = (
    <div className="flex flex-row items-center justify-between gap-3 flex-wrap">
      <div
        className="flex flex-row items-center gap-3"
        data-testid={isHost ? 'team-mode-toggle' : undefined}
      >
        <Typography variant="heading" uiSize="md">
          {enableLabel}
        </Typography>
        {isHost ? (
          <Toggle
            checked={teamMode}
            onCheckedChange={handleToggleTeamMode}
            ariaLabel={enableLabel}
            testId="team-mode-switch"
          />
        ) : (
          <StatusBadge active={teamMode} />
        )}
      </div>

      {isHost && teamMode && (
        <div className="flex flex-row items-center gap-2">
          <Typography variant="caption" uiSize="sm">
            {hideShipsLabel}
          </Typography>
          <Toggle
            checked={hideShipsFromTeammates}
            onCheckedChange={handleToggleHideShips}
            ariaLabel={hideShipsLabel}
            testId="hide-ships-switch"
          />
        </div>
      )}
    </div>
  );

  return (
    <Card variant="outlined" data-testid="sea-battle-team-panel">
      <div className="flex flex-col items-stretch gap-3">
        {header}

        {teamMode && teamStartBlocked && isHost && (
          <div
            className="flex flex-row items-center justify-center px-3 py-2 rounded-[10px] border bg-[rgba(251,191,36,0.08)] border-[rgba(251,191,36,0.3)]"
            role="status"
            aria-live="polite"
            data-testid="team-start-blocked-notice"
          >
            <span className="text-[12px] font-semibold text-[#fcd34d]">
              {t(
                'games.sea_battle_v1.teamMode.start.disabledNotFull' as TranslationKey,
              )}
            </span>
          </div>
        )}

        {teamMode && isHost && (
          <TeamSetupPanel
            roomId={roomId}
            userId={userId}
            hostId={hostId}
            teams={teams}
            maxTotalPlayers={maxTotalPlayers}
          />
        )}

        {teamMode && (
          <TeamSlotsBoard
            roomId={roomId}
            userId={userId}
            hostId={hostId}
            teams={teams}
            members={members}
            maxTotalPlayers={maxTotalPlayers}
          />
        )}

        {teamMode && hasUnassigned && (
          <UnassignedPool
            members={members}
            teams={teams}
            onRemoveBot={
              isHost
                ? (botId) =>
                    emitRemoveBotFromTeam({
                      roomId,
                      userId,
                      targetUserId: botId,
                    })
                : undefined
            }
          />
        )}
      </div>
    </Card>
  );
});

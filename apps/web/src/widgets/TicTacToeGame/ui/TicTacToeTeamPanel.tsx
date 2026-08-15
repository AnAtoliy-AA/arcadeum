'use client';

import { useMemo } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { GameRoomSummary } from '@/shared/types/games';
import { TEAM_PRESETS } from '../lib/teamPresets';

interface TicTacToeTeamPanelProps {
  room: GameRoomSummary;
  isHost: boolean;
}

// A purposefully minimal team panel for tic-tac-toe. Sea-battle's
// SeaBattleTeamPanel ships with placement-phase concerns that don't apply
// here — keep this slim and dedicated.
export function TicTacToeTeamPanel({
  room,
  isHost: _isHost,
}: TicTacToeTeamPanelProps) {
  const { t } = useTranslation();

  const teamConfig = useMemo(() => {
    const raw = (room.gameOptions as { teams?: unknown } | undefined)?.teams;
    if (Array.isArray(raw)) {
      return raw as Array<{
        id: string;
        name: string;
        color: string;
        playerIds: string[];
      }>;
    }
    // Synthesize an even split from current members if no teamConfig yet.
    const participants =
      room.members?.map((p) => p.id).filter((id): id is string => !!id) ?? [];
    const half = Math.ceil(participants.length / 2);
    return TEAM_PRESETS.map((preset, idx) => ({
      ...preset,
      playerIds:
        idx === 0 ? participants.slice(0, half) : participants.slice(half),
    }));
  }, [room]);

  return (
    <div className="flex flex-col items-stretch gap-2">
      <span className="text-[16px] font-semibold">
        {t('games.tic_tac_toe_v1.lobby.teamMode')}
      </span>
      <div className="flex flex-row items-stretch gap-3 flex-wrap">
        {teamConfig.map((team) => (
          <div
            className="flex flex-col items-stretch p-3 rounded-[10px] border-[2px] min-w-[140px] gap-2"
            style={{ borderColor: team.color }}
            key={team.id}
          >
            <span className="font-bold" style={{ color: team.color }}>
              {team.name}
            </span>
            {team.playerIds.length === 0 ? (
              <span className="text-[14px] opacity-[0.6]">
                {t('games.tic_tac_toe_v1.lobby.waitingForPlayers')}
              </span>
            ) : (
              team.playerIds.map((pid: string) => (
                <span className="text-[14px]" key={pid}>
                  {pid.startsWith('bot-') ? `🤖 ${pid.slice(0, 10)}` : pid}
                </span>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useMemo } from 'react';
import { XStack, YStack, Text } from 'tamagui';
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
    <YStack gap="$2">
      <Text fontSize="$3" fontWeight="600">
        {t('games.tic_tac_toe_v1.lobby.teamMode')}
      </Text>
      <XStack gap="$3" flexWrap="wrap">
        {teamConfig.map((team) => (
          <YStack
            key={team.id}
            padding="$3"
            borderRadius={10}
            borderWidth={2}
            borderColor={team.color}
            minWidth={140}
            gap="$2"
          >
            <Text fontWeight="700" color={team.color}>
              {team.name}
            </Text>
            {team.playerIds.length === 0 ? (
              <Text fontSize="$2" opacity={0.6}>
                {t('games.tic_tac_toe_v1.lobby.waitingForPlayers')}
              </Text>
            ) : (
              team.playerIds.map((pid: string) => (
                <Text key={pid} fontSize="$2">
                  {pid.startsWith('bot-') ? `🤖 ${pid.slice(0, 10)}` : pid}
                </Text>
              ))
            )}
          </YStack>
        ))}
      </XStack>
    </YStack>
  );
}

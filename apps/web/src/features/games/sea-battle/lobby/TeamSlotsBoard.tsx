'use client';

import {
  Avatar,
  Badge,
  Button,
  Card,
  Typography,
  XStack,
  YStack,
} from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  emitAddBotToTeam,
  emitAssignTeam,
  emitRemoveBotFromTeam,
} from './team-mode.api';
import type { SeaBattleTeam } from './team-mode.types';

export interface TeamSlotsMember {
  userId: string;
  displayName?: string;
  avatarUrl?: string;
}

interface TeamSlotsBoardProps {
  roomId: string;
  userId: string;
  hostId: string;
  teams: SeaBattleTeam[];
  members: TeamSlotsMember[];
}

function isBot(id: string): boolean {
  return id.startsWith('bot-');
}

function memberDisplayName(
  id: string,
  members: TeamSlotsMember[],
  botLabel: string,
): string {
  if (isBot(id)) return botLabel;
  const m = members.find((mm) => mm.userId === id);
  return m?.displayName ?? id;
}

/**
 * Visible to all players. Each team is a card with N slots; empty slots are
 * "Join team" buttons; filled slots show avatar + name. The host can move any
 * non-self player between teams via inline action buttons, remove bots, and
 * add bots to fill open slots.
 */
export function TeamSlotsBoard(props: TeamSlotsBoardProps) {
  const { roomId, userId, hostId, teams, members } = props;
  const { t } = useTranslation();
  const isHost = userId === hostId;
  const botLabel = t('games.sea_battle_v1.teamMode.slots.botLabel');

  return (
    <XStack gap="$3" flexWrap="wrap" data-testid="team-slots-board">
      {teams.map((team) => {
        const filled = team.playerIds;
        const emptyCount = Math.max(0, team.targetSize - filled.length);
        const teamFull = filled.length >= team.targetSize;
        const viewerOnThisTeam = filled.includes(userId);

        return (
          <Card
            key={team.id}
            variant="outlined"
            padding="md"
            data-testid={`team-card-${team.id}`}
            style={{
              borderLeftWidth: 4,
              borderLeftColor: team.color,
              minWidth: 220,
              flex: 1,
            }}
          >
            <YStack gap="$2">
              <Typography
                variant="heading"
                uiSize="md"
                style={{ color: team.color }}
              >
                {team.name}
              </Typography>

              {filled.map((id) => {
                const display = memberDisplayName(id, members, botLabel);
                const isViewer = id === userId;
                const memberIsBot = isBot(id);

                return (
                  <XStack
                    key={id}
                    gap="$2"
                    alignItems="center"
                    justifyContent="space-between"
                    data-testid={`team-slot-${team.id}-${id}`}
                  >
                    <XStack gap="$2" alignItems="center" flex={1}>
                      <Avatar size="sm" name={display} />
                      <Typography variant="body" uiSize="sm">
                        {display}
                      </Typography>
                      {memberIsBot && (
                        <Badge variant="neutral" size="sm">
                          {botLabel}
                        </Badge>
                      )}
                    </XStack>

                    {isHost && memberIsBot && (
                      <Button
                        size="sm"
                        variant="secondary"
                        aria-label={t(
                          'games.sea_battle_v1.teamMode.setup.removeBot',
                        )}
                        data-testid={`bot-remove-${id}`}
                        onClick={() =>
                          emitRemoveBotFromTeam({
                            roomId,
                            userId,
                            targetUserId: id,
                          })
                        }
                      >
                        ×
                      </Button>
                    )}

                    {isViewer && (
                      <Button
                        size="sm"
                        variant="secondary"
                        data-testid="leave-team-btn"
                        onClick={() =>
                          emitAssignTeam({ roomId, userId, teamId: null })
                        }
                      >
                        {t('games.sea_battle_v1.teamMode.slots.leaveTeam')}
                      </Button>
                    )}

                    {isHost && !isViewer && !memberIsBot && (
                      <XStack gap="$1" flexWrap="wrap">
                        {teams
                          .filter((other) => other.id !== team.id)
                          .map((other) => (
                            <Button
                              key={other.id}
                              size="sm"
                              variant="secondary"
                              disabled={
                                other.playerIds.length >= other.targetSize
                              }
                              data-testid={`move-${id}-to-${other.id}`}
                              onClick={() =>
                                emitAssignTeam({
                                  roomId,
                                  userId,
                                  targetUserId: id,
                                  teamId: other.id,
                                })
                              }
                            >
                              {t('games.sea_battle_v1.teamMode.slots.moveTo', {
                                team: other.name,
                              })}
                            </Button>
                          ))}
                      </XStack>
                    )}
                  </XStack>
                );
              })}

              {Array.from({ length: emptyCount }).map((_, i) => (
                <Button
                  key={`empty-${team.id}-${i}`}
                  variant="secondary"
                  size="sm"
                  disabled={teamFull || viewerOnThisTeam}
                  data-testid={`join-${team.id}-${i}`}
                  onClick={() =>
                    emitAssignTeam({ roomId, userId, teamId: team.id })
                  }
                >
                  {t('games.sea_battle_v1.teamMode.slots.joinTeam')}
                </Button>
              ))}

              {isHost && !teamFull && (
                <Button
                  variant="secondary"
                  size="sm"
                  data-testid={`add-bot-${team.id}`}
                  onClick={() =>
                    emitAddBotToTeam({ roomId, userId, teamId: team.id })
                  }
                >
                  {t('games.sea_battle_v1.teamMode.setup.addBot')}
                </Button>
              )}
            </YStack>
          </Card>
        );
      })}
    </XStack>
  );
}

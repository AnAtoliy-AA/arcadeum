'use client';

import { Avatar, Button, Card, Typography, XStack, YStack } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { SeaBattleTeam } from './team-mode.types';

export interface UnassignedPoolMember {
  userId: string;
  displayName?: string;
}

interface UnassignedPoolProps {
  members: UnassignedPoolMember[];
  teams: SeaBattleTeam[];
  onRemoveBot?: (botId: string) => void;
}

/**
 * Lists room members that have not been placed on any team yet. The pool is
 * derived by subtracting all `playerIds` across teams from the total members
 * list. Unassigned bots can't join a team on their own, so when an
 * onRemoveBot handler is provided the host gets a remove button next to each
 * bot in the pool.
 */
export function UnassignedPool(props: UnassignedPoolProps) {
  const { members, teams, onRemoveBot } = props;
  const { t } = useTranslation();
  const assigned = new Set(teams.flatMap((team) => team.playerIds));
  const pool = members.filter((m) => !assigned.has(m.userId));

  return (
    <Card variant="outlined" padding="md" data-testid="unassigned-pool">
      <YStack gap="$2">
        <Typography variant="heading" uiSize="md">
          {t('games.sea_battle_v1.teamMode.unassigned.title')}
        </Typography>
        {pool.length === 0 ? (
          <Typography variant="caption" uiSize="sm">
            {t('games.sea_battle_v1.teamMode.unassigned.empty')}
          </Typography>
        ) : (
          <XStack gap="$2" flexWrap="wrap">
            {pool.map((m) => {
              const display = m.displayName ?? m.userId;
              const isBot = m.userId.startsWith('bot-');
              return (
                <XStack
                  key={m.userId}
                  gap="$1"
                  alignItems="center"
                  data-testid={`unassigned-${m.userId}`}
                >
                  <Avatar size="sm" name={display} />
                  <Typography variant="body" uiSize="sm">
                    {display}
                  </Typography>
                  {isBot && onRemoveBot && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveBot(m.userId)}
                      data-testid={`unassigned-remove-${m.userId}`}
                    >
                      ✕
                    </Button>
                  )}
                </XStack>
              );
            })}
          </XStack>
        )}
      </YStack>
    </Card>
  );
}

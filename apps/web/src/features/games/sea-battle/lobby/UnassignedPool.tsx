'use client';

import { Button, Card, Typography } from '@arcadeum/ui';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { SeaBattleTeam } from './team-mode.types';

export interface UnassignedPoolMember {
  userId: string;
  displayName?: string;
  equippedAvatarId?: string | null;
  equippedBadgeId?: string | null;
  equippedNameColorId?: string | null;
  equippedFrameId?: string | null;
  equippedAuraId?: string | null;
  equippedBannerId?: string | null;
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
    <Card variant="outlined" data-testid="unassigned-pool">
      <div className="flex flex-col items-stretch gap-2">
        <Typography variant="heading" uiSize="md">
          {t('games.sea_battle_v1.teamMode.unassigned.title')}
        </Typography>
        {pool.length === 0 ? (
          <Typography variant="caption" uiSize="sm">
            {t('games.sea_battle_v1.teamMode.unassigned.empty')}
          </Typography>
        ) : (
          <div className="flex flex-row items-stretch gap-2 flex-wrap">
            {pool.map((m) => {
              const display = m.displayName ?? m.userId;
              const isBot = m.userId.startsWith('bot-');
              return (
                <div
                  className="flex flex-row gap-1 items-center"
                  key={m.userId}
                  data-testid={`unassigned-${m.userId}`}
                >
                  <EquippedPlayerAvatar
                    size="icon"
                    name={display}
                    equippedAvatarId={m.equippedAvatarId ?? null}
                    equippedBadgeId={m.equippedBadgeId ?? null}
                    equippedNameColorId={m.equippedNameColorId}
                    equippedFrameId={m.equippedFrameId}
                    equippedAuraId={m.equippedAuraId}
                    equippedBannerId={m.equippedBannerId}
                  />
                  <Typography variant="body" uiSize="sm">
                    {display}
                  </Typography>
                  {isBot && onRemoveBot && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onRemoveBot(m.userId)}
                      data-testid={`unassigned-remove-${m.userId}`}
                    >
                      ×
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

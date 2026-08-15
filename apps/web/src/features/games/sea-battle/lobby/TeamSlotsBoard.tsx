'use client';

import { useState } from 'react';
import { Badge, Button, Card, Input, Typography } from '@arcadeum/ui';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useEquippedCosmetics } from '@/features/shop/hooks/useEquippedCosmetics';
import { nameColorRenderProps } from '@/features/shop/lib/nameColor';
import {
  emitAddBotToTeam,
  emitAssignTeam,
  emitRemoveBotFromTeam,
  emitSetTeamConfig,
} from './team-mode.api';
import { ColorPalette, SizeStepper } from './team-controls';
import { MIN_TEAMS, type SeaBattleTeam } from './team-mode.types';

export interface TeamSlotsMember {
  userId: string;
  displayName?: string;
  avatarUrl?: string;
  equippedAvatarId?: string | null;
  equippedBadgeId?: string | null;
  equippedNameColorId?: string | null;
  equippedFrameId?: string | null;
  equippedAuraId?: string | null;
  equippedBannerId?: string | null;
}

interface TeamSlotsBoardProps {
  roomId: string;
  userId: string;
  hostId: string;
  teams: SeaBattleTeam[];
  members: TeamSlotsMember[];
  maxTotalPlayers: number;
}

interface TeamDraft {
  id: string;
  name: string;
  color: string;
  targetSize: number;
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
 * Visible to all players. Each team is a card with a colored stripe, header
 * (editable for host: name + color + size + remove; read-only otherwise),
 * and N filled-or-empty slots. The host can also move non-self players
 * between teams, remove bots, and add bots to fill open slots.
 */
export function TeamSlotsBoard(props: TeamSlotsBoardProps) {
  const { roomId, userId, hostId, teams, members, maxTotalPlayers } = props;
  const { t } = useTranslation();
  const isHost = userId === hostId;
  const botLabel = t('games.sea_battle_v1.teamMode.slots.botLabel');

  const buildDrafts = (source: SeaBattleTeam[]): TeamDraft[] =>
    source.map((team) => ({
      id: team.id,
      name: team.name,
      color: team.color,
      targetSize: team.targetSize,
    }));

  const [drafts, setDrafts] = useState<TeamDraft[]>(() => buildDrafts(teams));
  const [prevTeams, setPrevTeams] = useState(teams);
  if (prevTeams !== teams) {
    setPrevTeams(teams);
    setDrafts(buildDrafts(teams));
  }

  const totalSlots = drafts.reduce((s, d) => s + d.targetSize, 0);

  const commit = (next: TeamDraft[]) => {
    emitSetTeamConfig({
      roomId,
      userId,
      teams: next.map((d) => ({
        id: d.id,
        name: d.name,
        color: d.color,
        targetSize: d.targetSize,
      })),
    });
  };

  const updateDraft = (id: string, patch: Partial<TeamDraft>) => {
    const next = drafts.map((d) => (d.id === id ? { ...d, ...patch } : d));
    setDrafts(next);
    commit(next);
  };

  const removeTeam = (id: string) => {
    if (drafts.length <= MIN_TEAMS) return;
    const next = drafts.filter((d) => d.id !== id);
    setDrafts(next);
    commit(next);
  };

  return (
    <div
      className="box-border flex flex-row items-stretch gap-3 flex-wrap"
      data-testid="team-slots-board"
    >
      {teams.map((team) => {
        const draft = drafts.find((d) => d.id === team.id) ?? {
          id: team.id,
          name: team.name,
          color: team.color,
          targetSize: team.targetSize,
        };
        const filled = team.playerIds;
        const emptyCount = Math.max(0, team.targetSize - filled.length);
        const teamFull = filled.length >= team.targetSize;
        const viewerOnThisTeam = filled.includes(userId);

        return (
          <Card
            key={team.id}
            variant="outlined"
            data-testid={`team-card-${team.id}`}
            style={{
              borderLeftWidth: 4,
              borderLeftColor: draft.color,
              minWidth: 260,
              flex: 1,
            }}
          >
            <div className="box-border flex flex-col items-stretch gap-2">
              {isHost ? (
                <div
                  className="box-border flex flex-row gap-2 items-center flex-wrap"
                  data-testid={`team-row-${team.id}`}
                >
                  <Input
                    className={'flex-1 min-w-[120px]'}
                    type="text"
                    value={draft.name}
                    placeholder={t(
                      'games.sea_battle_v1.teamMode.setup.teamNamePlaceholder',
                    )}
                    aria-label={t(
                      'games.sea_battle_v1.teamMode.setup.teamNamePlaceholder',
                    )}
                    size="sm"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateDraft(team.id, { name: e.target.value })
                    }
                  />
                  <ColorPalette
                    color={draft.color}
                    onChange={(c) => updateDraft(team.id, { color: c })}
                  />
                  <SizeStepper
                    value={draft.targetSize}
                    onChange={(n) => updateDraft(team.id, { targetSize: n })}
                    max={maxTotalPlayers - (totalSlots - draft.targetSize)}
                  />
                  {drafts.length > MIN_TEAMS && (
                    <Button
                      variant="secondary"
                      size="sm"
                      aria-label={t(
                        'games.sea_battle_v1.teamMode.setup.removeTeam',
                      )}
                      data-testid={`team-remove-${team.id}`}
                      onClick={() => removeTeam(team.id)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ) : (
                <Typography
                  variant="heading"
                  uiSize="md"
                  style={{ color: team.color }}
                >
                  {team.name}
                </Typography>
              )}

              {filled.map((id) => {
                const display = memberDisplayName(id, members, botLabel);
                const isViewer = id === userId;
                const memberIsBot = isBot(id);
                const member = members.find((m) => m.userId === id);

                return (
                  <div
                    className="box-border flex flex-row gap-2 items-center justify-space-between"
                    key={id}
                    data-testid={`team-slot-${team.id}-${id}`}
                  >
                    <TeamMemberIdentity
                      member={member}
                      display={display}
                      showBotBadge={memberIsBot}
                      botLabel={botLabel}
                    />

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
                      <div className="box-border flex flex-row items-stretch gap-1 flex-wrap">
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
                              aria-label={t(
                                'games.sea_battle_v1.teamMode.slots.moveTo',
                                { team: other.name },
                              )}
                              onClick={() =>
                                emitAssignTeam({
                                  roomId,
                                  userId,
                                  targetUserId: id,
                                  teamId: other.id,
                                })
                              }
                              style={{
                                paddingInline: 8,
                                fontSize: 11,
                                minHeight: 26,
                              }}
                            >
                              <span
                                aria-hidden
                                style={{
                                  display: 'inline-block',
                                  width: 8,
                                  height: 8,
                                  borderRadius: 2,
                                  backgroundColor: other.color,
                                  marginRight: 6,
                                }}
                              />
                              {other.name}
                            </Button>
                          ))}
                      </div>
                    )}
                  </div>
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
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function TeamMemberIdentity({
  member,
  display,
  showBotBadge,
  botLabel,
}: {
  member: TeamSlotsMember | undefined;
  display: string;
  showBotBadge: boolean;
  botLabel: string;
}) {
  const { nameColor } = useEquippedCosmetics({
    equippedAvatarId: member?.equippedAvatarId,
    equippedBadgeId: member?.equippedBadgeId,
    equippedNameColorId: member?.equippedNameColorId,
    equippedFrameId: member?.equippedFrameId,
    equippedAuraId: member?.equippedAuraId,
    equippedBannerId: member?.equippedBannerId,
  });
  const nameProps = nameColorRenderProps(nameColor);
  return (
    <div className="box-border flex flex-row gap-2 items-center flex-1">
      <EquippedPlayerAvatar
        size="sm"
        name={display}
        equippedAvatarId={member?.equippedAvatarId ?? null}
        equippedBadgeId={member?.equippedBadgeId ?? null}
        equippedNameColorId={member?.equippedNameColorId}
        equippedFrameId={member?.equippedFrameId}
        equippedAuraId={member?.equippedAuraId}
        equippedBannerId={member?.equippedBannerId}
        fallbackAvatarUrl={member?.avatarUrl}
      />
      <Typography
        variant="body"
        uiSize="sm"
        {...(nameProps.color ? { color: nameProps.color } : {})}
        {...(nameProps.style ? { style: nameProps.style } : {})}
      >
        {display}
      </Typography>
      {showBotBadge ? (
        <Badge variant="neutral" size="sm">
          {botLabel}
        </Badge>
      ) : null}
    </div>
  );
}

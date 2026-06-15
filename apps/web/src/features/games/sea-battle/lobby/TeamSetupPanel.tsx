'use client';

import { Button, Card, Typography, XStack, YStack } from '@arcadeum/ui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { emitSetTeamConfig } from './team-mode.api';
import {
  MAX_TEAMS,
  MIN_TEAMS,
  MIN_TEAM_SIZE,
  TEAM_DEFAULT_COLORS,
  type SeaBattleTeam,
} from './team-mode.types';

interface TeamSetupPanelProps {
  roomId: string;
  userId: string;
  hostId: string;
  teams: SeaBattleTeam[];
  maxTotalPlayers: number;
  onMaxTotalPlayersChange?: (next: number) => void;
}

export function TeamSetupPanel(props: TeamSetupPanelProps) {
  const {
    roomId,
    userId,
    hostId,
    teams,
    maxTotalPlayers,
    onMaxTotalPlayersChange,
  } = props;
  const { t } = useTranslation();

  if (userId !== hostId) return null;

  const totalSlots = teams.reduce((sum, team) => sum + team.targetSize, 0);
  const isOverCap = totalSlots > maxTotalPlayers;
  const tooFewTeams = teams.length < MIN_TEAMS;
  const someUnderMin = teams.some((team) => team.targetSize < MIN_TEAM_SIZE);
  const hasErrors = isOverCap || tooFewTeams || someUnderMin;

  const addTeam = () => {
    if (teams.length >= MAX_TEAMS) return;
    const idx = teams.length;
    const placeholder = t(
      'games.sea_battle_v1.teamMode.setup.teamNamePlaceholder',
    );
    const next = [
      ...teams.map((team) => ({
        id: team.id,
        name: team.name,
        color: team.color,
        targetSize: team.targetSize,
      })),
      {
        id: `t${idx + 1}`,
        name: `${placeholder} ${idx + 1}`,
        color: TEAM_DEFAULT_COLORS[idx] ?? TEAM_DEFAULT_COLORS[0],
        targetSize: MIN_TEAM_SIZE,
      },
    ];
    emitSetTeamConfig({ roomId, userId, teams: next });
  };

  const handleMaxChange = (next: number) => {
    onMaxTotalPlayersChange?.(next);
  };

  return (
    <YStack gap="$2" data-testid="team-setup-panel">
      <XStack gap="$3" alignItems="center" flexWrap="wrap">
        <Button
          variant="secondary"
          size="sm"
          disabled={teams.length >= MAX_TEAMS}
          onClick={addTeam}
          data-testid="team-add-btn"
        >
          {t('games.sea_battle_v1.teamMode.setup.addTeam')}
        </Button>
        <Typography variant="caption" uiSize="sm">
          {t('games.sea_battle_v1.teamMode.setup.totalSlots', {
            used: totalSlots,
            max: maxTotalPlayers,
          })}
        </Typography>
      </XStack>

      <XStack gap="$2" alignItems="center" flexWrap="wrap">
        <Typography variant="caption" uiSize="sm">
          {t(
            'games.sea_battle_v1.teamMode.setup.maxPlayers' as TranslationKey,
          ) || 'Max players:'}
        </Typography>
        <XStack alignItems="center" gap="$1">
          <Button
            size="sm"
            variant="secondary"
            disabled={maxTotalPlayers <= MIN_TEAM_SIZE * MIN_TEAMS}
            onClick={() => handleMaxChange(maxTotalPlayers - 1)}
          >
            −
          </Button>
          <Typography
            variant="body"
            uiSize="md"
            style={{ minWidth: 24, textAlign: 'center' }}
          >
            {maxTotalPlayers}
          </Typography>
          <Button
            size="sm"
            variant="secondary"
            disabled={maxTotalPlayers >= 12}
            onClick={() => handleMaxChange(maxTotalPlayers + 1)}
          >
            +
          </Button>
        </XStack>
      </XStack>

      {hasErrors && (
        <Card variant="error" padding="sm" data-testid="team-setup-validation">
          <YStack gap="$1">
            {isOverCap && (
              <Typography variant="caption" uiSize="sm">
                {t('games.sea_battle_v1.teamMode.errors.roomFull')}
              </Typography>
            )}
            {tooFewTeams && (
              <Typography variant="caption" uiSize="sm">
                {t('games.sea_battle_v1.teamMode.setup.minTeamsHint')}
              </Typography>
            )}
            {someUnderMin && (
              <Typography variant="caption" uiSize="sm">
                {t('games.sea_battle_v1.teamMode.setup.minSizeHint')}
              </Typography>
            )}
          </YStack>
        </Card>
      )}
    </YStack>
  );
}

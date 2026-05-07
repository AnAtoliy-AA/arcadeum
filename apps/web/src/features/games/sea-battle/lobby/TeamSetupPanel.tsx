'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Input, Typography, XStack, YStack } from '@arcadeum/ui';
import { Switch } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  emitSetTeamConfig,
  emitToggleHideShips,
  type TeamConfigDraft,
} from './team-mode.api';
import {
  MAX_TEAMS,
  MAX_TOTAL_PLAYERS,
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
  hideShipsFromTeammates: boolean;
}

interface TeamDraft extends TeamConfigDraft {
  id: string;
}

function toDraft(team: SeaBattleTeam): TeamDraft {
  return {
    id: team.id,
    name: team.name,
    color: team.color,
    targetSize: team.targetSize,
  };
}

/**
 * Host-only setup panel for configuring teams (name, color, target size).
 * Includes the "Hide ships from teammates" toggle and a validation banner.
 *
 * The panel mirrors `props.teams` into local state so the inputs stay
 * controlled. Each user-initiated change emits the full updated team list to
 * the backend, which atomically replaces the configuration.
 */
export function TeamSetupPanel(props: TeamSetupPanelProps) {
  const { roomId, userId, hostId, teams, hideShipsFromTeammates } = props;
  const { t } = useTranslation();
  const [drafts, setDrafts] = useState<TeamDraft[]>(() => teams.map(toDraft));

  useEffect(() => {
    setDrafts(teams.map(toDraft));
  }, [teams]);

  if (userId !== hostId) return null;

  const totalSlots = drafts.reduce((sum, d) => sum + d.targetSize, 0);
  const isOverCap = totalSlots > MAX_TOTAL_PLAYERS;
  const tooFewTeams = drafts.length < MIN_TEAMS;
  const someUnderMin = drafts.some((d) => d.targetSize < MIN_TEAM_SIZE);
  const hasErrors = isOverCap || tooFewTeams || someUnderMin;

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

  const updateDraft = (idx: number, patch: Partial<TeamDraft>) => {
    const next = drafts.map((d, i) => (i === idx ? { ...d, ...patch } : d));
    setDrafts(next);
    commit(next);
  };

  const addTeam = () => {
    if (drafts.length >= MAX_TEAMS) return;
    const idx = drafts.length;
    const placeholder = t(
      'games.sea_battle_v1.teamMode.setup.teamNamePlaceholder',
    );
    const next: TeamDraft[] = [
      ...drafts,
      {
        id: `t${idx + 1}`,
        name: `${placeholder} ${idx + 1}`,
        color: TEAM_DEFAULT_COLORS[idx] ?? TEAM_DEFAULT_COLORS[0],
        targetSize: MIN_TEAM_SIZE,
      },
    ];
    setDrafts(next);
    commit(next);
  };

  const removeTeam = (idx: number) => {
    if (drafts.length <= MIN_TEAMS) return;
    const next = drafts.filter((_, i) => i !== idx);
    setDrafts(next);
    commit(next);
  };

  return (
    <Card variant="outlined" padding="md" data-testid="team-setup-panel">
      <YStack gap="$3">
        <Typography variant="heading" uiSize="lg">
          {t('games.sea_battle_v1.teamMode.setup.title')}
        </Typography>

        {drafts.map((draft, idx) => (
          <Card
            key={draft.id}
            variant="default"
            padding="sm"
            data-testid={`team-row-${draft.id}`}
          >
            <YStack gap="$2">
              <XStack gap="$2" alignItems="center" flexWrap="wrap">
                <Input
                  flex={1}
                  minWidth={140}
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
                    updateDraft(idx, { name: e.target.value })
                  }
                />
                <ColorPalette
                  color={draft.color}
                  onChange={(c) => updateDraft(idx, { color: c })}
                />
                <SizeStepper
                  value={draft.targetSize}
                  onChange={(n) => updateDraft(idx, { targetSize: n })}
                />
                {drafts.length > MIN_TEAMS && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => removeTeam(idx)}
                    data-testid={`team-remove-${draft.id}`}
                  >
                    {t('games.sea_battle_v1.teamMode.setup.removeTeam')}
                  </Button>
                )}
              </XStack>
            </YStack>
          </Card>
        ))}

        <XStack gap="$3" alignItems="center" flexWrap="wrap">
          <Button
            variant="secondary"
            size="sm"
            disabled={drafts.length >= MAX_TEAMS}
            onClick={addTeam}
            data-testid="team-add-btn"
          >
            {t('games.sea_battle_v1.teamMode.setup.addTeam')}
          </Button>
          <Typography variant="caption" uiSize="sm">
            {t('games.sea_battle_v1.teamMode.setup.totalSlots', {
              used: totalSlots,
              max: MAX_TOTAL_PLAYERS,
            })}
          </Typography>
        </XStack>

        <XStack gap="$3" alignItems="center">
          <Typography variant="label" uiSize="md">
            {t('games.sea_battle_v1.teamMode.hideShipsLabel')}
          </Typography>
          <Switch
            size="$3"
            checked={hideShipsFromTeammates}
            onCheckedChange={(next: boolean) =>
              emitToggleHideShips({ roomId, userId, enabled: next })
            }
            aria-label={t('games.sea_battle_v1.teamMode.hideShipsLabel')}
            data-testid="hide-ships-switch"
          >
            <Switch.Thumb />
          </Switch>
        </XStack>

        {hasErrors && (
          <Card
            variant="error"
            padding="sm"
            data-testid="team-setup-validation"
          >
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
    </Card>
  );
}

interface ColorPaletteProps {
  color: string;
  onChange: (next: string) => void;
}

function ColorPalette({ color, onChange }: ColorPaletteProps) {
  return (
    <XStack gap="$1" data-testid="color-palette">
      {TEAM_DEFAULT_COLORS.map((c) => {
        const selected = c === color;
        return (
          <button
            key={c}
            type="button"
            aria-label={c}
            aria-pressed={selected}
            onClick={() => onChange(c)}
            style={{
              backgroundColor: c,
              outline: selected ? '2px solid white' : 'none',
              outlineOffset: 1,
              width: 24,
              height: 24,
              padding: 0,
              minWidth: 24,
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          />
        );
      })}
    </XStack>
  );
}

interface SizeStepperProps {
  value: number;
  onChange: (next: number) => void;
}

function SizeStepper({ value, onChange }: SizeStepperProps) {
  return (
    <XStack alignItems="center" gap="$1" data-testid="size-stepper">
      <Button
        size="sm"
        variant="secondary"
        aria-label="decrement"
        onClick={() => onChange(Math.max(MIN_TEAM_SIZE, value - 1))}
      >
        −
      </Button>
      <Typography
        variant="body"
        uiSize="md"
        style={{ minWidth: 24, textAlign: 'center' }}
      >
        {value}
      </Typography>
      <Button
        size="sm"
        variant="secondary"
        aria-label="increment"
        onClick={() => onChange(value + 1)}
      >
        +
      </Button>
    </XStack>
  );
}

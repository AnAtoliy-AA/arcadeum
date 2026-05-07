'use client';

import React, { useCallback } from 'react';
import { Card, Typography, XStack, YStack } from '@arcadeum/ui';
import { Text } from 'tamagui';

interface LabeledToggleProps {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  ariaLabel: string;
  testId?: string;
}

function LabeledToggle({
  checked,
  onCheckedChange,
  ariaLabel,
  testId,
}: LabeledToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      data-testid={testId}
      onClick={() => onCheckedChange(!checked)}
      style={{
        position: 'relative',
        width: 60,
        height: 30,
        borderRadius: 999,
        border: '1px solid',
        borderColor: checked ? '#3b82f6' : 'rgba(148,163,184,0.4)',
        backgroundColor: checked ? '#2563eb' : 'rgba(15,23,42,0.6)',
        padding: 0,
        cursor: 'pointer',
        transition: 'background-color 120ms ease, border-color 120ms ease',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: checked ? 'flex-end' : 'flex-start',
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.2)',
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: 8,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 1,
          color: checked ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0)',
          pointerEvents: 'none',
        }}
      >
        ON
      </span>
      <span
        aria-hidden
        style={{
          position: 'absolute',
          right: 8,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 1,
          color: checked ? 'rgba(0,0,0,0)' : 'rgba(203,213,225,0.85)',
          pointerEvents: 'none',
        }}
      >
        OFF
      </span>
      <span
        style={{
          width: 24,
          height: 24,
          margin: 2,
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.5)',
          transition: 'transform 120ms ease',
        }}
      />
    </button>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 1,
        textTransform: 'uppercase',
        padding: '4px 10px',
        borderRadius: 999,
        border: '1px solid',
        borderColor: active ? '#3b82f6' : 'rgba(148,163,184,0.4)',
        backgroundColor: active ? 'rgba(37,99,235,0.18)' : 'rgba(15,23,42,0.6)',
        color: active ? '#93c5fd' : 'rgba(203,213,225,0.85)',
      }}
    >
      {active ? 'ON' : 'OFF'}
    </span>
  );
}

import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import {
  TeamSetupPanel,
  TeamSlotsBoard,
  UnassignedPool,
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
    <XStack
      alignItems="center"
      justifyContent="space-between"
      gap="$3"
      flexWrap="wrap"
    >
      <XStack
        alignItems="center"
        gap="$3"
        data-testid={isHost ? 'team-mode-toggle' : undefined}
      >
        <Typography variant="heading" uiSize="md">
          {enableLabel}
        </Typography>
        {isHost ? (
          <LabeledToggle
            checked={teamMode}
            onCheckedChange={handleToggleTeamMode}
            ariaLabel={enableLabel}
            testId="team-mode-switch"
          />
        ) : (
          <StatusBadge active={teamMode} />
        )}
      </XStack>

      {isHost && teamMode && (
        <XStack alignItems="center" gap="$2">
          <Typography variant="caption" uiSize="sm">
            {hideShipsLabel}
          </Typography>
          <LabeledToggle
            checked={hideShipsFromTeammates}
            onCheckedChange={handleToggleHideShips}
            ariaLabel={hideShipsLabel}
            testId="hide-ships-switch"
          />
        </XStack>
      )}
    </XStack>
  );

  return (
    <Card variant="outlined" padding="md" data-testid="sea-battle-team-panel">
      <YStack gap="$3">
        {header}

        {teamMode && teamStartBlocked && isHost && (
          <XStack
            alignItems="center"
            justifyContent="center"
            paddingHorizontal="$3"
            paddingVertical="$2"
            borderRadius={10}
            borderWidth={1}
            backgroundColor="rgba(251,191,36,0.08)"
            borderColor="rgba(251,191,36,0.3)"
            role="status"
            aria-live="polite"
            data-testid="team-start-blocked-notice"
          >
            <Text fontSize={12} fontWeight="600" color="#fcd34d">
              {t(
                'games.sea_battle_v1.teamMode.start.disabledNotFull' as TranslationKey,
              )}
            </Text>
          </XStack>
        )}

        {teamMode && isHost && (
          <TeamSetupPanel
            roomId={roomId}
            userId={userId}
            hostId={hostId}
            teams={teams}
          />
        )}

        {teamMode && (
          <TeamSlotsBoard
            roomId={roomId}
            userId={userId}
            hostId={hostId}
            teams={teams}
            members={members}
          />
        )}

        {teamMode && hasUnassigned && (
          <UnassignedPool members={members} teams={teams} />
        )}
      </YStack>
    </Card>
  );
});

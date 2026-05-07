'use client';

import { useCallback } from 'react';
import { Switch, XStack } from 'tamagui';
import { Typography } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { emitSetTeamMode } from './team-mode.api';

interface TeamModeToggleProps {
  roomId: string;
  userId: string;
  hostId: string;
  enabled: boolean;
}

/**
 * Host-only switch that flips the room's team mode on or off.
 * Renders nothing for non-host viewers so the lobby looks identical to them
 * until the host activates team mode.
 */
export function TeamModeToggle(props: TeamModeToggleProps) {
  const { roomId, userId, hostId, enabled } = props;
  const { t } = useTranslation();

  const onCheckedChange = useCallback(
    (next: boolean) => {
      emitSetTeamMode({ roomId, userId, enabled: next });
    },
    [roomId, userId],
  );

  if (userId !== hostId) return null;

  const label = t('games.sea_battle_v1.teamMode.enableLabel');

  return (
    <XStack alignItems="center" gap="$3" data-testid="team-mode-toggle">
      <Typography variant="label" uiSize="md">
        {label}
      </Typography>
      <Switch
        size="$3"
        checked={enabled}
        onCheckedChange={onCheckedChange}
        aria-label={label}
        data-testid="team-mode-switch"
      >
        <Switch.Thumb />
      </Switch>
    </XStack>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@arcadeum/ui';
import type { ButtonProps } from '@arcadeum/ui';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { gamesApi } from '@/features/games/api';
import { useRoutes } from '@/shared/config/useRoutes';
import { useMatchmaking } from '@/features/games/ui';
import { trackSocialQuickplayStarted } from '@/shared/analytics/funnel';

type Mode = 'ai' | 'human';

interface Props {
  gameId: string;
  label: string;
  mode: Mode;
  variant?: string;
  theme?: string;
  errorLabel?: string;
  buttonVariant?: ButtonProps['variant'];
  disabled?: boolean;
}

export function QuickplayButton({
  gameId,
  label,
  mode,
  variant,
  theme,
  errorLabel,
  buttonVariant = 'primary',
  disabled = false,
}: Props) {
  const router = useRouter();
  const routes = useRoutes();
  const { snapshot } = useSessionTokens();
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);
  const { joinQueue } = useMatchmaking();

  const handleClick = async () => {
    if (disabled) return;
    setErrored(false);
    if (mode === 'human') {
      joinQueue(gameId, variant);
      return;
    }
    setLoading(true);
    try {
      const options = {
        token: snapshot.accessToken || undefined,
        variant,
        theme,
      };
      const { room } = await gamesApi.quickplay(gameId, options);
      trackSocialQuickplayStarted(gameId, 'ai');
      router.push(routes.gameRoom(room.id));
    } catch (err) {
      console.warn(`Quickplay (${mode}) failed:`, err);
      setErrored(true);
      setLoading(false);
    }
  };

  const displayLabel = errored && errorLabel ? errorLabel : label;
  const displayVariant: ButtonProps['variant'] = errored
    ? 'danger'
    : buttonVariant;

  return (
    <Button
      variant={displayVariant}
      size="lg"
      onClick={handleClick}
      loading={loading}
      disabled={disabled}
      aria-live="polite"
      data-testid={`quickplay-${mode}-button`}
    >
      {displayLabel}
    </Button>
  );
}

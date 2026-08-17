'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@arcadeum/ui';
import type { ButtonProps } from '@arcadeum/ui';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { gamesApi } from '@/features/games/api';
import { useRoutes } from '@/shared/config/useRoutes';
import { useMatchmaking } from '@/features/games/ui';

type Mode = 'ai' | 'human';

interface Props {
  gameId: string;
  label: string;
  mode: Mode;
  variant?: string;
  errorLabel?: string;
  buttonVariant?: ButtonProps['variant'];
  disabled?: boolean;
}

const ERROR_RESET_MS = 3500;

export function QuickplayButton({
  gameId,
  label,
  mode,
  variant,
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

  useEffect(() => {
    if (!errored) return undefined;
    const t = setTimeout(() => setErrored(false), ERROR_RESET_MS);
    return () => clearTimeout(t);
  }, [errored]);

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
      };
      const { room } = await gamesApi.quickplay(gameId, options);
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

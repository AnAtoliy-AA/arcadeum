'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui';
import type { ButtonProps } from '@arcadeum/ui';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { gamesApi } from '@/features/games/api';
import { routes } from '@/shared/config/routes';

type Mode = 'ai' | 'human';

interface Props {
  gameId: string;
  label: string;
  mode: Mode;
  /** Optional: theme variant the user cycled to in the hero. Forwarded
   * to the BE so the room can open in that variant (BE silently
   * ignores until support lands). */
  variant?: string;
  /** Inline error label shown on the button when the API throws. */
  errorLabel?: string;
  buttonVariant?: ButtonProps['variant'];
}

const ERROR_RESET_MS = 3500;

export function QuickplayButton({
  gameId,
  label,
  mode,
  variant,
  errorLabel,
  buttonVariant = 'primary',
}: Props) {
  const router = useRouter();
  const { snapshot } = useSessionTokens();
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);

  // Clear the error state after a few seconds so the user can retry
  // without the button looking permanently broken.
  useEffect(() => {
    if (!errored) return undefined;
    const t = setTimeout(() => setErrored(false), ERROR_RESET_MS);
    return () => clearTimeout(t);
  }, [errored]);

  const handleClick = async () => {
    setErrored(false);
    setLoading(true);
    try {
      const options = {
        token: snapshot.accessToken || undefined,
        variant,
      };
      const { room } =
        mode === 'ai'
          ? await gamesApi.quickplay(gameId, options)
          : await gamesApi.findHumanMatch(gameId, options);
      router.push(routes.gameRoom(room.id));
    } catch (err) {
      // warn, not error — the button surfaces this to the user via the
      // `errored` state + danger variant. Using console.error here
      // pops the Next.js dev overlay on top of our own UX.
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
      aria-live="polite"
      data-testid={`sea-battle-quickplay-${mode}-button`}
    >
      {displayLabel}
    </Button>
  );
}

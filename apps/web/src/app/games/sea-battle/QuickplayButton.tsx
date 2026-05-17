'use client';

import { useState } from 'react';
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
  variant?: ButtonProps['variant'];
}

export function QuickplayButton({
  gameId,
  label,
  mode,
  variant = 'primary',
}: Props) {
  const router = useRouter();
  const { snapshot } = useSessionTokens();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      // Both endpoints accept anonymous users via x-anonymous-id (attached
      // automatically by apiClient), so SEO visitors play without sign-in.
      // The bearer token is still forwarded when present so logged-in
      // users' rooms are owned by their real userId.
      const options = { token: snapshot.accessToken || undefined };
      const { room } =
        mode === 'ai'
          ? await gamesApi.quickplay(gameId, options)
          : await gamesApi.findHumanMatch(gameId, options);
      router.push(routes.gameRoom(room.id));
    } catch (err) {
      console.error(`Quickplay (${mode}) failed:`, err);
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size="lg"
      onClick={handleClick}
      loading={loading}
      data-testid={`sea-battle-quickplay-${mode}-button`}
    >
      {label}
    </Button>
  );
}

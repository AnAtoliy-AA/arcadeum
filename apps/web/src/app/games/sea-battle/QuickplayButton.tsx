'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { gamesApi } from '@/features/games/api';
import { routes } from '@/shared/config/routes';

interface Props {
  gameId: string;
  label: string;
}

export function QuickplayButton({ gameId, label }: Props) {
  const router = useRouter();
  const { snapshot } = useSessionTokens();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      // The /games/quickplay endpoint accepts anonymous users via the
      // x-anonymous-id header that apiClient attaches automatically, so
      // we don't gate on accessToken — visitors arriving from search
      // play immediately. We still forward the bearer token when one
      // exists so logged-in users get their real userId, not anonymous.
      const { room } = await gamesApi.quickplay(gameId, {
        token: snapshot.accessToken || undefined,
      });
      router.push(routes.gameRoom(room.id));
    } catch (err) {
      console.error('Quickplay failed:', err);
      setLoading(false);
    }
  };

  return (
    <Button
      variant="primary"
      size="lg"
      onClick={handleClick}
      loading={loading}
      data-testid="sea-battle-quickplay-button"
    >
      {label}
    </Button>
  );
}

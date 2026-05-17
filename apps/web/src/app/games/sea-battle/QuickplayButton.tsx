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
    if (!snapshot.accessToken) {
      router.push(routes.auth);
      return;
    }

    setLoading(true);
    try {
      const { room } = await gamesApi.quickplay(gameId, {
        token: snapshot.accessToken,
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

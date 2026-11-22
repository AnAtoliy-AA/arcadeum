'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@arcadeum/ui';
import { gamesApi } from '@/features/games/api';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useRoutes } from '@/shared/config/useRoutes';
import { useTranslation } from '@/shared/i18n/useTranslation';

interface QuickJoinButtonProps {
  gameId?: string;
}

type QuickJoinState = 'idle' | 'busy' | 'none' | 'error';

/**
 * Jumps into the newest open public lobby (optionally scoped to one game),
 * skipping rooms the viewer already joined.
 */
export function QuickJoinButton({ gameId }: QuickJoinButtonProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const routes = useRoutes();
  const { snapshot } = useSessionTokens();
  const [state, setState] = useState<QuickJoinState>('idle');

  const handleClick = async () => {
    setState('busy');
    try {
      const { rooms } = await gamesApi.getRooms(
        {
          status: 'lobby',
          openSeats: true,
          participation: snapshot.userId ? 'not_joined' : undefined,
          limit: 1,
          gameId,
        },
        { token: snapshot.accessToken || undefined },
      );
      const target = rooms[0];
      if (!target) {
        setState('none');
        return;
      }
      router.push(routes.gameRoom(target.id));
    } catch {
      setState('error');
    }
  };

  const message =
    state === 'none'
      ? t('roomsBrowser.quickJoinNone')
      : state === 'error'
        ? t('roomsBrowser.quickJoinError')
        : null;

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="primary"
        size="md"
        onClick={handleClick}
        disabled={state === 'busy'}
        data-testid="rooms-quick-join"
      >
        {state === 'busy'
          ? t('roomsBrowser.quickJoinBusy')
          : `⚡ ${t('roomsBrowser.quickJoin')}`}
      </Button>
      {message && (
        <p
          role="status"
          data-testid="rooms-quick-join-message"
          className="m-0 max-w-[260px] text-right text-xs text-[var(--textSecondary)]"
        >
          {message}
        </p>
      )}
    </div>
  );
}

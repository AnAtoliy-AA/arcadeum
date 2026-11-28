'use client';

import React, { useState } from 'react';
import { Button } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { useRoutes } from '@/shared/config/useRoutes';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { rematchApi } from '@/features/rematch/api';
import { ErrorContainer } from './styles';

interface RoomInvitationGateProps {
  roomId: string;
  hostName: string;
  /** Called after the invite was accepted so the page can load the lobby. */
  onAccepted: () => void;
  /** Called after the invite was declined. */
  onDeclined: () => void;
}

type Pending = 'accept' | 'decline' | null;

/**
 * Shown to a user who was invited to a room but has not taken a seat yet.
 * Makes the state explicit: who invited them, and how to accept or decline.
 */
export function RoomInvitationGate({
  roomId,
  hostName,
  onAccepted,
  onDeclined,
}: RoomInvitationGateProps) {
  const { t } = useTranslation();
  const routes = useRoutes();
  const { snapshot } = useSessionTokens();
  const [pending, setPending] = useState<Pending>(null);
  const [failed, setFailed] = useState(false);

  const respond = async (action: Exclude<Pending, null>) => {
    setPending(action);
    setFailed(false);
    try {
      const options = { token: snapshot.accessToken || undefined };
      if (action === 'accept') {
        await rematchApi.acceptInvitation(roomId, options);
        onAccepted();
      } else {
        await rematchApi.declineInvitation(roomId, options);
        onDeclined();
      }
    } catch {
      setFailed(true);
      setPending(null);
    }
  };

  return (
    <ErrorContainer>
      <span aria-hidden="true" className="text-[32px]">
        ✉️
      </span>
      <h1 className="text-lg font-semibold" data-testid="room-invitation-gate">
        {t('games.roomPage.invitation.title', { host: hostName })}
      </h1>
      <p className="max-w-sm text-sm text-[var(--textSecondary)]">
        {t('games.roomPage.invitation.subtitle')}
      </p>
      {failed && (
        <p role="alert" className="text-sm text-[var(--error)]">
          {t('games.roomPage.invitation.error')}
        </p>
      )}
      <div className="mt-2 flex flex-col items-stretch gap-2 sm:flex-row">
        <Button
          variant="primary"
          size="md"
          className="min-h-11"
          disabled={pending !== null}
          onClick={() => void respond('accept')}
          data-testid="room-invitation-accept"
        >
          {pending === 'accept'
            ? t('games.roomPage.invitation.accepting')
            : t('games.roomPage.invitation.accept')}
        </Button>
        <Button
          variant="secondary"
          size="md"
          className="min-h-11"
          disabled={pending !== null}
          onClick={() => void respond('decline')}
          data-testid="room-invitation-decline"
        >
          {t('games.roomPage.invitation.decline')}
        </Button>
      </div>
      <a
        href={routes.rooms}
        className="mt-1 text-xs text-[var(--textSecondary)] underline"
      >
        {t('roomsBrowser.backToRooms')}
      </a>
    </ErrorContainer>
  );
}

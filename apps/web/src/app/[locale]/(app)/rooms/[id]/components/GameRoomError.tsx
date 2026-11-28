import React from 'react';
import { LinkButton } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { useRoutes } from '@/shared/config/useRoutes';
import { ErrorContainer, LoginLink } from './styles';

interface GameRoomErrorProps {
  error: string;
  isPrivateRoomError?: boolean;
}

export function GameRoomError({
  error,
  isPrivateRoomError,
}: GameRoomErrorProps) {
  const { t } = useTranslation();
  const routes = useRoutes();

  return (
    <ErrorContainer>
      <span aria-hidden="true" className="text-[32px]">
        ⚠️
      </span>
      <span role="alert" className="text-base font-semibold">
        {error}
      </span>
      <div className="mt-2 flex flex-col items-stretch gap-2 sm:flex-row">
        {isPrivateRoomError && (
          <LoginLink {...({ href: '/auth' } as Record<string, unknown>)}>
            {t('games.roomPage.errors.loginButton')}
          </LoginLink>
        )}
        <LinkButton
          href={routes.rooms}
          variant="secondary"
          size="md"
          className="min-h-11"
        >
          {t('roomsBrowser.backToRooms')}
        </LinkButton>
      </div>
    </ErrorContainer>
  );
}

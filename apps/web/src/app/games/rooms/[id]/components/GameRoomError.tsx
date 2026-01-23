import React from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
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

  return (
    <ErrorContainer>
      {error}
      {isPrivateRoomError && (
        <>
          <br />
          <LoginLink href="/auth">
            {t('games.roomPage.errors.loginButton')}
          </LoginLink>
        </>
      )}
    </ErrorContainer>
  );
}

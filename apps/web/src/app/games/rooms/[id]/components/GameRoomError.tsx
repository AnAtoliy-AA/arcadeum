import React from 'react';
import { Text } from 'tamagui';
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
      <Text>{error}</Text>
      {isPrivateRoomError && (
        <>
          <br />
          <LoginLink {...({ href: '/auth' } as Record<string, unknown>)}>
            {t('games.roomPage.errors.loginButton')}
          </LoginLink>
        </>
      )}
    </ErrorContainer>
  );
}

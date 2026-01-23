import React from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { gameFactory, BaseGameProps } from '@/features/games';
import { type GameType } from '@/features/games/hooks';
import { ErrorContainer } from './styles';

interface DynamicGameRendererProps {
  gameType: GameType;
  props: BaseGameProps;
}

export const DynamicGameRenderer: React.FC<DynamicGameRendererProps> = ({
  gameType,
  props,
}) => {
  const { t } = useTranslation();

  if (!gameType) {
    return (
      <ErrorContainer>
        {t('games.roomPage.errors.gameTypeMissing')}
      </ErrorContainer>
    );
  }

  if (!props || !props.room) {
    return (
      <ErrorContainer>
        {t('games.roomPage.errors.gameDataIncomplete')}
      </ErrorContainer>
    );
  }

  const LoadedGame = gameFactory.getLoadedGame(gameType);
  if (!LoadedGame) {
    return (
      <ErrorContainer>
        {t('games.roomPage.errors.gameComponentNotFound')}
      </ErrorContainer>
    );
  }

  return React.createElement(LoadedGame, props);
};

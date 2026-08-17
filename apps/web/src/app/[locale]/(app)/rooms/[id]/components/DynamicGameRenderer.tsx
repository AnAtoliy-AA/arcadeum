import React from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { gameFactory, type BaseGameWidgetProps } from '@/features/games';
import { type GameType } from '@/features/games/hooks';
import { ErrorContainer } from './styles';

interface DynamicGameRendererProps {
  gameType: GameType;
  props: BaseGameWidgetProps;
}

export const DynamicGameRenderer: React.FC<DynamicGameRendererProps> = ({
  gameType,
  props,
}) => {
  const { t } = useTranslation();

  if (!gameType) {
    return (
      <ErrorContainer>
        <span className="">{t('games.roomPage.errors.gameTypeMissing')}</span>
      </ErrorContainer>
    );
  }

  if (!props || !props.room) {
    return (
      <ErrorContainer>
        <span className="">
          {t('games.roomPage.errors.gameDataIncomplete')}
        </span>
      </ErrorContainer>
    );
  }

  const LoadedGame = gameFactory.getLoadedGame(gameType);
  if (!LoadedGame) {
    return (
      <ErrorContainer>
        <span className="">
          {t('games.roomPage.errors.gameComponentNotFound')}
        </span>
      </ErrorContainer>
    );
  }

  return React.createElement(LoadedGame, props);
};

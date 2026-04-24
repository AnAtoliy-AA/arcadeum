import React from 'react';
import { Text } from 'tamagui';
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
        <Text>{t('games.roomPage.errors.gameTypeMissing')}</Text>
      </ErrorContainer>
    );
  }

  if (!props || !props.room) {
    return (
      <ErrorContainer>
        <Text>{t('games.roomPage.errors.gameDataIncomplete')}</Text>
      </ErrorContainer>
    );
  }

  const LoadedGame = gameFactory.getLoadedGame(gameType);
  if (!LoadedGame) {
    return (
      <ErrorContainer>
        <Text>{t('games.roomPage.errors.gameComponentNotFound')}</Text>
      </ErrorContainer>
    );
  }

  return React.createElement(LoadedGame, props);
};

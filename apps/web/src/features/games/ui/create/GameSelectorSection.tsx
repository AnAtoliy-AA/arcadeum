'use client';

import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { Section } from '@arcadeum/ui/components/Section/Section';
import {
  GameSelector,
  GameTileItem,
  GameTileContainer,
  GameTileName,
  GameTileSummary,
  ComingSoonBadge,
} from './styles';

interface GameOption {
  id: string;
  name: string;
  summary: string;
  isPlayable: boolean;
}

interface GameSelectorSectionProps {
  games: ReadonlyArray<GameOption>;
  selectedId: string;
  gameComingSoon: Map<string, boolean>;
  onSelect: (id: string) => void;
}

export function GameSelectorSection({
  games,
  selectedId,
  gameComingSoon,
  onSelect,
}: GameSelectorSectionProps) {
  const { t } = useTranslation();
  return (
    <Section title={t('games.create.sectionGame') || 'Select Game'}>
      <GameSelector>
        {games.map((game) => {
          const csGame = gameComingSoon.get(game.id) ?? false;
          const disabled = !game.isPlayable || csGame;
          return (
            <GameTileContainer
              key={game.id}
              disabled={disabled}
              onClick={() => !disabled && onSelect(game.id)}
              data-testid={`game-tile-${game.id}`}
            >
              <GameTileItem active={selectedId === game.id} disabled={disabled}>
                {csGame && (
                  <ComingSoonBadge data-testid={`coming-soon-badge-${game.id}`}>
                    {t('games.create.comingSoon') || 'Coming Soon'}
                  </ComingSoonBadge>
                )}
                <GameTileName>
                  {t(`games.${game.id}.name` as TranslationKey) || game.name}
                </GameTileName>
                <GameTileSummary>
                  {t(`games.${game.id}.description` as TranslationKey) ||
                    game.summary}
                </GameTileSummary>
              </GameTileItem>
            </GameTileContainer>
          );
        })}
      </GameSelector>
    </Section>
  );
}

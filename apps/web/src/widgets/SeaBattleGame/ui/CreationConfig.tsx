import { useEffect } from 'react';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { GameCreationConfigProps } from '@/features/games/types';
import { SEA_BATTLE_VARIANTS } from '@/widgets/SeaBattleGame/lib/constants';
import { Section, Button } from '@/shared/ui';
import {
  GameSelector,
  GameTileName,
  GameTileSummary,
  SelectionIndicator,
  GameTileIcon,
  ThemeHeader,
  getGameTileStyle,
  gameTileCSS,
  GAME_TILE_CLASS,
  GAME_TILE_ICON_CLASS,
} from '@/app/games/create/styles';
import { RulesModal } from './RulesModal';
import { useState } from 'react';

interface SeaBattleOptions {
  variant?: string;
}

export function SeaBattleCreationConfig({
  options,
  onChange,
}: GameCreationConfigProps<SeaBattleOptions>) {
  const { t } = useTranslation();
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    if (!options.variant) {
      onChange({ ...options, variant: 'classic' });
    }
  }, [options, onChange]);

  return (
    <>
      <style>{gameTileCSS}</style>
      <Section title={t('games.create.sectionVariant') || 'Game Theme'}>
        <ThemeHeader>
          <Button
            variant="link"
            size="sm"
            mb="$4"
            type="button"
            onClick={() => setShowRules(true)}
          >
            📖 {t('games.rules.button') || 'View Game Rules'}
          </Button>
        </ThemeHeader>
        <GameSelector>
          {SEA_BATTLE_VARIANTS.map((variant) => (
            <button
              key={variant.id}
              type="button"
              className={`${GAME_TILE_CLASS}${options.variant === variant.id ? ' active' : ''}`}
              style={getGameTileStyle(options.variant === variant.id)}
              onClick={() => onChange({ ...options, variant: variant.id })}
            >
              <SelectionIndicator />
              <GameTileIcon
                className={GAME_TILE_ICON_CLASS}
                style={
                  variant.gradient
                    ? {
                        background: variant.gradient,
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                      }
                    : undefined
                }
              >
                {variant.emoji}
              </GameTileIcon>
              <GameTileName>{t(variant.name as TranslationKey)}</GameTileName>
              <GameTileSummary>
                {t(variant.description as TranslationKey)}
              </GameTileSummary>
            </button>
          ))}
        </GameSelector>
      </Section>

      <RulesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        t={t}
      />
    </>
  );
}

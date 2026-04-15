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
  GameTileItem,
  GameTileContainer,
} from '@/features/games/ui/create/styles';
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
    // Only run when variant is truly missing to avoid re-triggering parent URL sync
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.variant]);

  return (
    <>
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
            <GameTileContainer
              key={variant.id}
              onPress={() => onChange({ ...options, variant: variant.id })}
            >
              <GameTileItem active={options.variant === variant.id}>
                <SelectionIndicator active={options.variant === variant.id} />
                <GameTileIcon
                  background={variant.gradient || undefined}
                  style={
                    variant.gradient
                      ? {
                          WebkitBackgroundClip: 'text',
                          backgroundClip: 'text',
                          color: 'transparent',
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
              </GameTileItem>
            </GameTileContainer>
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

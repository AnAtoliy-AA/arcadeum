import { useEffect } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { GameCreationConfigProps } from '@/features/games/types';
import { SEA_BATTLE_VARIANTS } from '@/widgets/SeaBattleGame/lib/constants';
import { Section } from '@/shared/ui';
import {
  GameSelector,
  GameTile,
  GameTileName,
  GameTileSummary,
  SelectionIndicator,
  GameTileIcon,
} from '@/app/games/create/styles';

interface SeaBattleOptions {
  variant?: string;
}

export function SeaBattleCreationConfig({
  options,
  onChange,
}: GameCreationConfigProps<SeaBattleOptions>) {
  const { t } = useTranslation();

  // Initialize default variant
  useEffect(() => {
    if (!options.variant) {
      onChange({ ...options, variant: 'classic' });
    }
  }, [options, onChange]);

  return (
    <Section title={t('games.create.sectionVariant') || 'Game Theme'}>
      <GameSelector>
        {SEA_BATTLE_VARIANTS.map((variant) => (
          <GameTile
            key={variant.id}
            as="button"
            type="button"
            $active={options.variant === variant.id}
            onClick={() => onChange({ ...options, variant: variant.id })}
          >
            <SelectionIndicator />
            <GameTileIcon $gradient={variant.gradient}>
              {variant.emoji}
            </GameTileIcon>
            <GameTileName>{variant.name}</GameTileName>
            <GameTileSummary>{variant.description}</GameTileSummary>
          </GameTile>
        ))}
      </GameSelector>
    </Section>
  );
}

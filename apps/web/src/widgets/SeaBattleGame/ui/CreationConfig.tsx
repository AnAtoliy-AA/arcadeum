import { useEffect } from 'react';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { GameCreationConfigProps } from '@/features/games/types';
import { SEA_BATTLE_VARIANTS } from '@/widgets/SeaBattleGame/lib/constants';
import { gamesApi } from '@/features/games/api';
import type { CatalogVariant } from '@/features/games/api';
import { Section } from '@arcadeum/ui/components/Section/Section';
import { Button } from '@arcadeum/ui/components/Button/Button';
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

export default function SeaBattleCreationConfig({
  options,
  onChange,
}: GameCreationConfigProps<SeaBattleOptions>) {
  const { t } = useTranslation();
  const [showRules, setShowRules] = useState(false);
  const [allowedVariants, setAllowedVariants] = useState<
    CatalogVariant[] | null
  >(null);

  // One-shot catalog fetch on mount to filter the variant picker by what
  // the caller's role can actually see (ARC-710). Failure is silent: the
  // full list is shown and the BE will reject any restricted creation.
  useEffect(() => {
    let cancelled = false;
    gamesApi
      .getCatalog()
      .then((res) => {
        if (cancelled) return;
        const entry = res.games.find((g) => g.gameId === 'sea_battle_v1');
        setAllowedVariants(entry?.variants ?? null);
      })
      .catch(() => {
        if (!cancelled) setAllowedVariants(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleVariants =
    allowedVariants === null
      ? SEA_BATTLE_VARIANTS
      : SEA_BATTLE_VARIANTS.filter((v) =>
          allowedVariants.some((a) => a.id === v.id),
        );

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
          {visibleVariants.map((variant) => (
            <GameTileContainer
              key={variant.id}
              onClick={() => onChange({ ...options, variant: variant.id })}
            >
              <GameTileItem active={options.variant === variant.id}>
                <SelectionIndicator active={options.variant === variant.id} />
                <GameTileIcon
                  background={variant.gradient || undefined}
                  className={variant.gradient ? 'text-gradient' : undefined}
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

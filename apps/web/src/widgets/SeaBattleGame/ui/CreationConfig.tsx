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
  ComingSoonBadge,
  ExpansionGrid,
  ExpansionCheckbox,
  ExpansionLabel,
  ExpansionBadge,
} from '@/features/games/ui/create/styles';
import { RulesModal } from './RulesModal';
import { useState } from 'react';
import { YStack, XStack, Text } from 'tamagui';

interface SeaBattleOptions {
  variant?: string;
  gridSize?: number;
  shipCount?: number;
  specialWeapons?: { sonar?: boolean; radar?: boolean };
}

const GRID_SIZES = [
  { value: 10, label: '10×10', description: 'Standard' },
  { value: 15, label: '15×15', description: 'Large' },
  { value: 20, label: '20×20', description: 'Huge' },
] as const;

export default function SeaBattleCreationConfig({
  options,
  onChange,
}: GameCreationConfigProps<SeaBattleOptions>) {
  const { t } = useTranslation();
  const [showRules, setShowRules] = useState(false);
  const [allowedVariants, setAllowedVariants] = useState<
    CatalogVariant[] | null
  >(null);

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
      ? SEA_BATTLE_VARIANTS.map((v) => ({ ...v, comingSoon: false }))
      : SEA_BATTLE_VARIANTS.filter((v) =>
          allowedVariants.some((a) => a.id === v.id),
        ).map((v) => ({
          ...v,
          comingSoon:
            allowedVariants.find((a) => a.id === v.id)?.comingSoon ?? false,
        }));

  useEffect(() => {
    if (!options.variant) {
      onChange({ ...options, variant: 'classic' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.variant]);

  const handleUpdate = (updates: Partial<SeaBattleOptions>) => {
    onChange({ ...options, ...updates });
  };

  return (
    <>
      <Section title={t('games.create.sectionVariant') || 'Game Theme'}>
        <ThemeHeader>
          <Button
            variant="link"
            size="sm"
            mb="$4"
            type="button"
            color="$accent"
            onClick={() => setShowRules(true)}
          >
            📖 {t('games.rules.button') || 'View Game Rules'}
          </Button>
        </ThemeHeader>
        <GameSelector>
          {visibleVariants.map((variant) => {
            const isComingSoon = variant.comingSoon;
            return (
              <GameTileContainer
                key={variant.id}
                data-testid={`variant-tile-${variant.id}`}
                aria-disabled={isComingSoon || undefined}
                disabled={isComingSoon}
                onClick={() =>
                  !isComingSoon && handleUpdate({ variant: variant.id })
                }
              >
                <GameTileItem
                  active={options.variant === variant.id}
                  disabled={isComingSoon}
                >
                  {!isComingSoon && (
                    <SelectionIndicator
                      active={options.variant === variant.id}
                    />
                  )}
                  {isComingSoon && (
                    <ComingSoonBadge data-testid="coming-soon-badge">
                      {t('games.create.comingSoon') || 'Coming Soon'}
                    </ComingSoonBadge>
                  )}
                  <GameTileIcon
                    background={variant.gradient || undefined}
                    className={variant.gradient ? 'text-gradient' : undefined}
                  >
                    {variant.emoji}
                  </GameTileIcon>
                  <GameTileName>
                    {t(variant.name as TranslationKey)}
                  </GameTileName>
                  <GameTileSummary>
                    {t(variant.description as TranslationKey)}
                  </GameTileSummary>
                </GameTileItem>
              </GameTileContainer>
            );
          })}
        </GameSelector>
      </Section>

      <Section title={t('games.create.sectionHouseRules')}>
        <YStack gap="$3">
          <YStack gap="$1">
            <Text fontSize="$4" fontWeight="600">
              {t('games.create.seaBattleGridSize') || 'Grid Size'}
            </Text>
            <XStack gap="$2" flexWrap="wrap">
              {GRID_SIZES.map((gs) => (
                <Button
                  key={gs.value}
                  variant="secondary"
                  size="sm"
                  isActive={(options.gridSize ?? 10) === gs.value}
                  onClick={() => handleUpdate({ gridSize: gs.value })}
                  data-testid={`grid-size-${gs.value}`}
                >
                  {gs.label}
                </Button>
              ))}
            </XStack>
          </YStack>

          <ExpansionGrid>
            <ExpansionCheckbox>
              <input
                type="checkbox"
                checked={!!options.specialWeapons?.sonar}
                onChange={() =>
                  handleUpdate({
                    specialWeapons: {
                      ...options.specialWeapons,
                      sonar: !options.specialWeapons?.sonar,
                    },
                  })
                }
              />
              <YStack flex={1} gap="$0.5">
                <ExpansionLabel>
                  {t('games.create.seaBattleSonar') || 'Sonar'}
                </ExpansionLabel>
                <ExpansionBadge>
                  {t('games.create.seaBattleSonarHint') ||
                    'Reveal ship locations'}
                </ExpansionBadge>
              </YStack>
            </ExpansionCheckbox>

            <ExpansionCheckbox>
              <input
                type="checkbox"
                checked={!!options.specialWeapons?.radar}
                onChange={() =>
                  handleUpdate({
                    specialWeapons: {
                      ...options.specialWeapons,
                      radar: !options.specialWeapons?.radar,
                    },
                  })
                }
              />
              <YStack flex={1} gap="$0.5">
                <ExpansionLabel>
                  {t('games.create.seaBattleRadar') || 'Radar'}
                </ExpansionLabel>
                <ExpansionBadge>
                  {t('games.create.seaBattleRadarHint') ||
                    'Scan a row or column'}
                </ExpansionBadge>
              </YStack>
            </ExpansionCheckbox>
          </ExpansionGrid>
        </YStack>
      </Section>

      <RulesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        t={t}
      />
    </>
  );
}

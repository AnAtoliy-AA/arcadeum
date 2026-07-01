import { useEffect } from 'react';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { GameCreationConfigProps } from '@/features/games/types';
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
import { CASCADE_VARIANTS } from '../lib/constants';

interface CascadeOptions {
  variant?: string;
  options?: {
    mode?: string;
    lastCardCallEnabled?: boolean;
    handLimit?: number;
  };
}

export default function CascadeCreationConfig({
  options,
  onChange,
}: GameCreationConfigProps<CascadeOptions>) {
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
        const entry = res.games.find((g) => g.gameId === 'cascade_v1');
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
      ? CASCADE_VARIANTS.map((v) => ({ ...v, comingSoon: false }))
      : CASCADE_VARIANTS.filter((v) =>
          allowedVariants.some((a) => a.id === v.id),
        ).map((v) => ({
          ...v,
          comingSoon:
            allowedVariants.find((a) => a.id === v.id)?.comingSoon ?? false,
        }));

  useEffect(() => {
    if (!options.variant) {
      onChange({ ...options, variant: 'cosmic' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.variant]);

  const handleUpdate = (updates: Partial<CascadeOptions>) => {
    onChange({ ...options, ...updates });
  };

  const handleOptionsUpdate = (
    optionUpdates: Partial<NonNullable<CascadeOptions['options']>>,
  ) => {
    handleUpdate({
      options: { ...options.options, ...optionUpdates },
    });
  };

  const currentMode = options.options?.mode ?? 'classic';

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
              {t('games.create.cascadeMode') || 'Game Mode'}
            </Text>
            <XStack gap="$2" flexWrap="wrap">
              {(['classic', 'pure', 'speed'] as const).map((mode) => (
                <Button
                  key={mode}
                  variant="secondary"
                  size="sm"
                  isActive={currentMode === mode}
                  onClick={() => handleOptionsUpdate({ mode })}
                  data-testid={`cascade-mode-${mode}`}
                >
                  {mode === 'classic'
                    ? t('games.create.cascadeModeClassic') || 'Classic'
                    : mode === 'pure'
                      ? t('games.create.cascadeModePure') || 'Pure'
                      : t('games.create.cascadeModeSpeed') || 'Speed'}
                </Button>
              ))}
            </XStack>
            <Text fontSize="$3" color="$colorSecondary">
              {currentMode === 'pure'
                ? t('games.create.cascadeModePureHint') ||
                  'No stacking — draw cards resolve immediately'
                : currentMode === 'speed'
                  ? t('games.create.cascadeModeSpeedHint') ||
                    'Stacking enabled with per-turn timer'
                  : t('games.create.cascadeModeClassicHint') ||
                    'Full ruleset with stacking'}
            </Text>
          </YStack>

          <ExpansionGrid>
            <ExpansionCheckbox>
              <input
                type="checkbox"
                checked={options.options?.lastCardCallEnabled !== false}
                onChange={() =>
                  handleOptionsUpdate({
                    lastCardCallEnabled:
                      options.options?.lastCardCallEnabled !== false
                        ? false
                        : true,
                  })
                }
              />
              <YStack flex={1} gap="$0.5">
                <ExpansionLabel>
                  {t('games.create.cascadeLastCardCall') ||
                    'Last-Card Cascade Call'}
                </ExpansionLabel>
                <ExpansionBadge>
                  {t('games.create.cascadeLastCardCallHint') ||
                    'Race to call when at 1 card'}
                </ExpansionBadge>
              </YStack>
            </ExpansionCheckbox>
          </ExpansionGrid>
        </YStack>
      </Section>

      <RulesModal open={showRules} onClose={() => setShowRules(false)} />
    </>
  );
}

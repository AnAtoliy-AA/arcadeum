import { useState, useEffect } from 'react';
import { useTranslation, TranslationKey } from '@/shared/lib/useTranslation';
import { GameCreationConfigProps } from '@/features/games/types';
import {
  ExpansionId,
  CARD_VARIANTS,
} from '@/features/games/ui/create/constants';
import { gamesApi } from '@/features/games/api';
import type { CatalogVariant } from '@/features/games/api';
import { ExpansionPacksSection } from '@/features/games/ui/create/ExpansionPacksSection';
import { RulesModal } from '@/widgets/CriticalGame/ui/RulesModal';
import { IDLE_TIMER_DURATION_SEC } from '@/shared/config/game';
import { Section } from '@arcadeum/ui/components/Section/Section';
import { Button } from '@arcadeum/ui/components/Button/Button';
import {
  GameSelector,
  GameTileName,
  GameTileSummary,
  SelectionIndicator,
  GameTileIcon,
  ExpansionGrid,
  ExpansionCheckbox,
  ExpansionLabel,
  ExpansionBadge,
  ComingSoonBadge,
  ThemeHeader,
  GameTileItem,
  GameTileContainer,
} from '@/features/games/ui/create/styles';
import { YStack } from 'tamagui';

interface CriticalGameOptions {
  cardVariant?: string;
  expansions?: ExpansionId[];
  customCards?: Record<string, number>;
  allowActionCardCombos?: boolean;
  idleTimerEnabled?: boolean;
}

export default function CriticalCreationConfig({
  options,
  onChange,
}: GameCreationConfigProps<CriticalGameOptions>) {
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
        const entry = res.games.find((g) => g.gameId === 'critical_v1');
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
      ? CARD_VARIANTS.map((v) => ({ ...v, comingSoon: false }))
      : CARD_VARIANTS.filter((v) =>
          allowedVariants.some((a) => a.id === v.id),
        ).map((v) => ({
          ...v,
          comingSoon:
            allowedVariants.find((a) => a.id === v.id)?.comingSoon ?? false,
        }));

  // Initialize defaults if empty
  useEffect(() => {
    if (!options.cardVariant) {
      onChange({
        ...options,
        cardVariant: 'cyberpunk',
        expansions: options.expansions || [],
        customCards: options.customCards || {},
        allowActionCardCombos: options.allowActionCardCombos || false,
        idleTimerEnabled: options.idleTimerEnabled || false,
      });
    }
    // Only run when cardVariant is truly missing to avoid re-triggering parent URL sync
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.cardVariant]);

  const handleUpdate = (updates: Partial<CriticalGameOptions>) => {
    onChange({ ...options, ...updates });
  };

  return (
    <>
      <ExpansionPacksSection
        expansions={options.expansions || []}
        customCards={options.customCards || {}}
        onExpansionsChange={(val) => handleUpdate({ expansions: val })}
        onCustomCardsChange={(val) => handleUpdate({ customCards: val })}
      />

      <Section title={t('games.create.sectionVariant') || 'Game Theme'}>
        <ThemeHeader>
          <Button
            variant="link"
            size="sm"
            mb="$4"
            type="button"
            onClick={() => setShowRules(true)}
            data-testid="view-rules-button"
          >
            📖 {t('games.rules.button') || 'View Game Rules'}
          </Button>
        </ThemeHeader>
        <GameSelector>
          {visibleVariants.map((variant) => {
            const isComingSoon = variant.comingSoon;
            const isDisabled = variant.disabled || isComingSoon;
            return (
              <GameTileContainer
                key={variant.id}
                data-testid={`variant-tile-${variant.id}`}
                aria-disabled={isDisabled || undefined}
                disabled={isDisabled}
                onClick={() =>
                  !isDisabled && handleUpdate({ cardVariant: variant.id })
                }
              >
                <GameTileItem
                  active={options.cardVariant === variant.id}
                  disabled={isDisabled}
                >
                  {!isDisabled && (
                    <SelectionIndicator
                      active={options.cardVariant === variant.id}
                    />
                  )}
                  {isDisabled && (
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
        <ExpansionGrid>
          <ExpansionCheckbox>
            <input
              type="checkbox"
              checked={!!options.allowActionCardCombos}
              onChange={() =>
                handleUpdate({
                  allowActionCardCombos: !options.allowActionCardCombos,
                })
              }
            />
            <YStack flex={1} gap="$0.5">
              <ExpansionLabel>
                {t('games.create.houseRuleActionCardCombos')}
              </ExpansionLabel>
              <ExpansionBadge>
                {t('games.create.houseRuleActionCardCombosHint')}
              </ExpansionBadge>
            </YStack>
          </ExpansionCheckbox>

          <ExpansionCheckbox>
            <input
              type="checkbox"
              checked={!!options.idleTimerEnabled}
              onChange={() =>
                handleUpdate({ idleTimerEnabled: !options.idleTimerEnabled })
              }
            />
            <YStack flex={1} gap="$0.5">
              <ExpansionLabel>
                {t('games.create.houseRuleIdleTimer') || 'Idle Timer Autoplay'}
              </ExpansionLabel>
              <ExpansionBadge>
                {t('games.create.houseRuleIdleTimerHint', {
                  seconds: String(IDLE_TIMER_DURATION_SEC),
                }) || 'Automated play after 15s'}
              </ExpansionBadge>
            </YStack>
          </ExpansionCheckbox>
        </ExpansionGrid>
      </Section>

      <RulesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        currentVariant={options.cardVariant || 'cyberpunk'}
        isFastMode={!!options.idleTimerEnabled}
        isPrivate={false} // This props might need to be passed down if important
        t={t}
      />
    </>
  );
}

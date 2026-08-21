import { useState, useEffect } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { GameCreationConfigProps } from '@/features/games/types';
import {
  ExpansionId,
  CARD_VARIANTS,
} from '@/features/games/ui/create/constants';
import { gamesApi } from '@/features/games/api';
import type { CatalogVariant } from '@/features/games/api';
import { ExpansionPacksSection } from '@/features/games/ui/create/ExpansionPacksSection';
import { RulesModal } from '@/widgets/CardGames/CriticalGame/ui/RulesModal';
import { IDLE_TIMER_DURATION_SEC } from '@/shared/config/game';
import { Section } from '@arcadeum/ui/components/Section/Section';
import { Button } from '@arcadeum/ui/components/Button/Button';
import { GameThemePicker } from '@/features/games/ui/GameThemePicker';
import {
  ExpansionGrid,
  ExpansionCheckbox,
  ExpansionLabel,
  ExpansionBadge,
} from '@/features/games/ui/create/styles';

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

  const pickerOptions = CARD_VARIANTS.map((variant) => ({
    id: variant.id,
    nameKey: variant.name,
    descriptionKey: variant.description,
    emoji: variant.emoji,
    gradient: variant.gradient,
    comingSoon: allowedVariants?.find((a) => a.id === variant.id)?.comingSoon,
    disabled: variant.disabled,
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
        <Button
          variant="link"
          size="sm"
          type="button"
          className="mb-4 text-[var(--accent)]"
          onClick={() => setShowRules(true)}
          data-testid="view-rules-button"
        >
          📖 {t('games.rules.button') || 'View Game Rules'}
        </Button>
        <GameThemePicker
          selectedTheme={options.cardVariant || 'cyberpunk'}
          onSelect={(id) => handleUpdate({ cardVariant: id })}
          options={pickerOptions}
          allowedThemes={allowedVariants?.map((a) => a.id)}
        />
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
            <div className="flex flex-col items-stretch flex-1">
              <ExpansionLabel>
                {t('games.create.houseRuleActionCardCombos')}
              </ExpansionLabel>
              <ExpansionBadge>
                {t('games.create.houseRuleActionCardCombosHint')}
              </ExpansionBadge>
            </div>
          </ExpansionCheckbox>

          <ExpansionCheckbox>
            <input
              type="checkbox"
              checked={!!options.idleTimerEnabled}
              onChange={() =>
                handleUpdate({ idleTimerEnabled: !options.idleTimerEnabled })
              }
            />
            <div className="flex flex-col items-stretch flex-1">
              <ExpansionLabel>
                {t('games.create.houseRuleIdleTimer') || 'Idle Timer Autoplay'}
              </ExpansionLabel>
              <ExpansionBadge>
                {t('games.create.houseRuleIdleTimerHint', {
                  seconds: String(IDLE_TIMER_DURATION_SEC),
                }) || 'Automated play after 15s'}
              </ExpansionBadge>
            </div>
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

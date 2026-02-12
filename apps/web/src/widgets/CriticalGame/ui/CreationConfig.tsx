import { useState, useEffect } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { GameCreationConfigProps } from '@/features/games/types';
import { ExpansionId, CARD_VARIANTS } from '@/app/games/create/constants';
import { ExpansionPacksSection } from '@/app/games/create/ExpansionPacksSection';
import { RulesModal } from '@/widgets/CriticalGame/ui/RulesModal';
import { IDLE_TIMER_DURATION_SEC } from '@/shared/config/game';
import { Section } from '@/shared/ui';
import {
  GameSelector,
  GameTile,
  GameTileName,
  GameTileSummary,
  SelectionIndicator,
  GameTileIcon,
  ExpansionGrid,
  ExpansionCheckbox,
  ExpansionLabel,
  ExpansionBadge,
  ComingSoonBadge,
  RulesTrigger,
  ThemeHeader,
} from '@/app/games/create/styles';

interface CriticalGameOptions {
  cardVariant?: string;
  expansions?: ExpansionId[];
  customCards?: Record<string, number>;
  allowActionCardCombos?: boolean;
  idleTimerEnabled?: boolean;
}

export function CriticalCreationConfig({
  options,
  onChange,
}: GameCreationConfigProps<CriticalGameOptions>) {
  const { t } = useTranslation();
  const [showRules, setShowRules] = useState(false);

  // Initialize defaults if empty
  useEffect(() => {
    if (!options.cardVariant) {
      onChange({
        cardVariant: 'cyberpunk',
        expansions: [],
        customCards: {},
        allowActionCardCombos: false,
        idleTimerEnabled: false,
        ...options,
      });
    }
  }, [options, onChange]);

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
          <RulesTrigger type="button" onClick={() => setShowRules(true)}>
            📖 {t('games.rules.button') || 'View Game Rules'}
          </RulesTrigger>
        </ThemeHeader>
        <GameSelector>
          {CARD_VARIANTS.map((variant) => (
            <GameTile
              key={variant.id}
              as="button"
              type="button"
              $active={options.cardVariant === variant.id}
              disabled={variant.disabled}
              onClick={() =>
                !variant.disabled && handleUpdate({ cardVariant: variant.id })
              }
            >
              {!variant.disabled && <SelectionIndicator />}
              {variant.disabled && (
                <ComingSoonBadge>
                  {t('games.create.comingSoon') || 'Coming Soon'}
                </ComingSoonBadge>
              )}
              <GameTileIcon $gradient={variant.gradient}>
                {variant.emoji}
              </GameTileIcon>
              <GameTileName>{variant.name}</GameTileName>
              <GameTileSummary>{variant.description}</GameTileSummary>
            </GameTile>
          ))}
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
            <ExpansionLabel>
              {t('games.create.houseRuleActionCardCombos')}
            </ExpansionLabel>
            <ExpansionBadge>
              {t('games.create.houseRuleActionCardCombosHint')}
            </ExpansionBadge>
          </ExpansionCheckbox>

          <ExpansionCheckbox>
            <input
              type="checkbox"
              checked={!!options.idleTimerEnabled}
              onChange={() =>
                handleUpdate({ idleTimerEnabled: !options.idleTimerEnabled })
              }
            />
            <ExpansionLabel>
              {t('games.create.houseRuleIdleTimer') || 'Idle Timer Autoplay'}
            </ExpansionLabel>
            <ExpansionBadge>
              {t('games.create.houseRuleIdleTimerHint', {
                seconds: String(IDLE_TIMER_DURATION_SEC),
              }) || 'Automated play after 15s'}
            </ExpansionBadge>
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

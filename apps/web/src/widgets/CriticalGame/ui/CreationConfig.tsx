import { useState, useEffect } from 'react';
import { useTranslation, TranslationKey } from '@/shared/lib/useTranslation';
import { GameCreationConfigProps } from '@/features/games/types';
import {
  ExpansionId,
  CARD_VARIANTS,
} from '@/features/games/ui/create/constants';
import { ExpansionPacksSection } from '@/features/games/ui/create/ExpansionPacksSection';
import { RulesModal } from '@/widgets/CriticalGame/ui/RulesModal';
import { IDLE_TIMER_DURATION_SEC } from '@/shared/config/game';
import { Section, Button } from '@/shared/ui';
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
  getGameTileStyle,
  gameTileCSS,
  GAME_TILE_CLASS,
  GAME_TILE_ICON_CLASS,
} from '@/features/games/ui/create/styles';

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
      <style>{gameTileCSS}</style>
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
          >
            📖 {t('games.rules.button') || 'View Game Rules'}
          </Button>
        </ThemeHeader>
        <GameSelector>
          {CARD_VARIANTS.map((variant) => (
            <button
              key={variant.id}
              type="button"
              className={`${GAME_TILE_CLASS}${options.cardVariant === variant.id ? ' active' : ''}`}
              style={getGameTileStyle(
                options.cardVariant === variant.id,
                variant.disabled,
              )}
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

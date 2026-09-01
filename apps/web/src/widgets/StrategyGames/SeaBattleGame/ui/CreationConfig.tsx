import { useEffect, useState } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { GameCreationConfigProps } from '@/features/games/types';
import { SEA_BATTLE_THEMES } from '@/widgets/StrategyGames/SeaBattleGame/lib/constants';
import {
  getDefaultShipCount,
  getShipCountOptions,
} from '@/widgets/StrategyGames/SeaBattleGame/types';
import { gamesApi } from '@/features/games/api';
import type { CatalogVariant } from '@/features/games/api';
import { Section } from '@arcadeum/ui/components/Section/Section';
import { Button } from '@arcadeum/ui/components/Button/Button';
import { GameThemePicker } from '@/features/games/ui/GameThemePicker';
import { ComingSoonBadge } from '@/features/games/ui/create/styles';
import { RulesModal } from './RulesModal';

interface SeaBattleOptions {
  variant?: string;
  gridSize?: number;
  shipCount?: number;
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
  const [ruleComingSoon, setRuleComingSoon] = useState<Map<string, boolean>>(
    new Map(),
  );

  useEffect(() => {
    let cancelled = false;
    gamesApi
      .getCatalog()
      .then((res) => {
        if (cancelled) return;
        const entry = res.games.find((g) => g.gameId === 'sea_battle_v1');
        setAllowedVariants(entry?.variants ?? null);
        if (entry?.rules) {
          const map = new Map<string, boolean>();
          for (const r of entry.rules) {
            map.set(r.ruleId, r.comingSoon);
          }
          setRuleComingSoon(map);
        }
      })
      .catch(() => {
        if (!cancelled) setAllowedVariants(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const pickerOptions = SEA_BATTLE_THEMES.map((variant) => ({
    id: variant.id,
    nameKey: variant.name,
    descriptionKey: variant.description,
    emoji: variant.emoji,
    gradient: variant.gradient,
    comingSoon: allowedVariants?.find((a) => a.id === variant.id)?.comingSoon,
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
        <Button
          variant="link"
          size="sm"
          type="button"
          className="mb-4 text-[var(--accent)]"
          onClick={() => setShowRules(true)}
        >
          📖 {t('games.rules.button') || 'View Game Rules'}
        </Button>
        <GameThemePicker
          selectedTheme={options.variant || 'classic'}
          onSelect={(id) => handleUpdate({ variant: id })}
          options={pickerOptions}
          allowedThemes={allowedVariants?.map((a) => a.id)}
        />
      </Section>

      <Section title={t('games.create.sectionHouseRules')}>
        <div className="flex flex-col items-stretch gap-3">
          <div className="flex flex-col items-stretch gap-1">
            <div className="flex flex-row items-center gap-2">
              <span className="text-[18px] font-semibold">
                {t('games.create.seaBattleGridSize') || 'Grid Size'}
              </span>
              {ruleComingSoon.get('gridSize') && (
                <ComingSoonBadge>
                  {t('games.create.comingSoon') || 'Coming Soon'}
                </ComingSoonBadge>
              )}
            </div>
            <div className="flex flex-row items-stretch gap-2 flex-wrap">
              {GRID_SIZES.map((gs) => (
                <Button
                  key={gs.value}
                  variant="secondary"
                  size="sm"
                  active={(options.gridSize ?? 10) === gs.value}
                  disabled={!!ruleComingSoon.get('gridSize')}
                  onClick={() =>
                    !ruleComingSoon.get('gridSize') &&
                    handleUpdate({
                      gridSize: gs.value,
                      shipCount: getDefaultShipCount(gs.value),
                    })
                  }
                  data-testid={`grid-size-${gs.value}`}
                >
                  {gs.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-1">
            <div className="flex flex-row items-center gap-2">
              <span className="text-[18px] font-semibold">
                {t('games.create.seaBattleShipCount') || 'Number of Ships'}
              </span>
            </div>
            <div className="flex flex-row items-stretch gap-2 flex-wrap">
              {getShipCountOptions(options.gridSize ?? 10).map((count) => (
                <Button
                  key={count}
                  variant="secondary"
                  size="sm"
                  active={
                    (options.shipCount ??
                      getDefaultShipCount(options.gridSize ?? 10)) === count
                  }
                  onClick={() => handleUpdate({ shipCount: count })}
                  data-testid={`ship-count-${count}`}
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <RulesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        t={t}
      />
    </>
  );
}

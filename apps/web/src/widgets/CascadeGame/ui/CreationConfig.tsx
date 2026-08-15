import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { GameCreationConfigProps } from '@/features/games/types';
import { Section } from '@arcadeum/ui/components/Section/Section';
import { Button } from '@arcadeum/ui/components/Button/Button';

interface CascadeOptions {
  variant?: string;
  mode?: string;
  lastCardCallEnabled?: boolean;
  handLimit?: number;
}

const MODES = [
  {
    id: 'classic',
    nameKey: 'games.create.cascadeModeClassic' as TranslationKey,
    descKey: 'games.create.cascadeModeClassicHint' as TranslationKey,
  },
  {
    id: 'pure',
    nameKey: 'games.create.cascadeModePure' as TranslationKey,
    descKey: 'games.create.cascadeModePureHint' as TranslationKey,
  },
  {
    id: 'speed',
    nameKey: 'games.create.cascadeModeSpeed' as TranslationKey,
    descKey: 'games.create.cascadeModeSpeedHint' as TranslationKey,
  },
] as const;

export default function CascadeCreationConfig({
  options,
  onChange,
}: GameCreationConfigProps<CascadeOptions>) {
  const { t } = useTranslation();

  const handleUpdate = (updates: Partial<CascadeOptions>) => {
    onChange({ ...options, ...updates });
  };

  return (
    <Section title={t('games.create.sectionHouseRules')}>
      <div className="box-border flex flex-col items-stretch gap-3">
        <div className="box-border flex flex-col items-stretch gap-1">
          <span className="box-border text-[18px] font-semibold">
            {t('games.create.cascadeMode')}
          </span>
          <div className="box-border flex flex-row items-stretch gap-2 flex-wrap">
            {MODES.map((mode) => (
              <Button
                key={mode.id}
                variant="secondary"
                size="sm"
                active={(options.mode ?? 'classic') === mode.id}
                onClick={() => handleUpdate({ mode: mode.id })}
                data-testid={`cascade-mode-${mode.id}`}
              >
                {t(mode.nameKey)}
              </Button>
            ))}
          </div>
        </div>

        <div className="box-border flex flex-col items-stretch gap-1">
          <span className="box-border text-[18px] font-semibold">
            {t('games.create.cascadeLastCardCall')}
          </span>
          <span className="box-border text-[16px] text-[rgba(180,_180,_200,_0.7)]">
            {t('games.create.cascadeLastCardCallHint')}
          </span>
          <Button
            variant="secondary"
            size="sm"
            active={options.lastCardCallEnabled !== false}
            onClick={() =>
              handleUpdate({
                lastCardCallEnabled:
                  options.lastCardCallEnabled === false ? true : false,
              })
            }
            data-testid="cascade-last-card-call"
          >
            {options.lastCardCallEnabled !== false ? 'ON' : 'OFF'}
          </Button>
        </div>
      </div>
    </Section>
  );
}

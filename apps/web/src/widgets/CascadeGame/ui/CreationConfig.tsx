import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { GameCreationConfigProps } from '@/features/games/types';
import { Section } from '@arcadeum/ui/components/Section/Section';
import { Button } from '@arcadeum/ui/components/Button/Button';
import { YStack, XStack, Text } from 'tamagui';

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
      <YStack gap="$3">
        <YStack gap="$1">
          <Text fontSize="$4" fontWeight="600">
            {t('games.create.cascadeMode')}
          </Text>
          <XStack gap="$2" flexWrap="wrap">
            {MODES.map((mode) => (
              <Button
                key={mode.id}
                variant="secondary"
                size="sm"
                isActive={(options.mode ?? 'classic') === mode.id}
                onClick={() => handleUpdate({ mode: mode.id })}
                data-testid={`cascade-mode-${mode.id}`}
              >
                {t(mode.nameKey)}
              </Button>
            ))}
          </XStack>
        </YStack>

        <YStack gap="$1">
          <Text fontSize="$4" fontWeight="600">
            {t('games.create.cascadeLastCardCall')}
          </Text>
          <Text fontSize="$3" color="$colorMuted">
            {t('games.create.cascadeLastCardCallHint')}
          </Text>
          <Button
            variant="secondary"
            size="sm"
            isActive={options.lastCardCallEnabled !== false}
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
        </YStack>
      </YStack>
    </Section>
  );
}

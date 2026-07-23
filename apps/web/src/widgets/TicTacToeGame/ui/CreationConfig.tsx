import { useTranslation } from '@/shared/lib/useTranslation';
import { GameCreationConfigProps } from '@/features/games/types';
import { Section } from '@arcadeum/ui/components/Section/Section';
import { Button } from '@arcadeum/ui/components/Button/Button';
import { YStack, XStack, Text } from 'tamagui';

interface TicTacToeOptions {
  variant?: string;
  boardSize?: number | string;
  teamMode?: boolean;
  expansionMargin?: number;
  infinityWinLength?: number;
}

const BOARD_SIZES = [
  { value: 3, label: '3×3', winLength: 3 },
  { value: 5, label: '5×5', winLength: 4 },
  { value: 7, label: '7×7', winLength: 5 },
  { value: 9, label: '9×9', winLength: 5 },
  { value: 'infinity', label: '∞ Infinity', winLength: 5 },
] as const;

const MARGIN_OPTIONS = [1, 2, 3] as const;
const WIN_LENGTH_OPTIONS = [4, 5] as const;

export default function TicTacToeCreationConfig({
  options,
  onChange,
}: GameCreationConfigProps<TicTacToeOptions>) {
  const { t } = useTranslation();

  const handleUpdate = (updates: Partial<TicTacToeOptions>) => {
    onChange({ ...options, ...updates });
  };

  const isInfinity = options.boardSize === 'infinity';

  return (
    <Section title={t('games.create.sectionHouseRules')}>
      <YStack gap="$3">
        <YStack gap="$1">
          <Text fontSize="$4" fontWeight="600">
            {t('games.create.tttBoardSize')}
          </Text>
          <XStack gap="$2" flexWrap="wrap">
            {BOARD_SIZES.map((bs) => (
              <Button
                key={bs.value}
                variant="secondary"
                size="sm"
                isActive={(options.boardSize ?? 3) === bs.value}
                onClick={() => handleUpdate({ boardSize: bs.value })}
                data-testid={`board-size-${bs.value}`}
              >
                {bs.label}
              </Button>
            ))}
          </XStack>
        </YStack>

        {isInfinity && (
          <YStack
            gap="$3"
            padding="$3"
            backgroundColor="rgba(99,102,241,0.08)"
            borderRadius={10}
          >
            <YStack gap="$1">
              <Text fontSize="$3" fontWeight="600">
                {t('games.tic_tac_toe_v1.lobby.expansionMargin')}
              </Text>
              <XStack gap="$2" flexWrap="wrap">
                {MARGIN_OPTIONS.map((margin) => (
                  <Button
                    key={margin}
                    variant="secondary"
                    size="sm"
                    isActive={(options.expansionMargin ?? 3) === margin}
                    onClick={() => handleUpdate({ expansionMargin: margin })}
                    data-testid={`expansion-margin-${margin}`}
                  >
                    {margin}
                  </Button>
                ))}
              </XStack>
            </YStack>

            <YStack gap="$1">
              <Text fontSize="$3" fontWeight="600">
                {t('games.tic_tac_toe_v1.lobby.winCondition')}
              </Text>
              <XStack gap="$2" flexWrap="wrap">
                {WIN_LENGTH_OPTIONS.map((winLen) => (
                  <Button
                    key={winLen}
                    variant="secondary"
                    size="sm"
                    isActive={(options.infinityWinLength ?? 5) === winLen}
                    onClick={() => handleUpdate({ infinityWinLength: winLen })}
                    data-testid={`infinity-win-length-${winLen}`}
                  >
                    {t('games.tic_tac_toe_v1.lobby.inARow', {
                      n: String(winLen),
                    })}
                  </Button>
                ))}
              </XStack>
            </YStack>
          </YStack>
        )}
      </YStack>
    </Section>
  );
}

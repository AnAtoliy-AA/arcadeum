import { useTranslation } from '@/shared/lib/useTranslation';
import { GameCreationConfigProps } from '@/features/games/types';
import { Section } from '@arcadeum/ui/components/Section/Section';
import { Button } from '@arcadeum/ui/components/Button/Button';
import { YStack, XStack, Text } from 'tamagui';

interface TicTacToeOptions {
  variant?: string;
  boardSize?: number;
  teamMode?: boolean;
}

const BOARD_SIZES = [
  { value: 3, label: '3×3', winLength: 3 },
  { value: 5, label: '5×5', winLength: 4 },
  { value: 7, label: '7×7', winLength: 5 },
  { value: 9, label: '9×9', winLength: 5 },
] as const;

export default function TicTacToeCreationConfig({
  options,
  onChange,
}: GameCreationConfigProps<TicTacToeOptions>) {
  const { t } = useTranslation();

  const handleUpdate = (updates: Partial<TicTacToeOptions>) => {
    onChange({ ...options, ...updates });
  };

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
      </YStack>
    </Section>
  );
}

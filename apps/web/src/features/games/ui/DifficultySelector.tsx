'use client';

import { XStack } from 'tamagui';
import { Button } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { BotCountSelector, BotCountLabel } from './lobbyStyles';

export type BotDifficulty = 'easy' | 'medium' | 'hard';

interface DifficultySelectorProps {
  value: BotDifficulty;
  onChange: (difficulty: BotDifficulty) => void;
}

const DIFFICULTY_OPTIONS: BotDifficulty[] = ['easy', 'medium', 'hard'];

export function DifficultySelector({
  value,
  onChange,
}: DifficultySelectorProps) {
  const { t } = useTranslation();

  const labels: Record<BotDifficulty, string> = {
    easy: t('games.lobby.difficultyEasy'),
    medium: t('games.lobby.difficultyMedium'),
    hard: t('games.lobby.difficultyHard'),
  };

  return (
    <BotCountSelector>
      <BotCountLabel>{t('games.lobby.difficultyLabel')}</BotCountLabel>
      <XStack gap="$2">
        {DIFFICULTY_OPTIONS.map((diff) => {
          const isActive = value === diff;
          return (
            <Button
              key={diff}
              variant="chip"
              size="sm"
              data-active={isActive}
              overflow="hidden"
              backgroundColor={
                isActive
                  ? 'rgba(99, 102, 241, 0.2)'
                  : 'rgba(255, 255, 255, 0.05)'
              }
              borderColor={
                isActive
                  ? 'rgba(99, 102, 241, 0.5)'
                  : 'rgba(255, 255, 255, 0.1)'
              }
              color={isActive ? '#6366f1' : '$color'}
              hoverStyle={{
                backgroundColor: isActive
                  ? 'rgba(99, 102, 241, 0.25)'
                  : 'rgba(255, 255, 255, 0.1)',
              }}
              borderRadius={8}
              fontWeight="600"
              onClick={() => onChange(diff)}
            >
              {labels[diff]}
            </Button>
          );
        })}
      </XStack>
    </BotCountSelector>
  );
}

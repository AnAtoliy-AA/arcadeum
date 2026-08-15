'use client';

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
      <div className="flex flex-row items-stretch gap-2">
        {DIFFICULTY_OPTIONS.map((diff) => {
          const isActive = value === diff;
          return (
            <Button
              className={`overflow-hidden rounded-[8px] font-semibold ${
                isActive
                  ? 'bg-[rgba(99,102,241,0.2)] border-[rgba(99,102,241,0.5)] text-[#6366f1] hover:bg-[rgba(99,102,241,0.25)]'
                  : 'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[var(--color)] hover:bg-[rgba(255,255,255,0.1)]'
              }`}
              key={diff}
              variant="chip"
              size="sm"
              data-active={isActive ? 'on' : undefined}
              onClick={() => onChange(diff)}
            >
              {labels[diff]}
            </Button>
          );
        })}
      </div>
    </BotCountSelector>
  );
}

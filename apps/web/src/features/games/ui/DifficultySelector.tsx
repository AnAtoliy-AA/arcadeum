'use client';

import { useTranslation } from '@/shared/i18n/useTranslation';
import { BotCountSelector, BotCountLabel } from './lobbyStyles';

export type BotDifficulty =
  | 'beginner'
  | 'easy'
  | 'intermediate'
  | 'medium'
  | 'advanced'
  | 'strong'
  | 'hard'
  | 'master'
  | 'expert';

interface DifficultySelectorProps {
  value: BotDifficulty;
  onChange: (difficulty: BotDifficulty) => void;
}

const DIFFICULTY_OPTIONS: BotDifficulty[] = [
  'beginner',
  'easy',
  'intermediate',
  'medium',
  'advanced',
  'strong',
  'hard',
  'master',
  'expert',
];

export function DifficultySelector({
  value,
  onChange,
}: DifficultySelectorProps) {
  const { t } = useTranslation();

  const labels: Record<BotDifficulty, string> = {
    beginner: t('games.lobby.difficultyBeginner') ?? 'Beginner',
    easy: t('games.lobby.difficultyEasy'),
    intermediate: t('games.lobby.difficultyIntermediate') ?? 'Intermediate',
    medium: t('games.lobby.difficultyMedium'),
    advanced: t('games.lobby.difficultyAdvanced') ?? 'Advanced',
    strong: t('games.lobby.difficultyStrong') ?? 'Strong',
    hard: t('games.lobby.difficultyHard'),
    master: t('games.lobby.difficultyMaster') ?? 'Master',
    expert: t('games.lobby.difficultyExpert'),
  };

  return (
    <BotCountSelector>
      <BotCountLabel>{t('games.lobby.difficultyLabel')}</BotCountLabel>
      <select
        aria-label="Bot Difficulty"
        value={value}
        onChange={(e) => onChange(e.target.value as BotDifficulty)}
        className="rounded-[8px] border border-[var(--glassBorder)] bg-[var(--glassBg)] px-3 py-1.5 text-sm font-semibold text-[var(--color)] hover:bg-[var(--glassBgHover)] focus:border-[rgba(99,102,241,0.5)] focus:outline-none"
      >
        {DIFFICULTY_OPTIONS.map((diff) => (
          <option key={diff} value={diff}>
            {labels[diff]}
          </option>
        ))}
      </select>
    </BotCountSelector>
  );
}

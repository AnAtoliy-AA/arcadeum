'use client';

import { useState } from 'react';
import type { ButtonProps } from '@arcadeum/ui';
import { QuickplayButton } from '@/features/games/ui/QuickplayButton';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { loadStoredSettings } from '@/shared/lib/settings-storage';
import type { TranslationKey } from '@/shared/i18n/useTranslation';
import type { StoredSettings } from '@/shared/lib/settings-storage';

type BotLevel = NonNullable<StoredSettings['aiDifficulty']>;

const BOT_LEVELS: readonly BotLevel[] = ['easy', 'medium', 'hard', 'expert'];

const LEVEL_KEYS: Record<BotLevel, TranslationKey> = {
  easy: 'games.landing.botLevelEasy',
  medium: 'games.landing.botLevelMedium',
  hard: 'games.landing.botLevelHard',
  expert: 'games.landing.botLevelExpert',
};

interface GameBotPlayProps {
  gameId: string;
  theme?: string;
  /** Override for the button label (defaults to "Play vs bot"). */
  label?: string;
  errorLabel?: string;
  size?: ButtonProps['size'];
  disabled?: boolean;
  /** Variant of the button (defaults to secondary). */
  buttonVariant?: ButtonProps['variant'];
}

/** "Play vs bot" action with a bot difficulty picker, shared by landing CTAs. */
export function GameBotPlay({
  gameId,
  theme,
  label,
  errorLabel,
  size = 'md',
  disabled = false,
  buttonVariant = 'secondary',
}: GameBotPlayProps) {
  const { t } = useTranslation();
  const [level, setLevel] = useState<BotLevel>(
    () => loadStoredSettings().aiDifficulty ?? 'medium',
  );

  return (
    <div
      className="box-border flex flex-col gap-3 sm:flex-row sm:items-center"
      data-testid="game-bot-play"
    >
      <QuickplayButton
        gameId={gameId}
        label={label ?? t('games.landing.playVsBot')}
        mode="ai"
        theme={theme}
        size={size}
        errorLabel={errorLabel}
        buttonVariant={buttonVariant}
        disabled={disabled}
        difficulty={level}
      />
      <div
        role="radiogroup"
        aria-label={t('games.landing.botLevel')}
        data-testid="game-bot-level"
        className="box-border inline-flex w-full sm:w-auto items-center gap-1 rounded-xl border border-[var(--borderColor)] bg-[var(--surfaceBg)] p-1"
      >
        {BOT_LEVELS.map((value) => {
          const active = value === level;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => setLevel(value)}
              className={`box-border flex-1 sm:flex-none min-h-11 px-3 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer motion-safe:transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[var(--primary)] ${
                active
                  ? 'bg-[var(--primary)] text-[var(--primaryText)] shadow-sm'
                  : 'text-[var(--foreground)] hover:bg-[var(--primary)]/10'
              }`}
            >
              {t(LEVEL_KEYS[value])}
            </button>
          );
        })}
      </div>
    </div>
  );
}

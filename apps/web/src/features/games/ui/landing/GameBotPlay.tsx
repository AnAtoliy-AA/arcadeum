'use client';

import { useState } from 'react';
import { Select } from '@arcadeum/ui';
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

function isBotLevel(value: string): value is BotLevel {
  return (BOT_LEVELS as readonly string[]).includes(value);
}

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

  const options = BOT_LEVELS.map((value) => ({
    value,
    label: t(LEVEL_KEYS[value]),
  }));

  return (
    <div
      className="box-border inline-flex flex-wrap items-center gap-2"
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
      <Select
        size="sm"
        value={level}
        options={options}
        disabled={disabled}
        aria-label={t('games.landing.botLevel')}
        data-testid="game-bot-level"
        onValueChange={(next) => {
          if (isBotLevel(next)) setLevel(next);
        }}
      />
    </div>
  );
}

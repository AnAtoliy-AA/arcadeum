'use client';

import type { ButtonProps } from '@arcadeum/ui';
import { QuickplayButton } from '@/features/games/ui/QuickplayButton';

interface Props {
  gameId: string;
  ctaQuickplay?: string;
  ctaQuickplayError?: string;
  ctaPlayHuman?: string;
  ctaPlayHumanError?: string;
  /** Preselected shared theme id (e.g. `cyberpunk`) sent to the room. */
  theme?: string;
  size?: ButtonProps['size'];
  disabled?: boolean;
}

export function QuickplayCta({
  gameId,
  ctaQuickplay,
  ctaQuickplayError,
  ctaPlayHuman,
  ctaPlayHumanError,
  theme,
  size,
  disabled = false,
}: Props) {
  return (
    <>
      <QuickplayButton
        gameId={gameId}
        label={ctaPlayHuman ?? 'Find Opponent'}
        mode="human"
        theme={theme}
        size={size}
        errorLabel={ctaPlayHumanError ?? ctaQuickplayError}
        disabled={disabled}
      />
      {ctaQuickplay ? (
        <QuickplayButton
          gameId={gameId}
          label={ctaQuickplay}
          mode="ai"
          theme={theme}
          size={size}
          errorLabel={ctaQuickplayError}
          buttonVariant="secondary"
          disabled={disabled}
        />
      ) : null}
    </>
  );
}

'use client';

import { QuickplayButton } from '@/features/games/ui/QuickplayButton';

interface Props {
  gameId: string;
  ctaQuickplay: string;
  ctaQuickplayError: string;
  ctaPlayHuman?: string;
  ctaPlayHumanError?: string;
  disabled?: boolean;
}

export function QuickplayCta({
  gameId,
  ctaQuickplay,
  ctaQuickplayError,
  ctaPlayHuman,
  ctaPlayHumanError,
  disabled = false,
}: Props) {
  return (
    <>
      <QuickplayButton
        gameId={gameId}
        label={ctaQuickplay}
        mode="ai"
        errorLabel={ctaQuickplayError}
        disabled={disabled}
      />
      {ctaPlayHuman ? (
        <QuickplayButton
          gameId={gameId}
          label={ctaPlayHuman}
          mode="human"
          buttonVariant="secondary"
          errorLabel={ctaPlayHumanError ?? ctaQuickplayError}
          disabled={disabled}
        />
      ) : null}
    </>
  );
}

'use client';

import { QuickplayButton } from '@/features/games/ui/QuickplayButton';

interface Props {
  gameId: string;
  ctaQuickplay: string;
  ctaQuickplayError: string;
  ctaPlayHuman?: string;
  ctaPlayHumanError?: string;
}

export function QuickplayCta({
  gameId,
  ctaQuickplay,
  ctaQuickplayError,
  ctaPlayHuman,
  ctaPlayHumanError,
}: Props) {
  return (
    <>
      <QuickplayButton
        gameId={gameId}
        label={ctaQuickplay}
        mode="ai"
        errorLabel={ctaQuickplayError}
      />
      {ctaPlayHuman ? (
        <QuickplayButton
          gameId={gameId}
          label={ctaPlayHuman}
          mode="human"
          buttonVariant="secondary"
          errorLabel={ctaPlayHumanError ?? ctaQuickplayError}
        />
      ) : null}
    </>
  );
}

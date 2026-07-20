'use client';

import { QuickplayButton } from '@/features/games/ui/QuickplayButton';

interface Props {
  gameId: string;
  ctaQuickplay: string;
  ctaQuickplayError: string;
}

export function QuickplayCta({
  gameId,
  ctaQuickplay,
  ctaQuickplayError,
}: Props) {
  return (
    <QuickplayButton
      gameId={gameId}
      label={ctaQuickplay}
      mode="ai"
      errorLabel={ctaQuickplayError}
    />
  );
}

import { QuickplayButton } from '@/features/games/ui/QuickplayButton';

interface Props {
  gameId: string;
  ctaQuickplay: string;
  ctaQuickplayError: string;
  ctaPlayHuman?: string;
  ctaPlayHumanError?: string;
  /** Preselected shared theme id (e.g. `cyberpunk`) sent to the room. */
  theme?: string;
  disabled?: boolean;
}

export function QuickplayCta({
  gameId,
  ctaQuickplay,
  ctaQuickplayError,
  ctaPlayHuman,
  ctaPlayHumanError,
  theme,
  disabled = false,
}: Props) {
  return (
    <>
      <QuickplayButton
        gameId={gameId}
        label={ctaQuickplay}
        mode="ai"
        theme={theme}
        errorLabel={ctaQuickplayError}
        disabled={disabled}
      />
      {ctaPlayHuman ? (
        <QuickplayButton
          gameId={gameId}
          label={ctaPlayHuman}
          mode="human"
          theme={theme}
          buttonVariant="secondary"
          errorLabel={ctaPlayHumanError ?? ctaQuickplayError}
          disabled={disabled}
        />
      ) : null}
    </>
  );
}

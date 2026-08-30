import { SeaBattleThemeProvider } from '@/widgets/StrategyGames/SeaBattleGame/lib/SeaBattleThemeContext';
import { SeaBattleThemePreview } from '@/widgets/StrategyGames/SeaBattleGame/ui/SeaBattleThemePreview';
import { GameLandingPreview } from '@/features/games/ui/landing/GameLandingPreview';

interface Props {
  themeNames?: Partial<Record<string, string>>;
  label?: string;
  cycleHint?: string;
  cycleAriaLabel?: string;
}

export function SeaBattleLandingBoard({
  themeNames,
  label,
  cycleHint,
  cycleAriaLabel,
}: Props = {}) {
  return (
    <GameLandingPreview
      themeNames={themeNames}
      label={label}
      cycleHint={cycleHint}
      cycleAriaLabel={cycleAriaLabel}
      testId="sea-battle-landing-board"
      render={(themeId) => (
        <SeaBattleThemeProvider variant={themeId}>
          <SeaBattleThemePreview selectedVariant={themeId} cellSize={20} />
        </SeaBattleThemeProvider>
      )}
    />
  );
}

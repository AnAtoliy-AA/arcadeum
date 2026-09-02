'use client';

import { SeaBattleThemeProvider } from '@/widgets/StrategyGames/SeaBattleGame/lib/SeaBattleThemeContext';
import { SeaBattleThemePreview } from '@/widgets/StrategyGames/SeaBattleGame/ui/SeaBattleThemePreview';
import { GameLandingPreview } from '@/features/games/ui/landing/GameLandingPreview';
import '@/widgets/StrategyGames/SeaBattleGame/ui/styles/sea-battle.scss';

interface Props {
  themeNames?: Partial<Record<string, string>>;
  label?: string;
  cycleHint?: string;
  cycleAriaLabel?: string;
}

export function BattleshipLandingBoard({
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
      testId="battleship-landing-board"
      render={(themeId) => (
        <SeaBattleThemeProvider variant={themeId}>
          <SeaBattleThemePreview selectedVariant={themeId} />
        </SeaBattleThemeProvider>
      )}
    />
  );
}

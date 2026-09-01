'use client';

import { SeaBattleThemeProvider } from '@/widgets/StrategyGames/SeaBattleGame/lib/SeaBattleThemeContext';
import { SeaBattleThemePreview } from '@/widgets/StrategyGames/SeaBattleGame/ui/SeaBattleThemePreview';

interface Props {
  themeId: string;
  cellSize?: number;
  background?: string;
  padding?: number;
}

export default function SeaBattleRealPreview({ themeId, cellSize }: Props) {
  return (
    <SeaBattleThemeProvider variant={themeId}>
      <div className="w-full h-full flex items-start justify-start overflow-hidden p-1.5">
        <SeaBattleThemePreview selectedVariant={themeId} cellSize={cellSize} />
      </div>
    </SeaBattleThemeProvider>
  );
}

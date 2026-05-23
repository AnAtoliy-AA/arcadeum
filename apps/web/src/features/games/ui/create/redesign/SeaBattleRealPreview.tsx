'use client';

import { SeaBattleThemeProvider } from '@/widgets/SeaBattleGame/lib/SeaBattleThemeContext';
import { SeaBattleThemePreview } from '@/widgets/SeaBattleGame/ui/SeaBattleThemePreview';

interface Props {
  themeId: string;
  cellSize: number;
  background?: string;
  padding?: number;
}

// Client-only wrapper around the real Tamagui-rendered Sea Battle board.
// Consumers `dynamic({ ssr: false })` import this so the heavy Tamagui
// atomic styles never appear in the SSR HTML — that mismatch is what
// triggers React hydration errors when the component is rendered eagerly
// from a 'use client' parent.
export default function SeaBattleRealPreview({
  themeId,
  cellSize,
  background,
  padding = 6,
}: Props) {
  return (
    <SeaBattleThemeProvider variant={themeId}>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          background,
          padding,
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <SeaBattleThemePreview selectedVariant={themeId} cellSize={cellSize} />
      </div>
    </SeaBattleThemeProvider>
  );
}

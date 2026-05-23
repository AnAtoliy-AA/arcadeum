'use client';

import { useMemo } from 'react';
import { SeaBattleThemeProvider } from '@/widgets/SeaBattleGame/lib/SeaBattleThemeContext';
import { SeaBattleThemePreview } from '@/widgets/SeaBattleGame/ui/SeaBattleThemePreview';
import { HandCard } from '@/widgets/CriticalGame/ui/hand/HandCard';
import { handWithUids } from '@/widgets/CriticalGame/lib/combo';
import type { CriticalCard } from '@/widgets/CriticalGame/types';
import { GameArt } from './art/GameArt';
import { CriticalCardPoster } from './art/CriticalCardPoster';
import { findCriticalTheme, type GameId } from './data/themes';
import { useSpriteLoaded } from './useSpriteLoaded';

interface Props {
  gameId: GameId;
  themeId: string;
}

const FEATURED_CRITICAL_CARDS: CriticalCard[] = [
  'critical_event',
  'neutralizer',
  'strike',
];

// Render the preview-rail artwork using the actual game widgets so the user
// sees real Critical card art for the chosen variant and the real Sea Battle
// board for the chosen palette. Glimworm falls back to the SVG poster.
export function RailPreviewArt({ gameId, themeId }: Props) {
  if (gameId === 'sea_battle_v1') {
    return (
      <SeaBattleThemeProvider variant={themeId}>
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12,
            boxSizing: 'border-box',
          }}
        >
          <SeaBattleThemePreview selectedVariant={themeId} cellSize={22} />
        </div>
      </SeaBattleThemeProvider>
    );
  }

  if (gameId === 'critical_v1') {
    return <CriticalCardCluster themeId={themeId} />;
  }

  return <GameArt gameId={gameId} themeId={themeId} size="lg" />;
}

function CriticalCardCluster({ themeId }: { themeId: string }) {
  // Three cards fanned out: a left ghost, a centered featured card, a right
  // ghost. Reuses the real HandCard so each card shows the variant's actual
  // sprite art (or the role fallback glyph when art is missing). The SVG
  // poster shows while the sprite sheet is loading, then crossfades into the
  // real cards once the image is ready.
  const cards = useMemo(() => handWithUids(FEATURED_CRITICAL_CARDS), []);
  const [leftCard, centerCard, rightCard] = cards;
  const theme = findCriticalTheme(themeId);
  const { url, isLoaded } = useSpriteLoaded(themeId);
  const showReal = !!url && isLoaded;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: showReal ? 0 : 1,
          transition: 'opacity 0.3s ease',
        }}
      >
        <CriticalCardPoster theme={theme} size="lg" />
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: showReal ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: showReal ? 'auto' : 'none',
        }}
      >
        <RealCardCluster
          leftCard={leftCard}
          centerCard={centerCard}
          rightCard={rightCard}
          themeId={themeId}
        />
      </div>
    </div>
  );
}

interface ClusterCardsProps {
  leftCard: ReturnType<typeof handWithUids>[number];
  centerCard: ReturnType<typeof handWithUids>[number];
  rightCard: ReturnType<typeof handWithUids>[number];
  themeId: string;
}

function RealCardCluster({
  leftCard,
  centerCard,
  rightCard,
  themeId,
}: ClusterCardsProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          transform: 'translateX(-72px) translateY(8px) rotate(-12deg)',
          opacity: 0.55,
          filter: 'blur(0.3px)',
        }}
      >
        <HandCard
          card={leftCard}
          isSelected={false}
          disabled
          cardVariant={themeId}
          showName={false}
          showDescription={false}
          onToggle={() => {}}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          transform: 'translateX(72px) translateY(8px) rotate(12deg)',
          opacity: 0.55,
          filter: 'blur(0.3px)',
        }}
      >
        <HandCard
          card={rightCard}
          isSelected={false}
          disabled
          cardVariant={themeId}
          showName={false}
          showDescription={false}
          onToggle={() => {}}
        />
      </div>
      <div
        style={{
          position: 'relative',
          transform: 'rotate(-2deg)',
          zIndex: 1,
        }}
      >
        <HandCard
          card={centerCard}
          isSelected={false}
          disabled
          cardVariant={themeId}
          showName
          showDescription={false}
          onToggle={() => {}}
        />
      </div>
    </div>
  );
}

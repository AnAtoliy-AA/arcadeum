'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { handWithUids } from '@/widgets/CriticalGame/lib/combo';
import type { CriticalCard } from '@/widgets/CriticalGame/types';
import { GameArt } from './art/GameArt';
import { CriticalCardPoster } from './art/CriticalCardPoster';
import { SeaBattleBoardPoster } from './art/SeaBattleBoardPoster';
import {
  findCriticalTheme,
  findSeaBattleTheme,
  type GameId,
} from './data/themes';
import { useSpriteLoaded } from './useSpriteLoaded';

const SeaBattleRealPreview = dynamic(() => import('./SeaBattleRealPreview'), {
  ssr: false,
});

const CriticalCardClusterReal = dynamic(
  () => import('./CriticalCardClusterReal'),
  { ssr: false },
);

interface Props {
  gameId: GameId;
  themeId: string;
}

// Five-card fan: two outer ghosts, two inner ghosts, one centered featured
// card. Order is rendered left→right so we can position them with a single
// transform per slot below.
const FEATURED_CRITICAL_CARDS: CriticalCard[] = [
  'evade',
  'neutralizer',
  'critical_event',
  'strike',
  'trade',
];

// Render the preview-rail artwork using the actual game widgets so the user
// sees real Critical card art for the chosen variant and the real Sea Battle
// board for the chosen palette. Glimworm falls back to the SVG poster.
export function RailPreviewArt({ gameId, themeId }: Props) {
  if (gameId === 'sea_battle_v1') {
    return <SeaBattleRail themeId={themeId} />;
  }

  if (gameId === 'critical_v1') {
    return <CriticalCardCluster themeId={themeId} />;
  }

  return <GameArt gameId={gameId} themeId={themeId} size="lg" />;
}

// SSR-safe Sea Battle rail preview: the SVG poster renders both on the
// server and during the first client paint; the real Tamagui-rendered board
// overlays it once the dynamic chunk lands on the client.
function SeaBattleRail({ themeId }: { themeId: string }) {
  const resolved = findSeaBattleTheme(themeId);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <SeaBattleBoardPoster theme={resolved} size="lg" />
      <div style={{ position: 'absolute', inset: 0 }}>
        <SeaBattleRealPreview
          themeId={themeId}
          cellSize={22}
          padding={12}
          background={resolved.palette.bg}
        />
      </div>
    </div>
  );
}

function CriticalCardCluster({ themeId }: { themeId: string }) {
  // Five-card fan, all real `<HandCard>` so each card shows the variant's
  // actual sprite art (or the role fallback glyph when art is missing). The
  // SVG poster shows while the sprite sheet is loading, then crossfades into
  // the real cards once the image is ready.
  const cards = useMemo(() => handWithUids(FEATURED_CRITICAL_CARDS), []);
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
        <CriticalCardClusterReal cards={cards} themeId={themeId} />
      </div>
    </div>
  );
}

'use client';

import { useMemo, type CSSProperties } from 'react';
import { SeaBattleThemeProvider } from '@/widgets/SeaBattleGame/lib/SeaBattleThemeContext';
import { SeaBattleThemePreview } from '@/widgets/SeaBattleGame/ui/SeaBattleThemePreview';
import { HandCard } from '@/widgets/CriticalGame/ui/hand/HandCard';
import { handWithUids } from '@/widgets/CriticalGame/lib/combo';
import type { CriticalCard } from '@/widgets/CriticalGame/types';
import s from './GameCreateView.module.css';
import { GameArt } from './art/GameArt';
import { CriticalCardPoster } from './art/CriticalCardPoster';
import { findCriticalTheme, type GameId } from './data/themes';
import { useSpriteLoaded } from './useSpriteLoaded';

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
    // Full Sea Battle board — cellSize tuned so the 10×10 grid plus row/col
    // labels fits the rail without clipping the bottom row or the column
    // letters. Anchored top-left so the A–J letters and 1–10 numbers sit
    // flush against the corner instead of floating in dead space.
    return (
      <SeaBattleThemeProvider variant={themeId}>
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
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
        <RealCardCluster cards={cards} themeId={themeId} />
      </div>
    </div>
  );
}

interface ClusterCardsProps {
  cards: ReturnType<typeof handWithUids>;
  themeId: string;
}

// Five-card fan, left→right. Outer two are dimmed/blurred ghosts, inner two
// are partially dimmed, center card is the hero.
const FAN_SLOTS = [
  { x: -116, y: 18, rotate: -18, opacity: 0.45, scale: 0.78, z: 0 },
  { x: -62, y: 6, rotate: -10, opacity: 0.7, scale: 0.86, z: 1 },
  { x: 0, y: 0, rotate: -1, opacity: 1, scale: 0.95, z: 2 },
  { x: 62, y: 6, rotate: 10, opacity: 0.7, scale: 0.86, z: 1 },
  { x: 116, y: 18, rotate: 18, opacity: 0.45, scale: 0.78, z: 0 },
] as const;

function RealCardCluster({ cards, themeId }: ClusterCardsProps) {
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
      {cards.map((card, i) => {
        const slot = FAN_SLOTS[i] ?? FAN_SLOTS[0];
        const isHero = i === 2;
        // Drive the per-card position/rotation through CSS variables so the
        // `.fanCard:hover` rule in the module CSS can lift the hovered card
        // (the same gesture as the home-hero card stack) without losing the
        // card's resting rotation / scale.
        const slotStyle: CSSProperties = {
          ['--fan-x' as string]: `${slot.x}px`,
          ['--fan-y' as string]: `${slot.y}px`,
          ['--fan-rotate' as string]: `${slot.rotate}deg`,
          ['--fan-scale' as string]: String(slot.scale),
          ['--fan-opacity' as string]: String(slot.opacity),
          ['--fan-z' as string]: String(slot.z),
          ['--fan-filter' as string]: isHero ? 'none' : 'blur(0.4px)',
        };
        return (
          <div key={card.uid} className={s.fanCard} style={slotStyle}>
            <HandCard
              card={card}
              isSelected={false}
              disabled
              cardVariant={themeId}
              showName={isHero}
              showDescription={false}
              onToggle={() => {}}
            />
          </div>
        );
      })}
    </div>
  );
}

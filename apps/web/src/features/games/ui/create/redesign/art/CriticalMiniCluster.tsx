'use client';

import {
  CardImage,
  hasArtFor,
} from '@/widgets/CriticalGame/ui/styles/card-image';
import type { CriticalCard } from '@/widgets/CriticalGame/types';
import { useSpriteLoaded } from '../useSpriteLoaded';
import { CriticalCardPoster } from './CriticalCardPoster';
import { findCriticalTheme } from '../data/themes';

interface Props {
  themeId: string;
  // Card width in px. The aspect ratio (3:4-ish) is fixed by the source art.
  cardWidth?: number;
}

// Three featured cards rendered as a tight fan. Uses `<CardImage>` directly
// (no HandCard chrome) to keep the thumbnails cheap to render — important
// when many of them appear in the theme strip simultaneously.
const FEATURED: { card: CriticalCard }[] = [
  { card: 'evade' },
  { card: 'critical_event' },
  { card: 'strike' },
];

const SLOTS = [
  { x: -0.5, y: 0.06, rotate: -12, scale: 0.86, opacity: 0.7 },
  { x: 0, y: 0, rotate: -2, scale: 1, opacity: 1 },
  { x: 0.5, y: 0.06, rotate: 12, scale: 0.86, opacity: 0.7 },
] as const;

export function CriticalMiniCluster({ themeId, cardWidth = 56 }: Props) {
  const { url, isLoaded } = useSpriteLoaded(themeId);
  const theme = findCriticalTheme(themeId);
  const cardHeight = Math.round(cardWidth * 1.4);
  const showReal = !!url && isLoaded;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* SVG poster placeholder until the sprite sheet is ready */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: showReal ? 0 : 1,
          transition: 'opacity 0.25s ease',
        }}
      >
        <CriticalCardPoster theme={theme} size="sm" />
      </div>

      {/* Real card fan */}
      {url ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: showReal ? 1 : 0,
            transition: 'opacity 0.25s ease',
            background: `radial-gradient(circle at 50% 40%, ${theme.color}33 0%, ${theme.color}11 40%, transparent 70%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {FEATURED.map((entry, i) => {
            const slot = SLOTS[i];
            const cardArt = hasArtFor(themeId, entry.card);
            const tx = slot.x * cardWidth * 1.15;
            const ty = slot.y * cardHeight;
            return (
              <div
                key={entry.card}
                style={{
                  position: 'absolute',
                  width: cardWidth,
                  height: cardHeight,
                  borderRadius: Math.max(4, cardWidth * 0.1),
                  border: `1.2px solid ${theme.color}`,
                  overflow: 'hidden',
                  background: 'rgba(8, 12, 20, 0.8)',
                  boxShadow: `0 8px 22px -10px ${theme.color}aa`,
                  transform: `translate(${tx}px, ${ty}px) rotate(${slot.rotate}deg) scale(${slot.scale})`,
                  zIndex: i === 1 ? 2 : 1,
                  opacity: slot.opacity,
                }}
              >
                {cardArt ? (
                  <CardImage variant={themeId} cardType={entry.card} />
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

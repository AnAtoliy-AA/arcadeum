'use client';

import type { CSSProperties } from 'react';
import { HandCard } from '@/widgets/CriticalGame/ui/hand/HandCard';
import { handWithUids } from '@/widgets/CriticalGame/lib/combo';
import s from './GameCreateView.module.scss';

// Five-card fan, left→right. Outer two are dimmed/blurred ghosts, inner two
// are partially dimmed, center card is the hero.
const FAN_SLOTS = [
  { x: -116, y: 18, rotate: -18, opacity: 0.45, scale: 0.78, z: 0 },
  { x: -62, y: 6, rotate: -10, opacity: 0.7, scale: 0.86, z: 1 },
  { x: 0, y: 0, rotate: -1, opacity: 1, scale: 0.95, z: 2 },
  { x: 62, y: 6, rotate: 10, opacity: 0.7, scale: 0.86, z: 1 },
  { x: 116, y: 18, rotate: 18, opacity: 0.45, scale: 0.78, z: 0 },
] as const;

interface Props {
  cards: ReturnType<typeof handWithUids>;
  themeId: string;
}

// Client-only renderer for the real Critical card fan. Imported via
// `dynamic({ ssr: false })` so the Tamagui-rendered `<HandCard>`s never
// participate in SSR — that mismatch is what triggers React hydration
// warnings (Tamagui SSR emits longhand `background-image` while the client
// uses the `background` shorthand).
export default function CriticalCardClusterReal({ cards, themeId }: Props) {
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
              showName
              showDescription={false}
              onToggle={() => {}}
            />
          </div>
        );
      })}
    </div>
  );
}

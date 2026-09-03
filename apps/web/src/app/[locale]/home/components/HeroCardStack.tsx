'use client';

import React, {
  useRef,
  useState,
  useCallback,
  Children,
  isValidElement,
  cloneElement,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { useHeroBackgroundStore } from '../store/heroBackgroundStore';
import { HERO_CARD_FAN_OFFSET, HERO_GAMES } from '../data/heroVariants';

const FAN_OFFSET = HERO_CARD_FAN_OFFSET;

function indexFromPointerX(clientX: number, stack: HTMLDivElement): number {
  const rect = stack.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const dx = clientX - cx;
  if (dx < -FAN_OFFSET / 2) return 0;
  if (dx > FAN_OFFSET / 2) return 2;
  return 1;
}

type CardElement = React.ReactElement<{
  className?: string;
  style?: CSSProperties;
}>;

const ACTIVE_CLASSES =
  'hero-card-active z-[100] opacity-100 shadow-card-hover [&.hero-card-active_.hero-card-play-cta]:opacity-100 [&.hero-card-active_.hero-card-play-cta]:scale-100 [&.hero-card-active_.hero-card-shimmer]:translate-x-full motion-reduce:[&_.hero-card-play-cta]:scale-100 motion-reduce:[&_.hero-card-shimmer]:-translate-x-full motion-reduce:[&_.hero-card-shimmer]:transition-none';
const BASE_CLASSES = [
  'z-0 opacity-80',
  'z-[2] opacity-100',
  'z-[1] opacity-80',
];

export function HeroCardStack({
  children,
  playLabel: _playLabel,
}: {
  children: ReactNode;
  playLabel: string;
}) {
  const stackRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const rafRef = useRef(0);
  const setActiveGameId = useHeroBackgroundStore((s) => s.setActiveGameId);
  const reset = useHeroBackgroundStore((s) => s.reset);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const stack = stackRef.current;
      if (!stack) return;

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (!stack) return;
        const rect = stack.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;

        stack.style.setProperty('--tilt-x', `${px * 16}deg`);
        stack.style.setProperty('--tilt-y', `${-py * 16}deg`);

        const nextHovered = indexFromPointerX(e.clientX, stack);
        setHoveredIndex(nextHovered);
        const game = HERO_GAMES[nextHovered];
        if (game) setActiveGameId(game.id);
      });
    },
    [setActiveGameId],
  );

  const handlePointerLeave = useCallback(() => {
    const stack = stackRef.current;
    if (!stack) return;
    cancelAnimationFrame(rafRef.current);
    stack.style.setProperty('--tilt-x', '0deg');
    stack.style.setProperty('--tilt-y', '0deg');
    setHoveredIndex(null);
    reset();
  }, [reset]);

  return (
    <div
      ref={stackRef}
      className="hero-card-stack relative flex h-[400px] w-[280px] items-center justify-center [transform:scale(0.52)] [transform-style:preserve-3d] transition-transform duration-[250ms] ease-out motion-reduce:[transform:none] min-[481px]:w-[380px] min-[481px]:[transform:scale(0.85)] min-[481px]:mb-10 min-[481px]:mt-[60px] min-[1151px]:mb-0 min-[1151px]:mt-0 min-[1151px]:[transform:perspective(600px)_rotateX(var(--tilt-y,0deg))_rotateY(var(--tilt-x,0deg))]"
      data-testid="hero-card-stack"
      data-hovered={hoveredIndex ?? ''}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;
        const card = child as CardElement;
        const isActive = hoveredIndex === index;
        const transform = isActive
          ? `translate(var(--card-x), -22px) rotate(var(--card-rotate)) scale(1.06)`
          : `translate(var(--card-x), var(--card-y)) rotate(var(--card-rotate)) scale(var(--card-scale))`;
        return cloneElement(card, {
          className: `${card.props.className ?? ''} ${
            isActive ? ACTIVE_CLASSES : (BASE_CLASSES[index] ?? '')
          }`.trim(),
          style: {
            ...card.props.style,
            '--card-transform': transform,
          } as CSSProperties,
        });
      })}
    </div>
  );
}

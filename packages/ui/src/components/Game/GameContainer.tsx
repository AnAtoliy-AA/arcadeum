import { memo } from 'react';
import type { HTMLAttributes, ReactNode, ReactElement } from 'react';
import type { GameVariant } from '../Button/types';
import { cx } from '../../utils/cx';

export type { GameVariant };

export type GameContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: GameVariant;
};

/**
 * Per-game background colors (static tokens → hex literals).
 * Written as full string literals on purpose — Tailwind's scanner only
 * emits CSS for classes that appear verbatim in source files.
 */
const GAME_BG_CLASSES: Partial<Record<GameVariant, string>> = {
  cyberpunk: 'bg-[#0f0518]',
  underwater: 'bg-[#040b15]',
  crime: 'bg-[#18181b]',
  horror: 'bg-[#020617]',
  adventure: 'bg-[#451a03]',
  'high-altitude-hike': 'bg-[#020617]',
};

const AMBIENT_GLOW_BACKGROUNDS: Partial<Record<GameVariant, string>> = {
  cyberpunk:
    'radial-gradient(circle at 30% 30%, rgba(6, 182, 212, 0.15) 0%, transparent 35%), radial-gradient(circle at 70% 70%, rgba(192, 38, 211, 0.12) 0%, transparent 35%)',
  underwater:
    'radial-gradient(circle at 30% 30%, rgba(34, 211, 238, 0.15) 0%, transparent 40%), radial-gradient(circle at 70% 70%, rgba(236, 72, 153, 0.1) 0%, transparent 40%)',
  crime: 'radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.1) 0%, transparent 60%)',
  horror: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 60%)',
  adventure: 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.1) 0%, transparent 60%)',
  'high-altitude-hike':
    'radial-gradient(circle at 30% 30%, rgba(56, 189, 248, 0.15) 0%, transparent 40%), radial-gradient(circle at 70% 70%, rgba(248, 250, 252, 0.1) 0%, transparent 40%)',
};

function AmbientGlow({ variant }: { variant?: GameVariant }) {
  const background = variant ? AMBIENT_GLOW_BACKGROUNDS[variant] : undefined;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-[-60%] top-[-60%] z-0 h-full w-[220%] opacity-50"
      style={background ? { background } : undefined}
    />
  );
}

export const GameContainer = memo(function GameContainer({
  children,
  variant,
  className,
  style,
  ...props
}: GameContainerProps): ReactElement {
  return (
    <div
      className={cx(
        'relative flex w-full flex-1 flex-col overflow-hidden bg-[var(--background)]',
        variant ? GAME_BG_CLASSES[variant] : null,
        className,
      )}
      style={style}
      {...props}
    >
      <AmbientGlow variant={variant} />
      {children}
    </div>
  );
});

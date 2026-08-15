import './scrollbar.scss';
import React, { createContext, useContext, forwardRef, memo } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { IconButton, type GameVariant } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import type { TurnContract } from './TurnIndicator';

const WidgetFullscreenContext = createContext<boolean>(false);

export function useWidgetFullscreen(): boolean {
  return useContext(WidgetFullscreenContext);
}

export { WidgetFullscreenContext };

interface ActiveEmote {
  key: string;
  userId: string;
  emoteId: string;
}

interface ActiveEmotesContextValue {
  emotes: ActiveEmote[];
  resolveDisplayName?: (id?: string, fallback?: string) => string | undefined;
  resolveEquipped?: (id?: string | null) => {
    equippedAvatarId: string | null;
    equippedBadgeId: string | null;
    equippedNameColorId: string | null;
    equippedFrameId: string | null;
    equippedAuraId: string | null;
    equippedBannerId: string | null;
  } | null;
}

const ActiveEmotesContext = createContext<ActiveEmotesContextValue>({
  emotes: [],
});

export function useActiveEmotes(): ActiveEmotesContextValue {
  return useContext(ActiveEmotesContext);
}

export function ActiveEmotesProvider({
  value,
  children,
}: {
  value: ActiveEmotesContextValue;
  children: React.ReactNode;
}) {
  return (
    <ActiveEmotesContext.Provider value={value}>
      {children}
    </ActiveEmotesContext.Provider>
  );
}

export type ContainerProps = {
  isMyTurn?: boolean;
  isFullscreen?: boolean;
  $variant?: GameVariant;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

// Per-game ambient glow (same as @arcadeum/ui GameContainer's AmbientGlow).
const AMBIENT_GLOW_BACKGROUNDS: Partial<Record<GameVariant, string>> = {
  cyberpunk:
    'radial-gradient(circle at 30% 30%, rgba(6, 182, 212, 0.15) 0%, transparent 35%), radial-gradient(circle at 70% 70%, rgba(192, 38, 211, 0.12) 0%, transparent 35%)',
  underwater:
    'radial-gradient(circle at 30% 30%, rgba(34, 211, 238, 0.15) 0%, transparent 40%), radial-gradient(circle at 70% 70%, rgba(236, 72, 153, 0.1) 0%, transparent 40%)',
  crime:
    'radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.1) 0%, transparent 60%)',
  horror:
    'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 60%)',
  adventure:
    'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.1) 0%, transparent 60%)',
  'high-altitude-hike':
    'radial-gradient(circle at 30% 30%, rgba(56, 189, 248, 0.15) 0%, transparent 40%), radial-gradient(circle at 70% 70%, rgba(248, 250, 252, 0.1) 0%, transparent 40%)',
};

export const Container = memo(
  forwardRef<HTMLDivElement, ContainerProps>(function Container(
    {
      isMyTurn = false,
      isFullscreen = false,
      $variant,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) {
    const glowBackground = $variant
      ? AMBIENT_GLOW_BACKGROUNDS[$variant]
      : undefined;

    return (
      <div
        ref={ref}
        className={cx(
          'box-border flex flex-col flex-1 w-full overflow-y-auto overflow-x-hidden bg-[var(--background)]',
          'modern-scrollbar gap-5 px-1 pt-0 pb-0 min-h-0 h-auto min-w-0',
          isFullscreen
            ? 'fixed inset-0 w-screen h-screen max-w-screen max-h-screen rounded-none bg-[#151718] z-[1100] px-1 pt-0'
            : 'relative rounded-[24px]',
          'max-[800px]:px-2 max-[800px]:pt-0 max-[800px]:pb-0 max-[800px]:rounded-[16px]',
          isMyTurn
            ? 'border-2 border-[rgba(34,197,94,0.8)] shadow-[0_0_30px_rgba(34,197,94,0.4)]'
            : 'border border-[var(--glassBorder)]',
          className,
        )}
        style={style}
        {...props}
      >
        {glowBackground && (
          <div
            aria-hidden
            className="pointer-events-none absolute left-[-60%] top-[-60%] z-0 h-full w-[220%] opacity-50"
            style={{ background: glowBackground }}
          />
        )}
        {children}
      </div>
    );
  }),
);

export const GameHeader = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'box-border flex flex-row items-center justify-between gap-3 px-7 py-2 bg-[var(--glassBg)] backdrop-blur-[16px] border-b border-b-[var(--glassBorder)] -mx-1 mt-0 sticky top-0 z-[30] shrink-0 max-[800px]:px-4 max-[800px]:py-2 max-[800px]:-mx-2 max-[800px]:mt-0 max-[800px]:top-0 max-[800px]:gap-1 max-[800px]:flex-nowrap',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const GameInfo = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'box-border flex flex-row items-center gap-2 min-w-0 flex-1 relative max-[800px]:min-w-0 max-[800px]:flex-1',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const VariantIconBadge = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'box-border flex flex-col items-center justify-center w-[30px] h-[30px] rounded-[8px] bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] shrink-0 max-[800px]:w-6 max-[800px]:h-6',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const GameTitle = ({
  numberOfLines,
  className,
  children,
  ...props
}: {
  numberOfLines?: number;
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cx(
      'box-border text-[16px] font-extrabold tracking-[-0.3px] max-[800px]:text-[13px]',
      numberOfLines ? 'line-clamp-1' : 'truncate',
      className,
    )}
    {...props}
  >
    {children}
  </span>
);

export type TurnStatusVariant =
  'completed' | 'yourTurn' | 'waiting' | 'default';

const TURN_PILL_CLASSES: Record<TurnStatusVariant, string> = {
  yourTurn: 'bg-[rgba(16,185,129,0.12)] border-[rgba(16,185,129,0.4)]',
  waiting: 'bg-[rgba(234,179,8,0.1)] border-[rgba(234,179,8,0.35)]',
  completed: 'bg-[rgba(148,163,184,0.1)] border-[rgba(148,163,184,0.25)]',
  default: 'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)]',
};

const TURN_TEXT_CLASSES: Record<TurnStatusVariant, string> = {
  yourTurn: 'text-[var(--success)]',
  waiting: 'text-[var(--warning)]',
  completed: 'text-[var(--secondary)]',
  default: 'text-[var(--color)] opacity-[0.7]',
};

function tokenSpacingClass(
  value: string | undefined,
  prefix: 'gap' | 'pl',
): string | undefined {
  if (!value) return undefined;
  const match = /^\$(\d+)$/.exec(value);
  return match ? `${prefix}-${match[1]}` : undefined;
}

export const TurnStatusPill = ({
  $status = 'default',
  gap,
  paddingLeft,
  className,
  children,
  ...props
}: {
  $status?: TurnStatusVariant;
  gap?: string;
  paddingLeft?: string;
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'box-border flex flex-row items-center rounded-[20px] px-3 py-1 border shrink-0',
      TURN_PILL_CLASSES[$status],
      tokenSpacingClass(gap, 'gap'),
      tokenSpacingClass(paddingLeft, 'pl'),
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const TurnStatusText = ({
  $status = 'default',
  className,
  children,
  ...props
}: {
  $status?: TurnStatusVariant;
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cx(
      'box-border text-[14px] font-semibold',
      TURN_TEXT_CLASSES[$status],
      className,
    )}
    {...props}
  >
    {children}
  </span>
);

export const HeaderActions = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'box-border flex flex-row items-center gap-2 flex-wrap justify-end',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const FullscreenButton = (
  props: React.ComponentProps<typeof IconButton>,
) => (
  <IconButton
    className="p-2 active:bg-[rgba(255,255,255,0.2)]"
    size="sm"
    {...props}
  />
);

export const SharedGameBoard = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'box-border flex flex-col items-stretch gap-4 z-[20] relative w-full flex-1 min-h-0 min-w-0 overflow-visible max-[800px]:p-2',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const SharedTableArea = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'box-border flex flex-col items-stretch gap-4 min-h-0 relative z-[1] w-full grow-0 shrink-0 basis-auto h-auto',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const SharedHandSection = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'box-border flex flex-col items-stretch gap-4 w-full shrink-0 z-[30] relative border-t border-t-[var(--borderColor)] pt-4',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export interface SharedHeaderProps {
  variantEmoji: string;
  title: string;
  subtitle?: string;
  turn?: TurnContract;
  turnStatusVariant?: TurnStatusVariant;
  turnStatusText?: string;
  turnAvatar?: React.ReactNode;
  extraActions?: React.ReactNode;
  titleGradient?: string;
}

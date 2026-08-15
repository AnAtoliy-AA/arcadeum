import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
export {
  Button,
  type ButtonProps,
  BotCountButton,
  DeleteButton,
  StartButton,
  IconButton,
  RefreshButton,
} from '@arcadeum/ui';

// Layout
export const LobbyContent = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'flex flex-row items-start gap-5 flex-1 min-h-0 p-5 pb-[96px] overflow-y-auto overflow-x-hidden max-[1023px]:flex-col max-[1023px]:flex-1 max-[1023px]:min-h-0 max-[1023px]:overflow-y-visible max-[1023px]:overflow-x-hidden max-[1023px]:p-3 max-[1023px]:pb-[96px] max-[1023px]:gap-4 max-[1023px]:items-stretch',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

// Main Center Section
export const CenterSection = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'flex flex-col items-center justify-center gap-5 flex-1 min-h-full max-[1023px]:flex-[0] max-[1023px]:min-h-[unset] max-[1023px]:w-full max-[1023px]:justify-start max-[1023px]:gap-4 max-[800px]:flex-[0] max-[800px]:min-h-[unset] max-[800px]:justify-start',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const GameIcon = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cx(
      'text-[80px] leading-[96px] [filter:drop-shadow(0_8px_24px_rgba(99,102,241,0.3))] max-[800px]:text-[60px] max-[800px]:leading-[72px]',
      className,
    )}
    {...props}
  >
    {children}
  </span>
);

export const LobbyTitle = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={cx('text-[32px] font-bold text-center', className)} {...props}>
    {children}
  </h2>
);

export const LobbyEmptyText = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cx(
      'text-[16px] text-[rgba(180,180,200,0.7)] text-center pt-5 leading-[1]',
      className,
    )}
    {...props}
  >
    {children}
  </span>
);

export const LobbySubtitle = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cx(
      'text-[18px] text-[var(--textSecondary)] text-center max-w-[400px]',
      className,
    )}
    {...props}
  >
    {children}
  </p>
);

// Room Name Badge
export const RoomNameBadge = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'flex flex-row items-center gap-2 py-2 px-4 bg-[rgba(16,185,129,0.12)] border border-[rgba(16,185,129,0.2)] rounded-[20px] max-w-full overflow-hidden',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const RoomNameIcon = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLSpanElement>) => (
  <span className={cx('text-[18px] inline-flex', className)} {...props}>
    {children}
  </span>
);

export const RoomNameText = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cx(
      'text-[20px] font-semibold text-[var(--color)] overflow-hidden truncate',
      className,
    )}
    {...props}
  >
    {children}
  </span>
);

// Progress Bar
export const ProgressWrapper = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'flex flex-col items-stretch w-full max-w-[300px]',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const ProgressLabel = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'flex flex-row items-stretch justify-between mb-2',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const ProgressBar = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'flex flex-col items-stretch h-2 bg-[rgba(99,102,241,0.15)] rounded-[4px] overflow-hidden',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const ProgressFill = ({
  width,
  className,
  ...props
}: {
  width?: string | number;
  className?: string;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx('h-full rounded-[4px] bg-[#6366f1]', className)}
    style={width !== undefined ? { width } : undefined}
    {...props}
  />
);

// Host Controls
export const HostControls = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'flex flex-col items-center gap-4 p-5 bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.2)] rounded-[16px]',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const HostLabel = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cx(
      'text-[11px] font-semibold uppercase tracking-[1px] text-[#6366f1]',
      className,
    )}
    {...props}
  >
    {children}
  </span>
);

export const LobbyStickyStart = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'flex flex-col items-center py-3 px-5 overflow-hidden max-[800px]:fixed max-[800px]:left-0 max-[800px]:right-0 max-[800px]:bottom-0 max-[800px]:p-3 max-[800px]:px-5 max-[800px]:pb-[calc(env(safe-area-inset-bottom,0px)+12px)] max-[800px]:bg-[rgba(15,23,42,0.92)] max-[800px]:backdrop-blur-[16px] max-[800px]:border-t max-[800px]:border-[rgba(255,255,255,0.12)] max-[800px]:z-[150] max-[800px]:items-center max-[800px]:overflow-hidden',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

// Sidebar re-exports
export * from './lobbySidebarStyles';

// Waiting Animation
export const WaitingDots = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx('flex flex-row items-stretch gap-2', className)}
    {...props}
  >
    {children}
  </div>
);

export const Dot = ({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'w-2 h-2 rounded-[4px] bg-[#6366f1] opacity-[0.6]',
      className,
    )}
    {...props}
  />
);

export const VariantSelectorWrapper = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx('flex flex-row items-center relative ml-2', className)}
    {...props}
  >
    {children}
  </div>
);

// ============ Container Components ============

export type GameContainerStylesProps = {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export const GameContainer = forwardRef<unknown, GameContainerStylesProps>(
  function GameContainer({ className, children, ...props }, ref) {
    return (
      <div
        // legacy consumers may pass HTMLElement refs
        ref={ref as Ref<HTMLDivElement>}
        className={cx(
          'flex flex-col items-stretch flex-1 min-h-0 w-full max-w-full overflow-x-hidden bg-[var(--background)] max-[1023px]:min-h-0 max-[1023px]:flex-1',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
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
      'flex flex-row items-center justify-between flex-wrap gap-3 min-w-0 px-5 py-4 border-b border-[rgba(255,255,255,0.1)] max-[1023px]:p-3 max-[800px]:px-3 max-[800px]:py-2',
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
      'flex flex-row items-center gap-4 flex-wrap min-w-0 flex-1 max-[800px]:gap-2',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const GameTitleText = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={cx('text-[24px] font-bold', className)} {...props}>
    {children}
  </h2>
);

export const VariantText = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLSpanElement>) => (
  <span className={cx('text-[18px] font-semibold', className)} {...props}>
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
  <div className={cx('flex flex-row items-center gap-3', className)} {...props}>
    {children}
  </div>
);

export const BotCountSelector = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx('flex flex-col items-center gap-2 mb-2', className)}
    {...props}
  >
    {children}
  </div>
);

export { BotCountLabel, BotCountButtons } from './lobbyStyles-botcount';

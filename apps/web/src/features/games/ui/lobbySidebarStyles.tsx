import { forwardRef } from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { ButtonProps, IconButton } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';

// Sidebar
export const Sidebar = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'box-border flex flex-col items-stretch gap-4 w-[300px] max-[1023px]:w-full max-[800px]:w-full',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const LobbyCard = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'box-border flex flex-col items-stretch bg-[rgba(99,102,241,0.08)] rounded-[16px] p-5 relative overflow-hidden border border-[rgba(99,102,241,0.15)]',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const LobbyCardGlow = ({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'box-border absolute top-0 left-0 right-0 h-[2px] bg-[linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899)]',
      className,
    )}
    {...props}
  />
);

export const CardHeader = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'box-border flex flex-row items-center justify-between mb-4',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cx(
      'box-border text-[12px] font-semibold uppercase tracking-[0.5px] text-[var(--textSecondary)]',
      className,
    )}
    {...props}
  >
    {children}
  </h3>
);

// Player List
export const PlayerList = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx('box-border flex flex-col items-stretch gap-3', className)}
    {...props}
  >
    {children}
  </div>
);

export type PlayerItemProps = {
  $isHost?: boolean;
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export const PlayerItem = forwardRef<HTMLDivElement, PlayerItemProps>(
  function PlayerItem({ $isHost = false, className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cx(
          'box-border flex flex-row items-center gap-3 p-2 rounded-[10px]',
          $isHost
            ? 'bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.3)]'
            : 'bg-[rgba(255,255,255,0.03)] border border-transparent',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

export const LobbyPlayerAvatar = ({
  backgroundColor,
  style,
  className,
  children,
  ...props
}: {
  backgroundColor?: string;
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'box-border flex flex-col items-center justify-center w-9 h-9 rounded-[10px] bg-[var(--background)] shrink-0',
      className,
    )}
    style={backgroundColor ? { backgroundColor, ...style } : style}
    {...props}
  >
    {children}
  </div>
);

export const LobbyPlayerAvatarText = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cx(
      'box-border font-semibold text-[14px] text-[#f5f7ff]',
      className,
    )}
    {...props}
  >
    {children}
  </span>
);

export const PlayerInfo = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'box-border flex flex-col items-stretch flex-1 min-w-0',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const LobbyPlayerName = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cx(
      'box-border text-[16px] font-medium text-[var(--color)]',
      className,
    )}
    {...props}
  >
    {children}
  </span>
);

export const PlayerBadge = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cx(
      'box-border text-[10px] px-2 py-[2px] bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] text-[#f5f7ff] rounded-[8px] font-semibold',
      className,
    )}
    {...props}
  >
    {children}
  </span>
);

export const ReorderButton = (props: ButtonProps) => (
  <IconButton size="sm" {...props} />
);

export const EmptySlot = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'box-border flex flex-row items-center gap-3 p-2 rounded-[10px] border border-dashed border-[rgba(99,102,241,0.2)] opacity-[0.5]',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const EmptyAvatar = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'box-border flex flex-col items-center justify-center w-9 h-9 rounded-[10px] bg-[rgba(99,102,241,0.1)]',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const EmptyAvatarText = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLSpanElement>) => (
  <span className={cx('box-border text-[18px]', className)} {...props}>
    {children}
  </span>
);

// Info Row
export const InfoRow = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'box-border flex flex-row items-center justify-between py-2 border-b border-[rgba(99,102,241,0.1)]',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const InfoLabel = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cx(
      'box-border text-[14px] text-[var(--textSecondary)]',
      className,
    )}
    {...props}
  >
    {children}
  </span>
);

export const InfoValue = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cx(
      'box-border text-[16px] font-medium text-[var(--color)]',
      className,
    )}
    {...props}
  >
    {children}
  </span>
);

export type RoomStatus = 'lobby' | 'ready' | 'in_progress' | 'completed';

const STATUS_BADGE_CLASSES: Record<RoomStatus, string> = {
  lobby: 'bg-[rgba(16,185,129,0.15)] text-[#10b981]',
  ready: 'bg-[rgba(99,102,241,0.15)] text-[#6366f1]',
  in_progress: 'bg-[rgba(99,102,241,0.15)] text-[#6366f1]',
  completed: 'bg-[rgba(156,163,175,0.15)] text-[#9ca3af]',
};

export const StatusBadge = ({
  $status = 'lobby',
  className,
  children,
  ...props
}: {
  $status?: RoomStatus;
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cx(
      'box-border text-[14px] px-3 py-1 rounded-[8px] font-medium',
      STATUS_BADGE_CLASSES[$status],
      className,
    )}
    {...props}
  >
    {children}
  </span>
);

export const FastBadge = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'box-border flex flex-row items-center gap-2 px-3 py-1 rounded-[8px] bg-[rgba(234,179,8,0.15)]',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const FastBadgeText = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cx(
      'box-border text-[14px] font-medium text-[#eab308]',
      className,
    )}
    {...props}
  >
    {children}
  </span>
);

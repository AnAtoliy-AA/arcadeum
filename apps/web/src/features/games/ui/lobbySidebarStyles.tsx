import { forwardRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { ButtonProps, IconButton } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';

export const Sidebar = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'flex flex-col items-stretch gap-4 w-[300px] shrink-0 max-[1023px]:w-full max-[800px]:w-full',
      className,
    )}
  >
    {children}
  </div>
);

export const LobbyCard = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'flex flex-col items-stretch bg-[rgba(99,102,241,0.08)] rounded-[16px] p-5 relative overflow-hidden border border-[rgba(99,102,241,0.15)]',
      className,
    )}
  >
    {children}
  </div>
);

export const LobbyCardGlow = ({ className }: { className?: string }) => (
  <div
    className={cx(
      'absolute top-0 left-0 right-0 h-[2px] bg-[linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899)]',
      className,
    )}
  />
);

export const CardHeader = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx('flex flex-row items-center justify-between mb-4', className)}
  >
    {children}
  </div>
);

export const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <h3
    className={cx(
      'text-[12px] font-semibold uppercase tracking-[0.5px] text-[var(--textSecondary)]',
      className,
    )}
  >
    {children}
  </h3>
);

export const PlayerList = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div className={cx('flex flex-col items-stretch gap-3', className)}>
    {children}
  </div>
);

export type PlayerItemProps = {
  isHost?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export const PlayerItem = forwardRef<HTMLDivElement, PlayerItemProps>(
  function PlayerItem({ isHost = false, className, style, children }, ref) {
    return (
      <div
        ref={ref}
        style={style}
        className={cx(
          'flex flex-row items-center gap-3 p-2 rounded-[10px]',
          isHost
            ? 'bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.3)]'
            : 'bg-[rgba(255,255,255,0.03)] border border-transparent',
          className,
        )}
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
}: {
  backgroundColor?: string;
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'flex flex-col items-center justify-center w-9 h-9 rounded-[10px] bg-[var(--background)] shrink-0',
      className,
    )}
    style={backgroundColor ? { backgroundColor, ...style } : style}
  >
    {children}
  </div>
);

export const LobbyPlayerAvatarText = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <span
    className={cx('font-semibold text-[14px] text-[var(--color)]', className)}
  >
    {children}
  </span>
);

export const PlayerInfo = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div className={cx('flex flex-col items-stretch flex-1 min-w-0', className)}>
    {children}
  </div>
);

export const LobbyPlayerName = ({
  className,
  title,
  children,
}: {
  className?: string;
  title?: string;
  children?: ReactNode;
}) => (
  <span
    title={title}
    className={cx('text-[16px] font-medium text-[var(--color)]', className)}
  >
    {children}
  </span>
);

export const PlayerBadge = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <span
    className={cx(
      'text-[10px] px-2 py-[2px] bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] text-[#f5f7ff] rounded-[8px] font-semibold',
      className,
    )}
  >
    {children}
  </span>
);

export const ReorderButton = (props: ButtonProps) => (
  <IconButton
    size="sm"
    icon={props.icon}
    title={props.title}
    onClick={props.onClick}
    disabled={props.disabled}
    className={props.className}
  />
);

export const EmptySlot = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'flex flex-row items-center gap-3 p-2 rounded-[10px] border border-dashed border-[rgba(99,102,241,0.2)] opacity-[0.5]',
      className,
    )}
  >
    {children}
  </div>
);

export const EmptyAvatar = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'flex flex-col items-center justify-center w-9 h-9 rounded-[10px] bg-[rgba(99,102,241,0.1)]',
      className,
    )}
  >
    {children}
  </div>
);

export const EmptyAvatarText = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => <span className={cx('text-[18px]', className)}>{children}</span>;

export const InfoRow = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'flex flex-row items-center justify-between py-2 border-b border-[rgba(99,102,241,0.1)]',
      className,
    )}
  >
    {children}
  </div>
);

export const InfoLabel = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <span className={cx('text-[14px] text-[var(--textSecondary)]', className)}>
    {children}
  </span>
);

export const InfoValue = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <span
    className={cx('text-[16px] font-medium text-[var(--color)]', className)}
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
  status = 'lobby',
  className,
  children,
}: {
  status?: RoomStatus;
  className?: string;
  children?: ReactNode;
}) => (
  <span
    className={cx(
      'text-[14px] px-3 py-1 rounded-[8px] font-medium',
      STATUS_BADGE_CLASSES[status],
      className,
    )}
  >
    {children}
  </span>
);

export const FastBadge = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'flex flex-row items-center gap-2 px-3 py-1 rounded-[8px] bg-[rgba(234,179,8,0.15)]',
      className,
    )}
  >
    {children}
  </div>
);

export const FastBadgeText = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <span className={cx('text-[14px] font-medium text-[#eab308]', className)}>
    {children}
  </span>
);

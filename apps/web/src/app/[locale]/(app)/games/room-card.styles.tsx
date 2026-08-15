import type React from 'react';
import { cx } from '@arcadeum/ui/utils/cx';

// ─── Styled Components ────────────────────────────────────────────────────────

/**
 * Runtime hover style prop → CSS custom properties that
 * drive the `.arc-room-card:hover` rule below. Only keys actually present in
 * the passed object are set, so unset keys fall back to the base hover look.
 */
export type RoomCardHoverStyle = {
  scale?: number;
  y?: number;
  x?: number;
  borderColor?: string;
  backgroundColor?: string;
  boxShadow?: string;
  opacity?: number;
};

function resolveVarColor(value: string): string {
  if (value.startsWith('$')) return `var(--${value.slice(1)})`;
  return value;
}

function hoverStyleToVars(
  hoverStyle: RoomCardHoverStyle | undefined,
): React.CSSProperties {
  if (!hoverStyle) return {};
  const vars: Record<string, string> = {};
  if (hoverStyle.scale !== undefined) {
    vars['--arc-room-card-hover-scale'] = String(hoverStyle.scale);
  }
  if (hoverStyle.y !== undefined) {
    vars['--arc-room-card-hover-y'] = `${hoverStyle.y}px`;
  }
  if (hoverStyle.x !== undefined) {
    vars['--arc-room-card-hover-x'] = `${hoverStyle.x}px`;
  }
  if (hoverStyle.borderColor !== undefined) {
    vars['--arc-room-card-hover-border'] = resolveVarColor(
      hoverStyle.borderColor,
    );
  }
  if (hoverStyle.backgroundColor !== undefined) {
    vars['--arc-room-card-hover-bg'] = resolveVarColor(
      hoverStyle.backgroundColor,
    );
  }
  if (hoverStyle.boxShadow !== undefined) {
    vars['--arc-room-card-hover-shadow'] = hoverStyle.boxShadow;
  }
  if (hoverStyle.opacity !== undefined) {
    vars['--arc-room-card-hover-opacity'] = String(hoverStyle.opacity);
  }
  return vars as React.CSSProperties;
}

const roomCardHoverCSS = `
  .arc-room-card { transition: transform 0.25s ease, border-color 0.25s ease, background-color 0.25s ease, box-shadow 0.25s ease, opacity 0.25s ease; }
  .arc-room-card:hover {
    transform: translateX(var(--arc-room-card-hover-x, 0)) translateY(var(--arc-room-card-hover-y, -8px)) scale(var(--arc-room-card-hover-scale, 1.05));
    border-color: var(--arc-room-card-hover-border, rgba(122, 215, 255, 0.4));
    background-color: var(--arc-room-card-hover-bg, var(--backgroundHover));
    box-shadow: var(--arc-room-card-hover-shadow, 0 25px 50px rgba(0, 0, 0, 0.4), 0 0 20px rgba(122, 215, 255, 0.15));
    opacity: var(--arc-room-card-hover-opacity, 1);
  }
  .arc-room-card--completed:hover {
    transform: translateX(0) translateY(0) scale(1);
    border-color: rgba(107, 114, 128, 0.2);
    background-color: var(--glassBg);
    box-shadow: none;
  }
`;

export type StyledRoomCardProps = React.HTMLAttributes<HTMLDivElement> & {
  status?: 'completed';
  hoverStyle?: RoomCardHoverStyle;
};

export function StyledRoomCard({
  status,
  hoverStyle,
  className,
  style,
  ...props
}: StyledRoomCardProps) {
  const hoverVars = hoverStyleToVars(hoverStyle);
  return (
    <>
      <style>{roomCardHoverCSS}</style>
      <div
        className={cx(
          'arc-room-card box-border relative cursor-pointer border border-[var(--glassBorder)] bg-[var(--glassBg)]',
          status === 'completed' &&
            'arc-room-card--completed border-[rgba(107,114,128,0.2)]',
          className,
        )}
        style={{ ...style, ...hoverVars }}
        {...props}
      />
    </>
  );
}

const STATUS_BADGE_VARIANTS = {
  lobby: 'bg-[var(--success)] shadow-[0_0_10px_rgba(16,185,129,0.3)]',
  in_progress: 'bg-[var(--warning)] shadow-[0_0_10px_rgba(245,158,11,0.3)]',
  completed: 'bg-[var(--neutral)] shadow-[0_0_10px_rgba(107,114,128,0.3)]',
} as const;

export type StyledStatusBadgeStatus = keyof typeof STATUS_BADGE_VARIANTS;

export function StyledStatusBadge({
  status,
  className,
  ...props
}: {
  status?: StyledStatusBadgeStatus;
  className?: string;
} & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'box-border px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-[0.8px] whitespace-nowrap shrink-0 text-white',
        status ? STATUS_BADGE_VARIANTS[status] : '',
        className,
      )}
      {...props}
    />
  );
}

export function StyledGameName({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'box-border text-[15px] font-bold text-[var(--color)] opacity-[0.9] line-clamp-1',
        className,
      )}
      {...props}
    />
  );
}

export function StyledRoomHeader({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx('box-border flex flex-row items-center gap-4', className)}
      {...props}
    />
  );
}

export function StyledRoomActions({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-stretch gap-3 shrink-0',
        className,
      )}
      {...props}
    />
  );
}

export function StyledParticipantChip({
  isHost,
  className,
  ...props
}: {
  isHost?: boolean;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--backgroundFocus)] border border-[var(--glassBorder)]',
        isHost && 'border-[var(--primary)] bg-[rgba(122,215,255,0.1)]',
        className,
      )}
      {...props}
    />
  );
}

export function ParticipantText({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'box-border text-[12px] leading-[16px] font-semibold text-[var(--color)]',
        className,
      )}
      {...props}
    />
  );
}

export function RoomMeta({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-col items-stretch w-full gap-4',
        className,
      )}
      {...props}
    />
  );
}

export function MetaGrid({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-stretch flex-wrap gap-4 w-full',
        className,
      )}
      {...props}
    />
  );
}

export function MetaRow({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-center gap-3 min-w-0',
        className,
      )}
      {...props}
    />
  );
}

export function MetaIcon({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx('box-border text-[16px] opacity-[0.8]', className)}
      {...props}
    />
  );
}

export function MetaLabel({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'box-border text-[12px] leading-[16px] font-medium text-[var(--color)] opacity-[0.5]',
        className,
      )}
      {...props}
    />
  );
}

export function MetaValue({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'box-border text-[14px] leading-[18px] font-semibold text-[var(--color)] line-clamp-1',
        className,
      )}
      {...props}
    />
  );
}

export function ParticipantsLabel({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'box-border text-[11px] leading-[14px] font-semibold uppercase tracking-[1px] text-[var(--color)] opacity-[0.5] mb-2',
        className,
      )}
      {...props}
    />
  );
}

export function ParticipantsList({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-stretch flex-wrap gap-2',
        className,
      )}
      {...props}
    />
  );
}

export function FastBadge({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-center gap-1 px-3 py-1 rounded-lg bg-[var(--warning)] shadow-[0_4px_12px_rgba(245,158,11,0.4)] shrink-0',
        className,
      )}
      {...props}
    />
  );
}

export function FastBadgeText({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'box-border text-[10px] font-extrabold uppercase tracking-[0.8px] text-white',
        className,
      )}
      {...props}
    />
  );
}

export function BadgeIcon({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cx('box-border mr-1 text-[12px]', className)} {...props} />
  );
}

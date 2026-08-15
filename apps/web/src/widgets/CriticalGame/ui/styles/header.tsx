import type { CSSProperties, HTMLAttributes } from 'react';

import { cx } from '@arcadeum/ui/utils/cx';
import { Button, IconButton } from '@arcadeum/ui';
import type { ButtonProps } from '@arcadeum/ui';
import { getVariantStyles } from './variants';
import { useVariantTheme } from './variant-styles';

type VariantProp = { $variant?: string };

type TurnStatusValue = 'yourTurn' | 'waiting' | 'completed' | 'default';

// Header Components
export function GameHeader({
  className,
  style,
  $variant,
  children,
  ...props
}: { className?: string; style?: CSSProperties } & VariantProp &
  HTMLAttributes<HTMLDivElement>) {
  const theme = useVariantTheme();
  const config = getVariantStyles($variant).header;
  return (
    <div
      className={cx(
        'box-border flex flex-row items-center justify-between gap-3 px-[28px] py-2 h-[50px] backdrop-blur-[16px] border-b border-b-[var(--glassBorder)] -mx-[28px] -mt-[28px] relative z-[30] shrink-0 overflow-hidden max-[800px]:px-4 max-[800px]:py-2 max-[800px]:mx-0 max-[800px]:mt-0 max-[800px]:gap-2 max-[800px]:h-[42px]',
        className,
      )}
      style={{
        backgroundColor: config.getBackground(theme),
        borderBottomColor: config.getBorder(theme),
        ...style,
      }}
      {...props}
    >
      {/* web-only: the variant's top line used to be a ::before */}
      <div
        aria-hidden
        className="absolute top-0 left-[28px] right-[28px] h-[2px] rounded-[1px]"
        style={{
          background: config.getLineBackground(),
          boxShadow: config.getLineShadow(),
        }}
      />
      {children}
    </div>
  );
}

export function HeaderActions({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-stretch gap-2 items-center flex-wrap justify-end',
        className,
      )}
      {...props}
    />
  );
}

export function TimerControlsWrapper({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-stretch items-center gap-2 z-[10]',
        className,
      )}
      {...props}
    />
  );
}

export function GameInfo({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-stretch items-center gap-2 min-w-0 flex-1',
        className,
      )}
      {...props}
    />
  );
}

export function GameTitle({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'box-border m-0 text-[16px] font-extrabold tracking-[-0.3px] relative whitespace-nowrap overflow-hidden text-ellipsis max-[800px]:text-[14px]',
        className,
      )}
      {...props}
    />
  );
}

const TURN_STATUS_CLASS: Record<TurnStatusValue, string> = {
  yourTurn: 'text-[var(--success)]',
  waiting: 'text-[var(--warning)]',
  completed: 'text-[var(--secondary)]',
  default: 'text-[var(--color)] opacity-[0.7]',
};

export function TurnStatus({
  className,
  $status = 'default',
  ...props
}: {
  className?: string;
  $status?: TurnStatusValue;
} & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'box-border text-[14px] font-semibold',
        TURN_STATUS_CLASS[$status] ?? TURN_STATUS_CLASS.default,
        className,
      )}
      {...props}
    />
  );
}

const TURN_STATUS_PILL_CLASS: Record<TurnStatusValue, string> = {
  yourTurn: 'bg-[rgba(16,185,129,0.12)] border-[rgba(16,185,129,0.4)]',
  waiting: 'bg-[rgba(234,179,8,0.1)] border-[rgba(234,179,8,0.35)]',
  completed: 'bg-[rgba(148,163,184,0.1)] border-[rgba(148,163,184,0.25)]',
  default: 'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)]',
};

export function TurnStatusPill({
  className,
  $status = 'default',
  ...props
}: {
  className?: string;
  $status?: TurnStatusValue;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-stretch rounded-[20px] px-3 py-1 border items-center shrink-0',
        TURN_STATUS_PILL_CLASS[$status] ?? TURN_STATUS_PILL_CLASS.default,
        className,
      )}
      {...props}
    />
  );
}

export function VariantIconBadge({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-col items-stretch w-[30px] h-[30px] rounded-lg items-center justify-center bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] shrink-0 max-[800px]:w-6 max-[800px]:h-6',
        className,
      )}
      {...props}
    />
  );
}

export const StartButton = (props: ButtonProps) => (
  <Button
    className="max-[640px]:scale-[0.9] max-[640px]:h-[36px] max-[640px]:px-[16px] max-[640px]:py-[8px] max-[640px]:rounded-[12px]"
    variant="secondary"
    {...props}
  />
);

export const FullscreenButton = (props: ButtonProps) => (
  <IconButton
    className="p-2 active:bg-[rgba(255,255,255,0.2)] max-[640px]:scale-[0.85] max-[640px]:p-1"
    size="sm"
    {...props}
  />
);

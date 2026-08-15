import type { CSSProperties, HTMLAttributes } from 'react';

import { cx } from '@arcadeum/ui/utils/cx';
import { getVariantStyles } from './variants';
import { scrollbarStyles } from '@/shared/lib/styles';

type VariantProp = { $variant?: string };

export function ChatCard({
  className,
  style,
  $variant,
  ...props
}: { className?: string; style?: CSSProperties } & VariantProp &
  HTMLAttributes<HTMLDivElement>) {
  const config = getVariantStyles($variant).chat;
  return (
    <div
      className={cx(
        'box-border flex flex-col items-stretch gap-4 p-4 rounded-[20px] border-2 border-[var(--borderColor)] h-full max-h-[450px]',
        className,
      )}
      style={{
        backgroundColor: config.getBackground(),
        borderColor: config.getBorder(),
        boxShadow: `0 5px 10px rgba(0, 0, 0, 0.3), ${config.getShadow()}`,
        backdropFilter: 'blur(20px)',
        ...style,
      }}
      {...props}
    />
  );
}

export function ChatContainer({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-col items-stretch flex-1 bg-[var(--background)]',
        className,
      )}
      {...props}
    />
  );
}

export function ChatMessages({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-col items-stretch flex-1 overflow-y-auto gap-3 p-2',
        scrollbarStyles.className,
        className,
      )}
      {...props}
    />
  );
}

export function ChatCloseButton({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'box-border absolute top-3 right-3 w-6 h-6 leading-[24px] text-center rounded-[12px] bg-[rgba(255,255,255,0.05)] cursor-pointer z-[10] border border-[rgba(255,255,255,0.1)] transition-transform duration-150 ease-out hover:bg-[rgba(255,255,255,0.15)] hover:scale-[1.1] active:scale-[0.95]',
        className,
      )}
      {...props}
    />
  );
}

// Log-pill spec (Task 13 Step 3): single line, soft blur, variant-tinted border
// at ~0.35 alpha, ellipsis truncation on overflow.
export const LOG_PILL_STYLE =
  'box-border py-1 px-3 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.14)]';

export function LogEntry({
  className,
  $type: _type,
  $scope: _scope,
  ...props
}: { className?: string; $type?: unknown; $scope?: unknown } & VariantProp &
  HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        LOG_PILL_STYLE,
        'box-border text-[12px] leading-[20px] line-clamp-1 overflow-hidden whitespace-nowrap text-ellipsis',
        className,
      )}
      style={{ backdropFilter: 'blur(8px)' }}
      {...props}
    />
  );
}

export function GameLog({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-col items-stretch flex-1 overflow-y-auto gap-2 p-2',
        scrollbarStyles.className,
        className,
      )}
      {...props}
    />
  );
}

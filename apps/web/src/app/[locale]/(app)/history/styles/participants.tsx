import type React from 'react';
import { type ReactNode, type ComponentProps } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { Typography } from '@arcadeum/ui';

export function ParticipantRow({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'flex flex-row items-center justify-between px-5 py-4 rounded-2xl border border-[var(--borderColor)] bg-[var(--background)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--backgroundHover)]',
        className,
      )}
      {...props}
    />
  );
}

export function ParticipantInfo({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx('flex flex-row items-center gap-3 flex-1', className)}
      {...props}
    />
  );
}

export function ParticipantName({
  children,
  ...props
}: { children?: ReactNode } & ComponentProps<typeof Typography>) {
  return (
    <Typography className={'flex-1'} weight="500" {...props}>
      {children}
    </Typography>
  );
}

// Native checkbox styled with Tailwind arbitrary classes (appearance:none +
// checked/after variants — no runtime <style> injection needed).
const checkboxClasses = [
  'appearance-none',
  'w-[22px]',
  'h-[22px]',
  'border-2',
  'border-[rgba(255,255,255,0.2)]',
  'rounded-[6px]',
  'cursor-pointer',
  'relative',
  'transition-all',
  'duration-200',
  'bg-transparent',
  'shrink-0',
  'hover:border-[#6366f1]',
  'focus-visible:outline',
  'focus-visible:outline-2',
  'focus-visible:outline-[#6366f1]',
  'focus-visible:outline-offset-2',
  'checked:border-[#6366f1]',
  'checked:bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_100%)]',
  'checked:after:content-["✓"]',
  'checked:after:absolute',
  'checked:after:top-1/2',
  'checked:after:left-1/2',
  'checked:after:-translate-x-1/2',
  'checked:after:-translate-y-1/2',
  'checked:after:text-white',
  'checked:after:text-[0.875rem]',
  'checked:after:font-bold',
].join(' ');

export function Checkbox(props: ComponentProps<'input'>) {
  return (
    <input
      {...props}
      type="checkbox"
      className={cx(checkboxClasses, props.className)}
    />
  );
}

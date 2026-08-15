import type React from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { Button, type ButtonProps } from '@arcadeum/ui';

export function Container({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'flex flex-col items-stretch gap-8 w-full max-w-[900px] self-center',
        className,
      )}
      {...props}
    />
  );
}

export function OptionList({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx('grid gap-5 w-full', className)}
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
      {...props}
    />
  );
}

export function PillGroup({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx('flex flex-row items-stretch flex-wrap gap-4', className)}
      {...props}
    />
  );
}

export function AccountStatus({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cx(
        'm-0 p-5 rounded-xl border border-[var(--borderColor)] bg-[var(--background)] text-center text-[16px] leading-[24px] text-[var(--color)] opacity-[0.8]',
        className,
      )}
      style={{ backdropFilter: 'blur(12px)' }}
      {...props}
    />
  );
}

export function AccountActions({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'flex flex-row items-stretch flex-wrap gap-5 mt-3',
        className,
      )}
      {...props}
    />
  );
}

export function AccountActionItem({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'flex flex-col items-stretch flex-1 min-w-[150px]',
        className,
      )}
      {...props}
    />
  );
}

export function ToggleRow({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'flex flex-row items-center justify-between p-6 bg-[var(--background)] border border-[var(--borderColor)] rounded-xl cursor-pointer transition-colors hover:border-[var(--primary)] hover:bg-[var(--backgroundHover)]',
        className,
      )}
      style={{ backdropFilter: 'blur(8px)', scrollMarginTop: 100 }}
      {...props}
    />
  );
}

export function ToggleLabel({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'text-[18px] leading-[24px] font-semibold text-[var(--color)] cursor-pointer',
        className,
      )}
      {...props}
    />
  );
}

export function ToggleInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return (
    <input
      type="checkbox"
      className={cx(
        'appearance-none relative w-14 h-8 shrink-0 rounded-full border-2 border-[var(--borderColor)] bg-[var(--backgroundHover)] cursor-pointer transition-all duration-300',
        'after:content-[""] after:absolute after:top-1 after:left-1 after:w-[20px] after:h-[20px] after:rounded-full after:bg-white after:shadow-[0_2px_4px_rgba(0,0,0,0.2)] after:transition-transform after:duration-300',
        'checked:border-[var(--primary)] checked:bg-[var(--primary)] checked:shadow-[0_0_12px_var(--primary)] checked:after:translate-x-6',
        'focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[color:var(--borderColorFocus)]',
      )}
      {...props}
    />
  );
}

export function BlockedUserRow({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'flex flex-row items-center justify-between gap-4 p-4 bg-[var(--background)] border border-[var(--borderColor)] rounded-xl',
        className,
      )}
      style={{ backdropFilter: 'blur(12px)' }}
      {...props}
    />
  );
}

export function BlockedUserInfo({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'flex flex-col items-stretch gap-2 min-w-0 flex-1',
        className,
      )}
      {...props}
    />
  );
}

export const UnblockButton = (props: ButtonProps) => (
  <Button
    className={'rounded-[12px] whitespace-nowrap'}
    variant="danger"
    outline
    size="sm"
    {...props}
  />
);

export function OptionLabel({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'text-[18px] leading-[24px] font-semibold text-[var(--color)]',
        className,
      )}
      {...props}
    />
  );
}

export function OptionDescription({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cx(
        'm-0 text-[16px] leading-[20px] text-[var(--color)] opacity-[0.7]',
        className,
      )}
      {...props}
    />
  );
}

export function VersionText({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'text-[16px] leading-[20px] text-[var(--color)] tracking-[0.05em] opacity-[0.7]',
        className,
      )}
      style={{ fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace" }}
      {...props}
    />
  );
}

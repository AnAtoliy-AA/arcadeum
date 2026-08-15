import type React from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { Button, type ButtonProps } from '@arcadeum/ui';

export const settingsStyles = `
  .settings-toggle-input {
    appearance: none;
    width: 3.5rem;
    height: 2rem;
    background: var(--color-backgroundHover, #32353d);
    border-radius: 999px;
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    border: 2px solid var(--color-borderColor, rgba(50, 53, 61, 0.8));
    flex-shrink: 0;
  }

  .settings-toggle-input:checked {
    background: var(--color-primary, #7ad7ff);
    border-color: var(--color-primary, #7ad7ff);
    box-shadow: 0 0 12px var(--color-primary, rgba(122, 215, 255, 0.25));
  }

  .settings-toggle-input::after {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    width: calc(2rem - 12px);
    height: calc(2rem - 12px);
    background: white;
    border-radius: 50%;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .settings-toggle-input:checked::after {
    transform: translateX(1.5rem);
  }

  .settings-toggle-input:focus-visible {
    outline: 2px solid var(--color-borderColorFocus, #7ad7ff);
    outline-offset: 2px;
  }
`;

export function Container({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-col items-stretch gap-8 w-full max-w-[900px] self-center',
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
      className={cx('box-border grid gap-5 w-full', className)}
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
      className={cx(
        'box-border flex flex-row items-stretch flex-wrap gap-4',
        className,
      )}
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
        'box-border m-0 p-5 rounded-xl border border-[var(--borderColor)] bg-[var(--background)] text-center text-[16px] leading-[24px] text-[var(--color)] opacity-[0.8]',
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
        'box-border flex flex-row items-stretch flex-wrap gap-5 mt-3',
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
        'box-border flex flex-col items-stretch flex-1 min-w-[150px]',
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
        'box-border flex flex-row items-center justify-between p-6 bg-[var(--background)] border border-[var(--borderColor)] rounded-xl cursor-pointer transition-colors hover:border-[var(--primary)] hover:bg-[var(--backgroundHover)]',
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
        'box-border text-[18px] leading-[24px] font-semibold text-[var(--color)] cursor-pointer',
        className,
      )}
      {...props}
    />
  );
}

export function ToggleInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return <input type="checkbox" className="settings-toggle-input" {...props} />;
}

export function BlockedUserRow({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-center justify-between gap-4 p-4 bg-[var(--background)] border border-[var(--borderColor)] rounded-xl',
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
        'box-border flex flex-col items-stretch gap-2 min-w-0 flex-1',
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
        'box-border text-[18px] leading-[24px] font-semibold text-[var(--color)]',
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
        'box-border m-0 text-[16px] leading-[20px] text-[var(--color)] opacity-[0.7]',
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
        'box-border text-[16px] leading-[20px] text-[var(--color)] tracking-[0.05em] opacity-[0.7]',
        className,
      )}
      style={{ fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace" }}
      {...props}
    />
  );
}

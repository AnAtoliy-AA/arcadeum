import type {
  AriaRole,
  ChangeEventHandler,
  MouseEventHandler,
  ReactNode,
} from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { Button } from '@arcadeum/ui';

export function Container({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(
        'flex flex-col items-stretch gap-8 w-full max-w-[900px] self-center',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function OptionList({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx('grid gap-5 w-full', className)}
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
    >
      {children}
    </div>
  );
}

export function PillGroup({
  role,
  'aria-label': ariaLabel,
  children,
}: {
  role?: AriaRole;
  'aria-label'?: string;
  children?: ReactNode;
}) {
  return (
    <div
      role={role}
      aria-label={ariaLabel}
      className="flex flex-row items-stretch flex-wrap gap-4"
    >
      {children}
    </div>
  );
}

export function AccountStatus({ children }: { children?: ReactNode }) {
  return (
    <p
      className="m-0 p-5 rounded-xl border border-[var(--borderColor)] bg-[var(--background)] text-center text-[16px] leading-[24px] text-[var(--color)] opacity-[0.8]"
      style={{ backdropFilter: 'blur(12px)' }}
    >
      {children}
    </p>
  );
}

export function AccountActions({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-row items-stretch flex-wrap gap-5 mt-3">
      {children}
    </div>
  );
}

export function AccountActionItem({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-col items-stretch flex-1 min-w-[150px]">
      {children}
    </div>
  );
}

export function ToggleRow({
  'data-testid': dataTestId,
  onClick,
  children,
}: {
  'data-testid'?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  children?: ReactNode;
}) {
  return (
    <div
      data-testid={dataTestId}
      onClick={onClick}
      className="flex flex-row items-center justify-between p-6 bg-[var(--background)] border border-[var(--borderColor)] rounded-xl cursor-pointer transition-colors hover:border-[var(--primary)] hover:bg-[var(--backgroundHover)]"
      style={{ backdropFilter: 'blur(8px)', scrollMarginTop: 100 }}
    >
      {children}
    </div>
  );
}

export function ToggleLabel({ children }: { children?: ReactNode }) {
  return (
    <span className="text-[18px] leading-[24px] font-semibold text-[var(--color)] cursor-pointer">
      {children}
    </span>
  );
}

export function ToggleInput({
  type,
  checked,
  defaultChecked,
  disabled,
  readOnly,
  name,
  onChange,
  'aria-label': ariaLabel,
}: {
  type?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  name?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  'aria-label'?: string;
}) {
  return (
    <input
      type={type ?? 'checkbox'}
      checked={checked}
      defaultChecked={defaultChecked}
      disabled={disabled}
      readOnly={readOnly}
      name={name}
      onChange={onChange}
      aria-label={ariaLabel}
      className={cx(
        'appearance-none relative w-14 h-8 shrink-0 rounded-full border-2 border-[var(--borderColor)] bg-[var(--backgroundHover)] cursor-pointer transition-all duration-300',
        'after:content-[""] after:absolute after:top-1 after:left-1 after:w-[20px] after:h-[20px] after:rounded-full after:bg-white after:shadow-[0_2px_4px_rgba(0,0,0,0.2)] after:transition-transform after:duration-300',
        'checked:border-[var(--primary)] checked:bg-[var(--primary)] checked:shadow-[0_0_12px_var(--primary)] checked:after:translate-x-6',
        'focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[color:var(--borderColorFocus)]',
      )}
    />
  );
}

export function BlockedUserRow({ children }: { children?: ReactNode }) {
  return (
    <div
      className="flex flex-row items-center justify-between gap-4 p-4 bg-[var(--background)] border border-[var(--borderColor)] rounded-xl"
      style={{ backdropFilter: 'blur(12px)' }}
    >
      {children}
    </div>
  );
}

export function BlockedUserInfo({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-col items-stretch gap-2 min-w-0 flex-1">
      {children}
    </div>
  );
}

export function UnblockButton({
  onClick,
  children,
}: {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children?: ReactNode;
}) {
  return (
    <Button
      className={'rounded-[12px] whitespace-nowrap'}
      variant="danger"
      outline
      size="sm"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function OptionLabel({ children }: { children?: ReactNode }) {
  return (
    <span className="text-[18px] leading-[24px] font-semibold text-[var(--color)]">
      {children}
    </span>
  );
}

export function OptionDescription({ children }: { children?: ReactNode }) {
  return (
    <p className="m-0 text-[16px] leading-[20px] text-[var(--color)] opacity-[0.7]">
      {children}
    </p>
  );
}

export function VersionText({ children }: { children?: ReactNode }) {
  return (
    <span
      className="text-[16px] leading-[20px] text-[var(--color)] tracking-[0.05em] opacity-[0.7]"
      style={{ fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace" }}
    >
      {children}
    </span>
  );
}

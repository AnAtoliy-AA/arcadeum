import type { ReactNode } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { TextArea, type TextAreaProps } from '@arcadeum/ui';

export function PaymentTextArea({
  value,
  defaultValue,
  placeholder,
  onChange,
  onFocus,
  onBlur,
  disabled,
  error,
  fullWidth,
  'data-testid': dataTestId,
  id,
  name,
  autoFocus,
  rows,
  required,
  style,
  'aria-label': ariaLabel,
}: Omit<TextAreaProps, 'className'> & { 'aria-label'?: string }) {
  return (
    <TextArea
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      disabled={disabled}
      error={error}
      fullWidth={fullWidth}
      data-testid={dataTestId}
      id={id}
      name={name}
      autoFocus={autoFocus}
      rows={rows}
      required={required}
      style={style}
      {...(ariaLabel !== undefined ? { 'aria-label': ariaLabel } : {})}
      className={cx(
        'rounded-2xl border border-[var(--borderColor)] p-4 text-[18px] leading-[24px]',
      )}
    />
  );
}

export function StatusMessage({
  messageType,
  className,
  children,
}: {
  messageType: 'error' | 'success';
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cx(
        'flex flex-row items-center gap-2 rounded-2xl border p-4',
        messageType === 'error'
          ? 'bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.2)]'
          : 'bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.2)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

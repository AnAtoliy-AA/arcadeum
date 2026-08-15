import { forwardRef } from 'react';
import { cx } from '../../utils/cx';

export type TextAreaProps = {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  onFocus?: React.FocusEventHandler<HTMLTextAreaElement>;
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
  disabled?: boolean;
  error?: boolean;
  fullWidth?: boolean;
  'data-testid'?: string;
  id?: string;
  name?: string;
  autoFocus?: boolean;
  rows?: number;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(
    {
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
      className,
      style,
    },
    ref,
  ) {
    return (
      <textarea
        ref={ref}
        id={id}
        name={name}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        rows={rows}
        required={required}
        aria-required={required || undefined}
        data-testid={dataTestId}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        className={cx(
          'min-h-[120px] rounded-[16px] border bg-[var(--background)] px-4 py-3 text-[16px] text-[var(--color)] outline-none transition-[border-color] duration-200',
          fullWidth && 'w-full',
          error
            ? 'border-[var(--error)]'
            : 'border-[var(--borderColor)] hover:border-[var(--primary)] focus:border-[var(--primary)] focus:border-[2px]',
          className,
        )}
        style={style}
      />
    );
  },
);

TextArea.displayName = 'TextArea';

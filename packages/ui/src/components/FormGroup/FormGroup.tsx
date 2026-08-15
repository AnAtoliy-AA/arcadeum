import { memo } from 'react';
import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type FormGroupProps = {
  label?: string;
  htmlFor?: string;
  error?: string;
  required?: boolean;
  description?: string;
  children: ReactNode;
  className?: string;
  flexGrow?: number | string;
  flexBasis?: number | string;
  /** legacy Tamagui responsive shorthand — mapped to flexGrow/flexBasis. */
  $xs?: { flexGrow?: number | string; flexBasis?: number | string };
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>;

export const FormGroup = memo(function FormGroup({
  label,
  htmlFor,
  error,
  required,
  description,
  children,
  className,
  style,
  flexGrow,
  flexBasis,
  $xs,
  ...rest
}: FormGroupProps) {
  return (
    <div
      className={cx('flex w-full flex-col gap-2', className)}
      style={{
        ...(flexGrow !== undefined ? { flexGrow } : null),
        ...(flexBasis !== undefined ? { flexBasis } : null),
        ...($xs
          ? {
              flexGrow: $xs.flexGrow,
              flexBasis: $xs.flexBasis,
            }
          : null),
        ...style,
      }}
      {...rest}
    >
      {label && (
        <label htmlFor={htmlFor} className="block cursor-pointer">
          <span className="select-none text-[16px] font-semibold tracking-[0.5px] text-[var(--color)]">
            {label}
            {required && (
              <span className="ml-1 text-[var(--error)]">*</span>
            )}
          </span>
        </label>
      )}
      {description && (
        <span className="block text-[14px] text-[var(--color)] opacity-60">
          {description}
        </span>
      )}
      {children}
      {error && (
        <span className="mt-1 block text-[14px] text-[var(--error)]">
          ⚠ {error}
        </span>
      )}
    </div>
  );
});

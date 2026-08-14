import { forwardRef } from 'react';
import { cx } from '../../utils/cx';

export type InputProps = {
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  fullWidth?: boolean;
  /** @deprecated Use onClick instead */
  onPress?: () => void;
  onClick?: (e: unknown) => void;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  disabled?: boolean;
  required?: boolean;
  type?: string;
  id?: string;
  name?: string;
  maxLength?: number;
  min?: number | string;
  max?: number | string;
  autoComplete?: string;
  'data-testid'?: string;
  'aria-label'?: string;
  'aria-required'?: boolean | string;
  className?: string;
  style?: React.CSSProperties;
  flex?: number | string;
  width?: number | string;
  minWidth?: number | string;
  /** Tamagui responsive shorthand — mapped to minWidth/width. */
  $xs?: { minWidth?: number | string; width?: number | string };
  /** Tamagui-compat: fires with the new value. */
  onChangeText?: (text: string) => void;
  /** Tamagui-compat: fires on Enter. */
  onSubmitEditing?: () => void;
  /** Tamagui-compat alias for data-testid. */
  testID?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'>;

const sizeClasses: Record<NonNullable<InputProps['size']>, string> = {
  sm: 'h-9 px-3 text-[14px]',
  md: 'h-12 px-4 text-[16px]',
  lg: 'h-[60px] px-5 text-[20px]',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size = 'md',
    error,
    fullWidth,
    onPress,
    onClick,
    className,
    style,
    flex,
    width,
    minWidth,
    $xs,
    onChangeText,
    onSubmitEditing,
    testID,
    'data-testid': dataTestId,
    onChange,
    ...rest
  },
  ref,
) {
  return (
    <input
      ref={ref}
      data-testid={testID ?? dataTestId}
      className={cx(
        'rounded-[16px] border bg-[var(--background)] text-[var(--color)] outline-none transition-[border-color] duration-200',
        sizeClasses[size],
        fullWidth && 'w-full',
        error
          ? 'border-[var(--error)]'
          : 'border-[var(--borderColor)] hover:border-[var(--primary)] focus:border-[var(--primary)] focus:border-[2px]',
        className,
      )}
      style={{
        ...(flex !== undefined ? { flex } : null),
        ...(width !== undefined ? { width } : null),
        ...(minWidth !== undefined ? { minWidth } : null),
        ...($xs
          ? {
              minWidth: $xs.minWidth,
              width: $xs.width,
            }
          : null),
        ...style,
      }}
      onChange={(e) => {
        onChange?.(e);
        onChangeText?.(e.target.value);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSubmitEditing?.();
      }}
      onClick={(e) => {
        onClick?.(e);
        onPress?.();
      }}
      {...rest}
    />
  );
});

Input.displayName = 'Input';

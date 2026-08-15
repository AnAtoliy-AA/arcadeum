import type {
  CSSProperties,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react';
import { memo } from 'react';

import { cx } from '@arcadeum/ui/utils/cx';
import { Button, type ButtonProps, type GameVariant } from '@arcadeum/ui';
import { getVariantStyles } from './variants';
import { resolveVariantStyles, useVariantTheme } from './variant-styles';

type VariantProp = { $variant?: string };

export function ScopeToggle({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-stretch gap-2 flex-wrap',
        className,
      )}
      {...props}
    />
  );
}

interface ScopeOptionProps extends Omit<ButtonProps, 'variant'> {
  isActive?: boolean;
  variant?: string; // string variant from game options
}

export const ScopeOption = ({
  isActive,
  variant,
  ...props
}: ScopeOptionProps) => (
  <Button
    className="min-w-[120px] max-[480px]:min-w-[80px]"
    variant={isActive ? 'primary' : 'secondary'}
    size="sm"
    active={isActive}
    gameVariant={variant as GameVariant}
    style={{ flex: 1 }}
    {...props}
  />
);

export function ChatInput({
  className,
  style,
  $variant,
  ...props
}: { className?: string; style?: CSSProperties } & VariantProp &
  TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const theme = useVariantTheme();
  const config = getVariantStyles($variant).chat;
  const variantStyles = resolveVariantStyles(config.getInputStyles?.());
  const focusBorder = config.getInputFocusBorder?.(theme) || 'var(--primary)';
  return (
    <textarea
      className={cx(
        'box-border w-full min-h-[90px] rounded-[12px] p-3 text-[14px] border border-[var(--borderColor)] bg-[var(--background)] focus:border-[var(--chat-input-focus-border)] focus:border-2 focus:shadow-[var(--chat-input-focus-shadow)] focus:outline-none [@media(max-height:480px)]:min-h-[60px] [@media(max-height:480px)]:p-2',
        className,
      )}
      style={
        {
          backgroundColor: config.getInputBackground?.(theme),
          borderColor: config.getInputBorder?.(theme),
          '--chat-input-focus-border': focusBorder,
          '--chat-input-focus-shadow': config.getInputFocusShadow?.() || 'none',
          ...variantStyles.style,
          ...style,
        } as CSSProperties
      }
      {...props}
    />
  );
}

export function ChatControls({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-stretch justify-between items-center gap-3 flex-wrap shrink-0',
        className,
      )}
      {...props}
    />
  );
}

export function ChatHint({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'box-border text-[12px] text-[var(--color)] opacity-[0.7]',
        className,
      )}
      {...props}
    />
  );
}

export function ChatTurnStatus({
  className,
  style,
  $variant,
  ...props
}: { className?: string; style?: CSSProperties } & VariantProp &
  HTMLAttributes<HTMLSpanElement>) {
  const config = getVariantStyles($variant).chat;
  const variantStyles = resolveVariantStyles(config.getTurnStatusStyles?.());
  return (
    <span
      className={cx(
        'box-border px-3 py-2 rounded-lg border-l-[3px] border-l-[var(--primary)] mb-1 bg-[var(--glassBg)]',
        className,
      )}
      style={{ ...variantStyles.style, ...style }}
      {...props}
    />
  );
}

export const ChatSendButton = ({
  variant,
  ...props
}: ButtonProps & { variant?: string }) => (
  <Button
    variant="primary"
    size="sm"
    gameVariant={variant as GameVariant}
    {...props}
  />
);

export function EmptyState({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-col items-center justify-center gap-4 p-9',
        className,
      )}
      {...props}
    />
  );
}

const CHAT_BUBBLE_POSITION_CLASS = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
  left: 'top-1/2 right-full -translate-y-1/2 mr-3',
  right: 'top-1/2 left-full -translate-y-1/2 ml-3',
} as const;

interface ChatBubbleContainerProps {
  $visible: boolean;
  $position?: 'top' | 'bottom' | 'left' | 'right';
  children?: ReactNode;
  $variant?: string;
}

export const ChatBubbleContainer = memo(function ChatBubbleContainer({
  $visible,
  $position,
  $variant: _variant,
  style,
  ...props
}: ChatBubbleContainerProps & { style?: CSSProperties }): ReactElement {
  return (
    <div
      className={cx(
        'box-border flex flex-col items-stretch absolute py-1 px-3 rounded-full border border-[rgba(255,255,255,0.14)] max-w-[180px] z-[100] transition-all duration-150 ease-out',
        $visible
          ? 'opacity-[1] scale-[1]'
          : 'opacity-0 scale-[0.9] pointer-events-none',
        $position ? CHAT_BUBBLE_POSITION_CLASS[$position] : undefined,
      )}
      style={{
        wordBreak: 'break-word',
        overflowWrap: 'anywhere',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 2.5px 5px rgba(0, 0, 0, 0.3)',
        ...style,
      }}
      {...props}
    />
  );
});

export function LogSender({
  className,
  $color: _color,
  $variant: _variant,
  ...props
}: { className?: string; $color?: unknown } & VariantProp &
  HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx('box-border font-bold', className)} {...props} />;
}

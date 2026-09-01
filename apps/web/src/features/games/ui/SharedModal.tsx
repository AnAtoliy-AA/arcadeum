'use client';

import { useEffect, useRef } from 'react';
import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import { Button, type GameVariant } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';

export type ModalProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
  className?: string;
};

export function Modal({ open, onOpenChange, children, className }: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange?.(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node)
      ) {
        onOpenChange?.(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className={cx('fixed inset-0 z-[9999]', className)}>
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden
      />
      <div
        ref={contentRef}
        className="relative z-[1] flex h-full items-center justify-center"
      >
        {children}
      </div>
    </div>
  );
}

export type ModalVariant = 'default' | 'cyberpunk' | 'underwater';

function resolveModalVariant(variant?: string): ModalVariant {
  return variant === 'cyberpunk' || variant === 'underwater'
    ? variant
    : 'default';
}

export type ModalFrameProps = {
  variant?: ModalVariant;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  id?: string;
  role?: string;
  'aria-label'?: string;
  'data-testid'?: string;
};

const FRAME_VARIANT_CLASSES: Record<ModalVariant, string> = {
  default:
    'border border-[var(--glassBorderStrong)] bg-[var(--background)] text-[var(--color)] shadow-2xl',
  cyberpunk:
    'border border-[var(--glassBorderStrong)] bg-[var(--background)] text-[var(--color)] shadow-2xl',
  underwater:
    'border border-[var(--glassBorderStrong)] bg-[var(--background)] text-[var(--color)] shadow-2xl',
};

export const ModalFrame = ({
  variant = 'default',
  className,
  style,
  children,
  id,
  role,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
}: ModalFrameProps) => (
  <div
    id={id}
    role={role}
    aria-label={ariaLabel}
    data-testid={dataTestId}
    className={cx(
      'relative w-full max-w-[600px] max-h-[calc(100vh-40px)] overflow-hidden',
      variant === 'cyberpunk' ? 'rounded-[4px]' : 'rounded-[24px]',
      FRAME_VARIANT_CLASSES[variant],
      className,
    )}
    style={style}
  >
    {children}
  </div>
);

export const ScrollArea = ({
  className,
  'data-testid': dataTestId,
  children,
}: {
  className?: string;
  'data-testid'?: string;
  children?: ReactNode;
}) => (
  <div
    data-testid={dataTestId}
    className={cx(
      'flex flex-col items-stretch w-full h-full p-5 overflow-y-auto',
      className,
    )}
  >
    {children}
  </div>
);

export const ModalContent = ({
  children,
  variant,
  maxWidth,
  className,
  style,
  id,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
}: {
  variant?: string;
  maxWidth?: string | number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  id?: string;
  'aria-label'?: string;
  'data-testid'?: string;
}) => {
  const resolvedVariant = resolveModalVariant(variant);

  return (
    <ModalFrame
      id={id}
      aria-label={ariaLabel}
      data-testid={dataTestId}
      className={cx('m-auto', className)}
      style={maxWidth ? { maxWidth, ...style } : style}
      variant={resolvedVariant}
    >
      {resolvedVariant === 'cyberpunk' && (
        <>
          <div
            className="absolute top-[-2px] left-[-2px] w-[20px] h-[20px] border-t-[2px] border-l-[2px] pointer-events-none"
            style={{ borderColor: '#06b6d4' }}
          />
          <div
            className="absolute bottom-[-2px] right-[-2px] w-[20px] h-[20px] border-b-[2px] border-r-[2px] pointer-events-none"
            style={{ borderColor: '#06b6d4' }}
          />
        </>
      )}
      {resolvedVariant === 'underwater' && (
        <div className="absolute inset-[4px] border border-[rgba(34,_211,_238,_0.2)] rounded-[20px] pointer-events-none" />
      )}
      <ScrollArea>{children}</ScrollArea>
    </ModalFrame>
  );
};

export const ModalHeader = ({
  variant,
  className,
  children,
}: {
  variant?: string;
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'flex flex-row items-center justify-between mb-4 pb-3 border-b border-b-[var(--glassBorder)]',
      variant === 'cyberpunk' && 'border-b-[rgba(6,182,212,0.3)]',
      className,
    )}
  >
    {children}
  </div>
);

const TITLE_VARIANT_CLASSES: Record<ModalVariant, string> = {
  default: 'text-[var(--color)]',
  cyberpunk:
    'uppercase tracking-[2px] text-[#d946ef] [text-shadow:0_0_10px_rgba(232,121,249,0.5)]',
  underwater:
    'tracking-[1px] text-[#22d3ee] [text-shadow:0_0_10px_rgba(34,211,238,0.5)]',
};

export const ModalTitle = ({
  variant,
  className,
  'data-testid': dataTestId,
  children,
}: {
  variant?: string;
  className?: string;
  'data-testid'?: string;
  children?: ReactNode;
}) => {
  const resolvedVariant = resolveModalVariant(variant);

  return (
    <span
      data-testid={dataTestId}
      className={cx(
        'text-[28px] font-bold',
        TITLE_VARIANT_CLASSES[resolvedVariant],
        className,
      )}
    >
      {children}
    </span>
  );
};

interface CloseButtonProps extends ComponentProps<typeof Button> {
  accent?: string;
}

export const CloseButton = ({
  accent,
  onClick,
  disabled,
  className,
  title,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
  children,
}: CloseButtonProps) => (
  <Button
    className={cx(
      'text-[var(--color)] hover:rotate-[180deg] hover:scale-[1.1] hover:text-[var(--primary)]',
      className,
    )}
    variant="icon"
    size="sm"
    data-testid={dataTestId}
    gameVariant={accent as GameVariant}
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={ariaLabel}
  >
    {children}
  </Button>
);

export const ModalActions = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div className={cx('flex flex-row items-stretch gap-3 mt-5', className)}>
    {children}
  </div>
);

export const ModalSection = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div className={cx('flex flex-col items-stretch mb-4', className)}>
    {children}
  </div>
);

const SECTION_LABEL_VARIANT_CLASSES: Record<ModalVariant, string> = {
  default: 'text-[var(--textSecondary)]',
  cyberpunk: 'text-[#06b6d4] [text-shadow:0_0_5px_rgba(6,182,212,0.5)]',
  underwater: 'text-[#22d3ee] [text-shadow:0_0_5px_rgba(34,211,238,0.5)]',
};

export const SectionLabel = ({
  variant,
  className,
  children,
}: {
  variant?: string;
  className?: string;
  children?: ReactNode;
}) => {
  const resolvedVariant = resolveModalVariant(variant);

  return (
    <span
      className={cx(
        'text-[14px] font-semibold uppercase tracking-[0.5px] mb-2',
        SECTION_LABEL_VARIANT_CLASSES[resolvedVariant],
        className,
      )}
    >
      {children}
    </span>
  );
};

export const RulesText = ({
  className,
  'data-testid': dataTestId,
  children,
}: {
  className?: string;
  'data-testid'?: string;
  children?: ReactNode;
}) => (
  <span
    data-testid={dataTestId}
    className={cx('text-[16px] leading-[20px] opacity-[0.9]', className)}
  >
    {children}
  </span>
);

export const RulesTextPre = ({
  className,
  'data-testid': dataTestId,
  children,
}: {
  className?: string;
  'data-testid'?: string;
  children?: ReactNode;
}) => (
  <RulesText
    data-testid={dataTestId}
    className={cx('whitespace-pre-line', className)}
  >
    {children}
  </RulesText>
);

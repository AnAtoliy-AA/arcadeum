'use client';

import { useEffect, useRef } from 'react';
import type {
  ComponentProps,
  CSSProperties,
  HTMLAttributes,
  ReactNode,
} from 'react';
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
    <div className={cx('fixed inset-0 z-[1000]', className)}>
      <div className="absolute inset-0 bg-black" aria-hidden />
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
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style'>;

const FRAME_VARIANT_CLASSES: Record<ModalVariant, string> = {
  default:
    'border border-[var(--borderColor)] bg-[var(--background)] shadow-[0_20px_60px_rgba(0,0,0,0.5)]',
  cyberpunk:
    'border-2 border-[rgba(192,38,211,0.6)] bg-[rgba(20,0,30,0.95)] shadow-[0_20px_30px_rgba(192,38,211,0.2)]',
  underwater:
    'border-2 border-[rgba(34,211,238,0.5)] bg-[rgba(8,51,68,0.85)] shadow-[0_20px_30px_rgba(34,211,238,0.2)]',
};

export const ModalFrame = ({
  variant = 'default',
  className,
  style,
  children,
  ...props
}: ModalFrameProps) => (
  <div
    className={cx(
      'relative w-full max-w-[600px] max-h-[calc(100vh-40px)] overflow-hidden',
      variant === 'cyberpunk' ? 'rounded-[4px]' : 'rounded-[24px]',
      FRAME_VARIANT_CLASSES[variant],
      className,
    )}
    style={style}
    {...props}
  >
    {children}
  </div>
);

export const ScrollArea = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'flex flex-col items-stretch w-full h-full p-5 overflow-y-auto',
      className,
    )}
    {...props}
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
  ...props
}: {
  variant?: string;
  maxWidth?: string | number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style'>) => {
  const resolvedVariant = resolveModalVariant(variant);

  return (
    <ModalFrame
      className={cx('m-auto', className)}
      style={maxWidth ? { maxWidth, ...style } : style}
      variant={resolvedVariant}
      {...props}
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
  ...props
}: {
  variant?: string;
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'flex flex-row items-center justify-between mb-4 pb-3 border-b-2 border-b-[var(--borderColor)]',
      variant === 'cyberpunk' && 'border-b-[rgba(6,182,212,0.3)]',
      className,
    )}
    {...props}
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
  children,
  ...props
}: {
  variant?: string;
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLSpanElement>) => {
  const resolvedVariant = resolveModalVariant(variant);

  return (
    <span
      className={cx(
        'text-[28px] font-bold',
        TITLE_VARIANT_CLASSES[resolvedVariant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};

interface CloseButtonProps extends ComponentProps<typeof Button> {
  accent?: string;
}

export const CloseButton = ({ accent, ...props }: CloseButtonProps) => (
  <Button
    className="hover:rotate-[180deg] hover:scale-[1.1]"
    variant="icon"
    size="sm"
    data-testid="modal-close-button"
    gameVariant={accent as GameVariant}
    {...props}
  />
);

export const ModalActions = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx('flex flex-row items-stretch gap-3 mt-5', className)}
    {...props}
  >
    {children}
  </div>
);

export const ModalSection = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div className={cx('flex flex-col items-stretch mb-4', className)} {...props}>
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
  ...props
}: {
  variant?: string;
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLSpanElement>) => {
  const resolvedVariant = resolveModalVariant(variant);

  return (
    <span
      className={cx(
        'text-[14px] font-semibold uppercase tracking-[0.5px] mb-2',
        SECTION_LABEL_VARIANT_CLASSES[resolvedVariant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export const RulesText = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cx('text-[16px] leading-[20px] opacity-[0.9]', className)}
    {...props}
  >
    {children}
  </span>
);

export const RulesTextPre = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLSpanElement>) => (
  <RulesText className={cx('whitespace-pre-line', className)} {...props}>
    {children}
  </RulesText>
);

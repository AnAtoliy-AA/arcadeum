import React, { useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { CSSProperties, HTMLAttributes } from 'react';

import { cx } from '@arcadeum/ui/utils/cx';
import {
  Button,
  type GameVariant,
  ModalButton,
  OptionButton,
} from '@arcadeum/ui';
import { CardsGrid, Card as BaseCard } from './cards';

export { ModalButton, OptionButton };

function Overlay({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'flex flex-col items-stretch fixed top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.8)] z-[1000] items-center justify-center',
        className,
      )}
      {...props}
    />
  );
}

interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Modal({ open = false, onOpenChange, children }: ModalProps) {
  const handleOverlayClick = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  if (!open) return null;

  const overlay = (
    <Overlay onClick={handleOverlayClick} data-testid="modal-overlay">
      {children}
    </Overlay>
  );

  if (typeof document !== 'undefined') {
    return createPortal(overlay, document.body);
  }
  return overlay;
}

const MODAL_FRAME_VARIANT_CLASS = {
  cyberpunk: 'rounded-[4px] border-[#c026d3] bg-[rgba(20,0,30,0.95)]',
  underwater: 'border-[#22d3ee] bg-[rgba(8,51,68,0.85)]',
  crime: 'border-[#ef4444]',
  horror: 'border-[#7c3aed]',
  adventure: 'border-[#10b981]',
  'high-altitude-hike': 'border-[#06b6d4]',
  fiver: 'border-[#f59e0b]',
} as const;

function ModalFrame({
  variant,
  className,
  ...props
}: {
  variant?: GameVariant | string;
  className?: string;
} & HTMLAttributes<HTMLDivElement>) {
  const key = (variant ?? '') as keyof typeof MODAL_FRAME_VARIANT_CLASS;
  return (
    <div
      className={cx(
        'flex flex-col items-stretch bg-[var(--background)] border-2 border-[var(--borderColor)] rounded-[24px] max-w-[600px] w-full max-h-[90%] relative overflow-hidden z-[1001]',
        MODAL_FRAME_VARIANT_CLASS[key],
        className,
      )}
      style={{ boxShadow: '0 5px 10px rgba(0, 0, 0, 0.3)' }}
      {...props}
    />
  );
}

function ScrollArea({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'flex flex-col items-stretch overflow-y-auto p-6 w-full h-full',
        className,
      )}
      {...props}
    />
  );
}

export const ModalContent = ({
  children,
  variant,
  onClick,
  ...props
}: {
  children: React.ReactNode;
  variant?: GameVariant;
  onClick?: (e: { stopPropagation: () => void }) => void;
  [key: string]: unknown;
}) => {
  return (
    <ModalFrame
      variant={variant}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        onClick?.({ stopPropagation: () => {} });
      }}
      {...props}
    >
      <ScrollArea>{children}</ScrollArea>
    </ModalFrame>
  );
};

const MODAL_ACCENT_BORDER_CLASS = {
  cyberpunk: 'border-b-[#06b6d4]',
  underwater: 'border-b-[#22d3ee]',
  crime: 'border-b-[#ef4444]',
  horror: 'border-b-[#7c3aed]',
  adventure: 'border-b-[#10b981]',
  'high-altitude-hike': 'border-b-[#06b6d4]',
  fiver: 'border-b-[#f59e0b]',
} as const;

export function ModalHeader({
  className,
  variant,
  ...props
}: { className?: string; variant?: string } & HTMLAttributes<HTMLDivElement>) {
  const key = (variant ?? '') as keyof typeof MODAL_ACCENT_BORDER_CLASS;
  return (
    <div
      className={cx(
        'flex flex-row items-stretch justify-between items-center mb-6 pb-4 border-b-2 border-b-[var(--borderColor)]',
        MODAL_ACCENT_BORDER_CLASS[key],
        className,
      )}
      {...props}
    />
  );
}

const MODAL_ACCENT_TEXT_CLASS = {
  cyberpunk: 'text-[#06b6d4]',
  underwater: 'text-[#22d3ee]',
  crime: 'text-[#ef4444]',
  horror: 'text-[#7c3aed]',
  adventure: 'text-[#10b981]',
  'high-altitude-hike': 'text-[#06b6d4]',
  fiver: 'text-[#f59e0b]',
} as const;

export function ModalTitle({
  className,
  variant,
  ...props
}: {
  className?: string;
  variant?: string;
} & HTMLAttributes<HTMLSpanElement>) {
  const key = (variant ?? '') as keyof typeof MODAL_ACCENT_TEXT_CLASS;
  return (
    <span
      className={cx(
        'text-[24px] font-bold text-[var(--color)]',
        MODAL_ACCENT_TEXT_CLASS[key],
        className,
      )}
      {...props}
    />
  );
}

export const CloseButton = ({
  variant,
  children,
  onClick,
  ...props
}: {
  variant?: GameVariant;
  children?: React.ReactNode;
  onClick?: (e: { stopPropagation: () => void }) => void;
  [key: string]: unknown;
}) => (
  <Button
    className="hover:rotate-[90deg]"
    variant="icon"
    size="sm"
    gameVariant={variant as GameVariant}
    onClick={onClick}
    {...props}
  >
    {children}
  </Button>
);

export function ModalSection({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx('flex flex-col items-stretch mb-6', className)}
      {...props}
    />
  );
}

export function SectionLabel({
  className,
  variant,
  ...props
}: {
  className?: string;
  variant?: string;
} & HTMLAttributes<HTMLSpanElement>) {
  const key = (variant ?? '') as keyof typeof MODAL_ACCENT_TEXT_CLASS;
  return (
    <span
      className={cx(
        'text-[14px] font-semibold uppercase tracking-[0.5px] mb-3',
        MODAL_ACCENT_TEXT_CLASS[key],
        className,
      )}
      {...props}
    />
  );
}

export function OptionGrid({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx('flex flex-row items-stretch flex-wrap gap-3', className)}
      {...props}
    />
  );
}

export function ModalActions({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx('flex flex-row items-stretch gap-3 mt-8', className)}
      {...props}
    />
  );
}

export function ScrollableCardsGrid({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <CardsGrid
      className={cx('max-h-[55vh] overflow-y-auto p-2', className)}
      {...props}
    />
  );
}

export function SelectableCard({
  className,
  style,
  selected,
  variant,
  cardType: _cardType,
  index: _index,
  ...props
}: {
  className?: string;
  style?: CSSProperties;
  selected?: boolean;
  cardType?: unknown;
  index?: unknown;
} & { variant?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <BaseCard
      className={cx(selected ? 'scale-[1.05]' : undefined, className)}
      style={selected ? { ...style, borderColor: 'white' } : style}
      variant={variant}
      {...props}
    />
  );
}

export function RulesText({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx('leading-[24px] opacity-[0.9]', className)}
      {...props}
    />
  );
}

export function RulesTextPre(props: HTMLAttributes<HTMLSpanElement>) {
  return <RulesText className="whitespace-pre-line" {...props} />;
}

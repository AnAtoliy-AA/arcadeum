'use client';

import { memo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
import { CloseIcon } from '../Icons';
import { Button } from '../Button/Button';
import { cx } from '../../utils/cx';

interface BaseModalProps {
  children: ReactNode;
  'data-testid'?: string;
  className?: string;
}

export interface ModalProps extends Omit<BaseModalProps, 'data-testid'> {
  open: boolean;
  onClose?: () => void;
  className?: string;
}

export interface ModalContentProps extends BaseModalProps {
  maxWidth?: string | number;
}

export interface ModalHeaderProps extends BaseModalProps {
  onClose?: () => void;
}

export type ModalTitleProps = BaseModalProps;
export type ModalBodyProps = BaseModalProps;
export type ModalFooterProps = BaseModalProps;

export const Modal = memo(function Modal({
  open,
  onClose,
  className,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Move focus into the dialog on open and restore it to the trigger on close.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement;
    const dialog = dialogRef.current;
    if (
      dialog &&
      previouslyFocused instanceof HTMLElement &&
      !dialog.contains(previouslyFocused)
    ) {
      dialog.focus();
    }
    return () => {
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const content = (
    <div
      className={cx(
        'fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm',
        className,
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        data-state="open"
        className="w-full flex items-center justify-center max-h-full"
      >
        {children}
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(content, document.body)
    : content;
});

export const ModalContent = memo(function ModalContent({
  maxWidth = 600,
  children,
  'data-testid': dataTestId,
  className,
}: ModalContentProps) {
  return (
    <div
      data-testid={dataTestId}
      className={cx(
        'w-[95%] max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden rounded-[20px] border border-[var(--glassBorderStrong)] bg-[var(--background)] text-[var(--color)] p-0 shadow-2xl',
        className,
      )}
      style={{ maxWidth }}
    >
      {children}
    </div>
  );
});

export const ModalHeader = memo(function ModalHeader({
  children,
  onClose,
  'data-testid': dataTestId,
  className,
}: ModalHeaderProps) {
  return (
    <div
      data-testid={dataTestId}
      className={cx(
        'flex items-center justify-between gap-4 border-b border-[var(--glassBorder)] p-4 sm:p-5 shrink-0',
        className,
      )}
    >
      {children}
      {onClose && (
        <Button
          variant="icon"
          size="sm"
          onClick={onClose}
          aria-label="Close modal"
          data-testid="modal-close-button"
          className="text-[var(--color)] hover:text-[var(--primary)] hover:bg-[var(--backgroundHover)]"
        >
          <CloseIcon size={20} />
        </Button>
      )}
    </div>
  );
});

export const ModalTitle = memo(function ModalTitle({
  children,
  'data-testid': dataTestId,
  className,
}: ModalTitleProps) {
  return (
    <span
      data-testid={dataTestId}
      className={cx('text-[17px] font-bold text-[var(--color)]', className)}
    >
      {children}
    </span>
  );
});

export const ModalBody = memo(function ModalBody({
  children,
  'data-testid': dataTestId,
  className,
}: ModalBodyProps) {
  return (
    <div
      data-testid={dataTestId}
      className={cx(
        'flex-1 min-h-0 overflow-y-auto p-4 sm:p-5',
        className,
      )}
    >
      {children}
    </div>
  );
});

export const ModalFooter = memo(function ModalFooter({
  children,
  'data-testid': dataTestId,
  className,
}: ModalFooterProps) {
  return (
    <div
      data-testid={dataTestId}
      className={cx(
        'flex items-center justify-end gap-3 border-t border-[var(--glassBorder)] p-4 sm:p-5 shrink-0',
        className,
      )}
    >
      {children}
    </div>
  );
});

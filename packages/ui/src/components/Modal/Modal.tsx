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
  /** Accessible name when the dialog has no visible title element. */
  ariaLabel?: string;
  /** Id of the visible title element (preferred over `ariaLabel`). */
  ariaLabelledBy?: string;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export interface ModalContentProps extends BaseModalProps {
  maxWidth?: string | number;
}

export interface ModalHeaderProps extends BaseModalProps {
  onClose?: () => void;
  /** Accessible label of the close button (pass a translated string). */
  closeLabel?: string;
}

export type ModalTitleProps = BaseModalProps & { id?: string };
export type ModalBodyProps = BaseModalProps;
export type ModalFooterProps = BaseModalProps;

export const Modal = memo(function Modal({
  open,
  onClose,
  className,
  children,
  ariaLabel,
  ariaLabelledBy,
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
      if (e.key === 'Escape') {
        onClose?.();
        return;
      }
      if (e.key !== 'Tab') return;
      // Focus trap: keep Tab / Shift+Tab cycling inside the dialog.
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusable.length === 0) {
        e.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === dialog)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (!dialog.contains(active)) {
        e.preventDefault();
        first.focus();
      }
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
        aria-label={ariaLabelledBy ? undefined : ariaLabel}
        aria-labelledby={ariaLabelledBy}
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
  closeLabel = 'Close modal',
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
          aria-label={closeLabel}
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
  id,
  'data-testid': dataTestId,
  className,
}: ModalTitleProps) {
  return (
    <span
      id={id}
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
      className={cx('flex-1 min-h-0 overflow-y-auto p-4 sm:p-5', className)}
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

'use client';

import { memo, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { CloseIcon } from '../Icons';
import { Button } from '../Button/Button';

interface BaseModalProps {
  children: ReactNode;
  'data-testid'?: string;
}

export interface ModalProps extends Omit<BaseModalProps, 'data-testid'> {
  open: boolean;
  onClose?: () => void;
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

export const Modal = memo(function Modal({ open, onClose, children }: ModalProps) {
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

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
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
      >
        {children}
      </div>
    </div>
  );
});

export const ModalContent = memo(function ModalContent({ maxWidth = 600, children, 'data-testid': dataTestId }: ModalContentProps) {
  return (
    <div
      data-testid={dataTestId}
      className="w-[95%] rounded-[20px] border border-[var(--glassBorderStrong)] bg-[var(--background)] text-[var(--color)] p-0 shadow-2xl"
      style={{ maxWidth }}
    >
      {children}
    </div>
  );
});

export const ModalHeader = memo(function ModalHeader({ children, onClose, 'data-testid': dataTestId }: ModalHeaderProps) {
  return (
    <div
      data-testid={dataTestId}
      className="flex items-center justify-between gap-4 border-b border-[var(--glassBorder)] p-5"
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

export const ModalTitle = memo(function ModalTitle({ children, 'data-testid': dataTestId }: ModalTitleProps) {
  return (
    <span data-testid={dataTestId} className="text-[17px] font-bold text-[var(--color)]">
      {children}
    </span>
  );
});

export const ModalBody = memo(function ModalBody({ children, 'data-testid': dataTestId }: ModalBodyProps) {
  return (
    <div data-testid={dataTestId} className="max-h-[80vh] overflow-y-auto p-5">
      {children}
    </div>
  );
});

export const ModalFooter = memo(function ModalFooter({ children, 'data-testid': dataTestId }: ModalFooterProps) {
  return (
    <div
      data-testid={dataTestId}
      className="flex items-center justify-end gap-3 border-t border-[var(--glassBorder)] p-5"
    >
      {children}
    </div>
  );
});

'use client';

import { memo, useCallback, useEffect } from 'react';
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
  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
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
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      role="presentation"
    >
      {children}
    </div>
  );
});

export const ModalContent = memo(function ModalContent({ maxWidth = 600, children, 'data-testid': dataTestId }: ModalContentProps) {
  return (
    <div
      data-testid={dataTestId}
      className="w-[95%] rounded-[20px] border border-[var(--borderColor)] bg-[var(--background)] p-0 shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
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
      className="flex items-center justify-between gap-4 border-b border-[var(--borderColor)] p-5"
    >
      {children}
      {onClose && (
        <Button
          variant="icon"
          size="sm"
          onClick={onClose}
          aria-label="Close modal"
          data-testid="modal-close-button"
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
      className="flex items-center justify-end gap-3 border-t border-[var(--borderColor)] p-5"
    >
      {children}
    </div>
  );
});

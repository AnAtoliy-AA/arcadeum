'use client';

import type { CSSProperties, ReactNode } from 'react';

/**
 * Plain overlay+card shell used by shop/admin-shop dialogs. Mirrors the
 * pattern used by tournaments/RegisterConfirm so backgrounds are solid
 * against the dark theme (the @arcadeum/ui Modal is more abstract and
 * needs additional ModalContent wrapping for the same effect).
 */

const OVERLAY_STYLE: CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: 16,
};

const DIALOG_STYLE: CSSProperties = {
  background: '#1a1a2e',
  border: '1px solid #444',
  borderRadius: 12,
  padding: 24,
  minWidth: 340,
  maxWidth: 480,
  width: '100%',
};

interface DialogShellProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  testId?: string;
  /** Pixels of max width override. */
  maxWidth?: number;
}

export function DialogShell({
  open,
  onClose,
  children,
  testId,
  maxWidth,
}: DialogShellProps) {
  if (!open) return null;
  const style = maxWidth ? { ...DIALOG_STYLE, maxWidth } : DIALOG_STYLE;
  return (
    <div
      style={OVERLAY_STYLE}
      data-testid={testId}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={style}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}

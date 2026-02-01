import styled, { keyframes } from 'styled-components';
import { ReactNode, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/shared/ui/Button';

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
}

export interface ModalContentProps {
  maxWidth?: string;
  children: ReactNode;
}

export interface ModalHeaderProps {
  children: ReactNode;
  onClose?: () => void;
}

export interface ModalTitleProps {
  children: ReactNode;
}

export interface ModalBodyProps {
  children: ReactNode;
}

export interface ModalFooterProps {
  children: ReactNode;
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: ${fadeIn} 0.2s ease-out;
`;

const Content = styled.div<{ $maxWidth: string }>`
  background: linear-gradient(
    145deg,
    ${({ theme }) => theme.surfaces.card.background} 0%,
    ${({ theme }) => theme.surfaces.panel.background} 100%
  );
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  border-radius: 20px;
  max-width: ${({ $maxWidth }) => $maxWidth};
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: ${slideUp} 0.3s ease-out;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.surfaces.card.border};
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  letter-spacing: -0.3px;
`;

const Body = styled.div`
  padding: 1.5rem;
`;

const Footer = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.surfaces.card.border};
`;

export function Modal({ open, onClose, children }: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  if (typeof window === 'undefined') return null;

  return createPortal(
    <Overlay onClick={handleOverlayClick} role="dialog" aria-modal="true">
      {children}
    </Overlay>,
    document.body,
  );
}

export function ModalContent({
  maxWidth = '600px',
  children,
}: ModalContentProps) {
  return <Content $maxWidth={maxWidth}>{children}</Content>;
}

export function ModalHeader({ children, onClose }: ModalHeaderProps) {
  return (
    <Header>
      {children}
      {onClose && (
        <Button
          variant="icon"
          size="sm"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </Button>
      )}
    </Header>
  );
}

export function ModalTitle({ children }: ModalTitleProps) {
  return <Title>{children}</Title>;
}

export function ModalBody({ children }: ModalBodyProps) {
  return <Body>{children}</Body>;
}

export function ModalFooter({ children }: ModalFooterProps) {
  return <Footer>{children}</Footer>;
}

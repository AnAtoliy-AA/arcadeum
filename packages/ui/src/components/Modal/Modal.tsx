'use client';

import { Dialog, YStack, XStack, styled, GetProps, TamaguiComponent } from 'tamagui';
import { memo, useCallback } from 'react';
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

const dialogContentConfig = {
  name: 'ModalContent',
  backgroundColor: '$background',
  borderRadius: '$5',
  padding: 0,
  borderWidth: 1,
  borderColor: '$borderColor',
  elevation: '$large',
  width: '95%',
  maxWidth: 600,
  animation: 'medium',
  enterStyle: { x: 0, y: -20, opacity: 0, scale: 0.9 },
  exitStyle: { x: 0, y: 10, opacity: 0, scale: 0.95 },
} as const;

const StyledDialogContent: TamaguiComponent = styled(Dialog.Content, dialogContentConfig);

const dialogOverlayConfig = {
  name: 'ModalOverlay',
  backgroundColor: '$overlayBg',
  animation: 'medium',
  enterStyle: { opacity: 0 },
  exitStyle: { opacity: 0 },
} as const;

const StyledDialogOverlay = styled(Dialog.Overlay, dialogOverlayConfig);

const StyledTitle = styled(Dialog.Title, {
  name: 'ModalTitle',
  fontSize: '$5',
  fontWeight: '700',
  color: '$color',
});

export const Modal = memo(function Modal({ open, onClose, children }: ModalProps) {
  const handleOpenChange = useCallback(
    (val: boolean) => {
      if (!val) {
        onClose?.();
      }
    },
    [onClose]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <StyledDialogOverlay data-testid="modal-overlay" onPress={onClose} key="overlay" />
        {children}
      </Dialog.Portal>
    </Dialog>
  );
});

export const ModalContent = memo(function ModalContent({ maxWidth = 600, children, 'data-testid': dataTestId }: ModalContentProps) {
  return (
    <StyledDialogContent maxWidth={maxWidth} data-testid={dataTestId}>
      {children}
    </StyledDialogContent>
  );
});

export const ModalHeader = memo(function ModalHeader({ children, onClose, 'data-testid': dataTestId }: ModalHeaderProps) {
  return (
    <XStack
      padding="$5"
      justifyContent="space-between"
      alignItems="center"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
      data-testid={dataTestId}
    >
      {children}
      {onClose && (
        <Button variant="icon" size="sm" onClick={onClose} aria-label="Close modal" data-testid="modal-close-button">
          <CloseIcon size={20} />
        </Button>
      )}
    </XStack>
  );
});

export const ModalTitle = memo(function ModalTitle({ children, 'data-testid': dataTestId }: ModalTitleProps) {
  return <StyledTitle data-testid={dataTestId}>{children}</StyledTitle>;
});

export const ModalBody = memo(function ModalBody({ children, 'data-testid': dataTestId }: ModalBodyProps) {
  return (
    <YStack padding="$5" maxHeight="80vh" overflowY="auto" data-testid={dataTestId}>
      {children}
    </YStack>
  );
});

export const ModalFooter = memo(function ModalFooter({ children, 'data-testid': dataTestId }: ModalFooterProps) {
  return (
    <XStack padding="$5" gap="$3" justifyContent="flex-end" borderTopWidth={1} borderTopColor="$borderColor" data-testid={dataTestId}>
      {children}
    </XStack>
  );
});

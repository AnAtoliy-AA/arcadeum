import React, { useCallback } from 'react';
import styled from 'styled-components';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

const MessageText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.text.secondary};
  line-height: 1.5;
`;

export function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
}: ConfirmationModalProps) {
  const handleConfirm = useCallback(() => {
    onConfirm?.();
    onClose();
  }, [onConfirm, onClose]);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent maxWidth="400px">
        <ModalHeader onClose={onClose}>
          <ModalTitle>{title}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <MessageText>{message}</MessageText>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? 'primary' : 'primary'} // Assuming primary is fine, or check if destructive variant exists
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

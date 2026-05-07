import React, { useCallback } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  Button,
  Typography,
} from '@arcadeum/ui';
import { Dialog } from 'tamagui';

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
}: ConfirmationModalProps) {
  const handleConfirm = useCallback(() => {
    onConfirm?.();
    onClose();
  }, [onConfirm, onClose]);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent maxWidth={400}>
        <ModalHeader onClose={onClose}>
          <ModalTitle>{title}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <Typography color="$textSecondary">{message}</Typography>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="secondary"
            onClick={onClose}
            aria-label={cancelLabel}
          >
            {cancelLabel}
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            aria-label={confirmLabel}
          >
            {confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

import { useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@/shared/ui/Modal/Modal';
import { Button } from '@/shared/ui';
import { gamesApi } from '@/features/games/api';

interface InviteCodeModalProps {
  open: boolean;
  onClose: () => void;
}

export function InviteCodeModal({ open, onClose }: InviteCodeModalProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [code, setCode] = useState('');

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: async (inviteCode: string) => {
      // Search for room by invite code
      const response = await gamesApi.getRooms({
        search: inviteCode,
        limit: 50,
      });

      // Find the exact room with this invite code
      const room =
        response.rooms.find((r) => r.inviteCode === inviteCode) ||
        response.rooms[0];

      if (!room) {
        throw new Error(
          t('games.inviteCode.errors.notFound') || 'Room not found',
        );
      }

      return room;
    },
    onSuccess: (room, inviteCode) => {
      onClose();
      // Pass invite code in URL so GameRoomPage auto-joins without re-entering
      router.push(
        `/games/rooms/${room.id}?inviteCode=${encodeURIComponent(inviteCode)}`,
      );
    },
  });

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) return;
    mutate(code);
  };

  const handleClose = () => {
    reset();
    setCode('');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalContent maxWidth="400px">
        <ModalHeader onClose={handleClose}>
          <ModalTitle>
            {t('games.inviteCode.title') || 'Join a Private Game'}
          </ModalTitle>
        </ModalHeader>
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <InputContainer>
              <Label>
                {t('games.inviteCode.label') || 'Enter Invite Code'}
              </Label>
              <Input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  reset();
                }}
                placeholder={t('games.inviteCode.placeholder') || 'e.g. A1B2C3'}
                disabled={isPending}
                autoFocus
              />
              {error && <ErrorMessage>{error.message}</ErrorMessage>}
              <HelperText>
                {t('games.inviteCode.helper') ||
                  'This code was shared by the game host. Type it exactly as shown, without spaces.'}
              </HelperText>
            </InputContainer>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={isPending}
              type="button"
            >
              {t('games.common.cancel') || 'Cancel'}
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isPending || !code.trim()}
            >
              {isPending
                ? t('games.inviteCode.joining') || 'Joining...'
                : t('games.inviteCode.join') || 'Join'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text.secondary};
`;

const Input = styled.input`
  width: 100%;
  background: ${({ theme }) => theme.interactive.option.background};
  border: 1px solid ${({ theme }) => theme.interactive.option.border};
  padding: 0.75rem 1rem;
  border-radius: 8px;
  color: ${({ theme }) => theme.text.primary};
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) =>
      theme.buttons?.primary?.gradientStart || '#3b82f6'};
    background: ${({ theme }) => theme.interactive.option.activeBackground};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const HelperText = styled.p`
  color: ${({ theme }) => theme.text.secondary};
  font-size: 0.8125rem;
  margin-top: 0.5rem;
  line-height: 1.4;
`;

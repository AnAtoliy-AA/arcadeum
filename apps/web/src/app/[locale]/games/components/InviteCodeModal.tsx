import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@/shared/hooks/useMutation';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useRoutes } from '@/shared/config/useRoutes';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  FormGroup,
} from '@arcadeum/ui';
import { gamesApi } from '@/features/games/api';
import { HttpStatus } from '@/shared/lib/http-status';

interface InviteCodeModalProps {
  open: boolean;
  onClose: () => void;
}

export function InviteCodeModal({ open, onClose }: InviteCodeModalProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const routes = useRoutes();
  const { snapshot } = useSessionTokens();
  const [code, setCode] = useState('');

  const { mutate, isLoading, error, reset } = useMutation({
    mutationFn: async (inviteCode: string) => {
      const normalized = inviteCode.trim().toUpperCase();
      try {
        return await gamesApi.getRoomByCode(normalized, {
          token: snapshot.accessToken || undefined,
        });
      } catch (err: unknown) {
        const status =
          err && typeof err === 'object'
            ? ((err as { status?: number; statusCode?: number }).status ??
              (err as { statusCode?: number }).statusCode)
            : undefined;
        if (status === HttpStatus.NOT_FOUND) {
          throw new Error(
            t('games.inviteCode.errors.notFound') || 'Room not found',
          );
        }
        throw err;
      }
    },
    onSuccess: (room) => {
      onClose();
      // Pass invite code in URL so GameRoomPage auto-joins without re-entering
      router.push(
        `${routes.gameRoom(room.id)}?inviteCode=${encodeURIComponent(
          code.trim().toUpperCase(),
        )}`,
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
            <FormGroup
              label={t('games.inviteCode.label') || 'Enter Invite Code'}
              error={error?.message}
              description={
                t('games.inviteCode.helper') ||
                'This code was shared by the game host. Type it exactly as shown, without spaces.'
              }
            >
              <Input
                type="text"
                value={code}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setCode(e.target.value);
                  reset();
                }}
                placeholder={t('games.inviteCode.placeholder') || 'e.g. A1B2C3'}
                disabled={isLoading}
                autoFocus
                fullWidth
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={isLoading}
              type="button"
            >
              {t('games.common.cancel') || 'Cancel'}
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isLoading || !code.trim()}
            >
              {isLoading
                ? t('games.inviteCode.joining') || 'Joining...'
                : t('games.inviteCode.join') || 'Join'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

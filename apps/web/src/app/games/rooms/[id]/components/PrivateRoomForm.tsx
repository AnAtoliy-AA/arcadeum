import React, { useState } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  Card,
  Title,
  Description,
  Form,
  InputGroup,
  Input,
  Button,
  ErrorMessage,
  LockIcon,
  NoticeMessage,
} from './styles';

interface PrivateRoomFormProps {
  onJoin: (code: string) => void;
  isLoading: boolean;
  isLongPending: boolean;
  error: string | null;
}

export function PrivateRoomForm({
  onJoin,
  isLoading,
  isLongPending,
  error,
}: PrivateRoomFormProps) {
  const { t } = useTranslation();
  const [inviteCode, setInviteCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setLocalError(null);
    onJoin(inviteCode);
  };

  const isSubmitting = isLoading;

  return (
    <Card>
      <LockIcon>🔒</LockIcon>
      <Title>{t('games.roomPage.privateRoom.title')}</Title>
      <Description>{t('games.roomPage.privateRoom.description')}</Description>

      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Input
            type="text"
            value={inviteCode}
            onChange={(e) => {
              setInviteCode(e.target.value);
              // Clear local error when typing
              if (localError) setLocalError(null);
            }}
            placeholder={t('games.roomPage.privateRoom.placeholder')}
            disabled={isSubmitting}
            autoFocus
          />
          <Button type="submit" disabled={isSubmitting || !inviteCode.trim()}>
            {isSubmitting ? '...' : t('games.roomPage.privateRoom.joinButton')}
          </Button>
        </InputGroup>

        {isSubmitting && isLongPending && (
          <NoticeMessage>{t('games.room.pendingNotice.message')}</NoticeMessage>
        )}

        {localError && <ErrorMessage>{localError}</ErrorMessage>}
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Form>
    </Card>
  );
}

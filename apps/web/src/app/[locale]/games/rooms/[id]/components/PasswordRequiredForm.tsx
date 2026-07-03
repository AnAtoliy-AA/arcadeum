import React, { useState } from 'react';
import { Button } from '@arcadeum/ui/components/Button/Button';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  Card,
  Title,
  titleGradientStyle,
  Description,
  Form,
  InputGroup,
  Input,
  ErrorMessage,
  LockIcon,
  NoticeMessage,
} from './styles';

interface PasswordRequiredFormProps {
  onJoin: (password: string) => void;
  isLoading: boolean;
  isLongPending: boolean;
  error: string | null;
}

export function PasswordRequiredForm({
  onJoin,
  isLoading,
  isLongPending,
  error,
}: PasswordRequiredFormProps) {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLocalError(null);
    onJoin(password);
  };

  const isSubmitting = isLoading;

  return (
    <Card>
      <LockIcon>🔑</LockIcon>
      <Title style={titleGradientStyle}>
        {t('games.password.joinTitle')}
      </Title>
      <Description>{t('games.password.joinDescription')}</Description>

      <Form {...({ onSubmit: handleSubmit } as Record<string, unknown>)}>
        <InputGroup>
          <Input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (localError) setLocalError(null);
            }}
            placeholder={t('games.password.placeholder')}
            disabled={isSubmitting}
            autoFocus
          />
          <Button
            variant="primary"
            size="md"
            type="submit"
            disabled={isSubmitting || !password.trim()}
            style={{ padding: '0 1.5rem' }}
          >
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

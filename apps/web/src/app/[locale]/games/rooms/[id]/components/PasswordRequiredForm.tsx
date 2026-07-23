import React, { useState } from 'react';
import { Button } from '@arcadeum/ui/components/Button/Button';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  Card,
  IconCircle,
  IconEmoji,
  Title,
  Description,
  DescriptionText,
  Form,
  InputRow,
  Input,
  ErrorMessage,
  ErrorText,
  NoticeMessage,
  cardEnterStyle,
  fadeInUpDelayed,
  errorShakeStyle,
  formAnimationsCss,
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
  const displayError = localError || error;

  return (
    <>
      <style>{formAnimationsCss}</style>
      <Card style={cardEnterStyle}>
        <IconCircle className="icon-pulse">
          <IconEmoji>🔑</IconEmoji>
        </IconCircle>

        <Title style={fadeInUpDelayed('100ms')}>
          {t('games.password.joinTitle')}
        </Title>
        <Description style={fadeInUpDelayed('200ms')}>
          <DescriptionText>
            {t('games.password.joinDescription')}
          </DescriptionText>
        </Description>

        <Form
          {...({ onSubmit: handleSubmit } as Record<string, unknown>)}
          style={fadeInUpDelayed('300ms')}
        >
          <InputRow>
            <Input
              type="password"
              size="md"
              fullWidth
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
              size="lg"
              fullWidth
              type="submit"
              disabled={isSubmitting || !password.trim()}
              loading={isSubmitting}
            >
              {t('games.roomPage.privateRoom.joinButton')}
            </Button>
          </InputRow>

          {isSubmitting && isLongPending && (
            <NoticeMessage>
              {t('games.room.pendingNotice.message')}
            </NoticeMessage>
          )}

          {displayError && (
            <ErrorMessage style={errorShakeStyle}>
              <ErrorText>{displayError}</ErrorText>
            </ErrorMessage>
          )}
        </Form>
      </Card>
    </>
  );
}

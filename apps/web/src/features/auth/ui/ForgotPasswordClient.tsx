'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { YStack } from 'tamagui';
import { Typography } from '@arcadeum/ui/components/Typography/Typography';
import { Button } from '@arcadeum/ui/components/Button/Button';
import { FloatingLabelInput } from '@arcadeum/ui/components/FloatingLabelInput';
import { useLanguage, formatMessage } from '@/shared/i18n/context';
import type { AuthMessages } from '@/shared/i18n/types';
import { isValidEmail } from '../lib/utils';
import { requestPasswordReset } from '@/entities/session/api/authApi';

type ForgotCopy = {
  title: string;
  description: string;
  emailLabel: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successBody: string;
  backToSignIn: string;
  error: string;
  invalidEmail: string;
};

const FALLBACK: ForgotCopy = {
  title: 'Reset your password',
  description:
    "Enter the email tied to your account and we'll send a reset link.",
  emailLabel: 'Email address',
  submit: 'Send reset link',
  submitting: 'Sending...',
  successTitle: 'Check your inbox',
  successBody:
    "If an account exists for {{email}}, we've sent a password-reset link. The link expires in 15 minutes.",
  backToSignIn: 'Back to sign in',
  error: 'Could not send the reset link. Please try again.',
  invalidEmail: 'Please enter a valid email address.',
};

export default function ForgotPasswordClient() {
  const { messages } = useLanguage();
  const copy = mergeCopy(messages.auth?.forgot, FALLBACK);

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'submitting' | 'success' | 'error'
  >('idle');
  const [errorText, setErrorText] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setStatus('error');
      setErrorText(copy.invalidEmail);
      return;
    }
    setStatus('submitting');
    setErrorText('');
    try {
      await requestPasswordReset(email);
      setSubmittedEmail(email);
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorText(copy.error);
    }
  };

  if (status === 'success') {
    return (
      <YStack
        maxWidth={460}
        marginHorizontal="auto"
        paddingVertical="$8"
        paddingHorizontal="$5"
        gap="$4"
        data-testid="forgot-password-success"
      >
        <Typography variant="heading" uiSize="lg" weight="700">
          {copy.successTitle}
        </Typography>
        <Typography variant="body" uiSize="md" color="$colorSubtle">
          {formatMessage(copy.successBody, { email: submittedEmail })}
        </Typography>
        <Link href="/auth" style={{ textDecoration: 'none' }}>
          <Button
            variant="primary"
            uiSize="md"
            data-testid="forgot-password-back"
          >
            {copy.backToSignIn}
          </Button>
        </Link>
      </YStack>
    );
  }

  return (
    <YStack
      maxWidth={460}
      marginHorizontal="auto"
      paddingVertical="$8"
      paddingHorizontal="$5"
      gap="$4"
    >
      <Typography variant="heading" uiSize="lg" weight="700">
        {copy.title}
      </Typography>
      <Typography variant="body" uiSize="md" color="$colorSubtle">
        {copy.description}
      </Typography>
      <form onSubmit={onSubmit} noValidate>
        <YStack gap="$4">
          <FloatingLabelInput
            type="email"
            label={copy.emailLabel}
            value={email}
            onChange={setEmail}
            data-testid="forgot-password-email"
          />
          {status === 'error' && errorText ? (
            <Typography
              variant="body"
              uiSize="sm"
              color="$danger"
              data-testid="forgot-password-error"
            >
              {errorText}
            </Typography>
          ) : null}
          <Button
            type="submit"
            variant="primary"
            uiSize="md"
            disabled={status === 'submitting'}
            data-testid="forgot-password-submit"
          >
            {status === 'submitting' ? copy.submitting : copy.submit}
          </Button>
          <Link
            href="/auth"
            style={{ textDecoration: 'none', alignSelf: 'center' }}
          >
            <Typography variant="body" uiSize="sm" color="$accent" weight="600">
              {copy.backToSignIn}
            </Typography>
          </Link>
        </YStack>
      </form>
    </YStack>
  );
}

function mergeCopy(
  partial: AuthMessages['forgot'] | undefined,
  fallback: ForgotCopy,
): ForgotCopy {
  if (!partial) return fallback;
  return {
    title: partial.title ?? fallback.title,
    description: partial.description ?? fallback.description,
    emailLabel: partial.emailLabel ?? fallback.emailLabel,
    submit: partial.submit ?? fallback.submit,
    submitting: partial.submitting ?? fallback.submitting,
    successTitle: partial.successTitle ?? fallback.successTitle,
    successBody: partial.successBody ?? fallback.successBody,
    backToSignIn: partial.backToSignIn ?? fallback.backToSignIn,
    error: partial.error ?? fallback.error,
    invalidEmail: partial.invalidEmail ?? fallback.invalidEmail,
  };
}

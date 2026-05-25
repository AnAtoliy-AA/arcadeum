'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { YStack } from 'tamagui';
import { Typography } from '@arcadeum/ui/components/Typography/Typography';
import { Button } from '@arcadeum/ui/components/Button/Button';
import { FloatingLabelInput } from '@arcadeum/ui/components/FloatingLabelInput';
import { useLanguage } from '@/shared/i18n/context';
import type { AuthMessages } from '@/shared/i18n/types';
import { confirmPasswordReset } from '@/entities/session/api/authApi';

type ResetCopy = {
  title: string;
  description: string;
  passwordLabel: string;
  confirmLabel: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successBody: string;
  signInCta: string;
  missingToken: string;
  invalidToken: string;
  passwordTooShort: string;
  passwordMismatch: string;
  error: string;
};

const MIN_PASSWORD = 8;

const FALLBACK: ResetCopy = {
  title: 'Choose a new password',
  description: 'Pick something at least 8 characters long.',
  passwordLabel: 'New password',
  confirmLabel: 'Confirm new password',
  submit: 'Update password',
  submitting: 'Updating...',
  successTitle: 'Password updated',
  successBody: 'You can now sign in with your new password.',
  signInCta: 'Continue to sign in',
  missingToken:
    'This link is missing its reset code. Request a new one from the sign-in page.',
  invalidToken:
    'This reset link is invalid or has expired. Request a new one.',
  passwordTooShort: 'Password must be at least 8 characters.',
  passwordMismatch: "Passwords don't match.",
  error: 'Could not update password. Please try again.',
};

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function ResetPasswordClient() {
  const { messages } = useLanguage();
  const copy = mergeCopy(messages.auth?.reset, FALLBACK);
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  // Initial state is derived from `token` so a missing-token URL renders the
  // error inline on first paint — no useEffect/setState round-trip needed.
  const [status, setStatus] = useState<Status>(token ? 'idle' : 'error');
  const [errorText, setErrorText] = useState(token ? '' : copy.missingToken);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      setStatus('error');
      setErrorText(copy.missingToken);
      return;
    }
    if (password.length < MIN_PASSWORD) {
      setStatus('error');
      setErrorText(copy.passwordTooShort);
      return;
    }
    if (password !== confirm) {
      setStatus('error');
      setErrorText(copy.passwordMismatch);
      return;
    }

    setStatus('submitting');
    setErrorText('');
    try {
      await confirmPasswordReset({ token, password });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      const message = err instanceof Error ? err.message : '';
      setErrorText(message === 'TOKEN_INVALID' ? copy.invalidToken : copy.error);
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
        data-testid="reset-password-success"
      >
        <Typography variant="heading" uiSize="lg" weight="700">
          {copy.successTitle}
        </Typography>
        <Typography variant="body" uiSize="md" color="$colorSubtle">
          {copy.successBody}
        </Typography>
        <Link href="/auth" style={{ textDecoration: 'none' }}>
          <Button
            variant="primary"
            uiSize="md"
            data-testid="reset-password-signin-cta"
          >
            {copy.signInCta}
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
            type="password"
            label={copy.passwordLabel}
            value={password}
            onChange={setPassword}
            disabled={!token}
            data-testid="reset-password-input"
          />
          <FloatingLabelInput
            type="password"
            label={copy.confirmLabel}
            value={confirm}
            onChange={setConfirm}
            disabled={!token}
            data-testid="reset-password-confirm"
          />
          {status === 'error' && errorText ? (
            <Typography
              variant="body"
              uiSize="sm"
              color="$danger"
              data-testid="reset-password-error"
            >
              {errorText}
            </Typography>
          ) : null}
          <Button
            type="submit"
            variant="primary"
            uiSize="md"
            disabled={!token || status === 'submitting'}
            data-testid="reset-password-submit"
          >
            {status === 'submitting' ? copy.submitting : copy.submit}
          </Button>
        </YStack>
      </form>
    </YStack>
  );
}

function mergeCopy(
  partial: AuthMessages['reset'] | undefined,
  fallback: ResetCopy,
): ResetCopy {
  if (!partial) return fallback;
  return {
    title: partial.title ?? fallback.title,
    description: partial.description ?? fallback.description,
    passwordLabel: partial.passwordLabel ?? fallback.passwordLabel,
    confirmLabel: partial.confirmLabel ?? fallback.confirmLabel,
    submit: partial.submit ?? fallback.submit,
    submitting: partial.submitting ?? fallback.submitting,
    successTitle: partial.successTitle ?? fallback.successTitle,
    successBody: partial.successBody ?? fallback.successBody,
    signInCta: partial.signInCta ?? fallback.signInCta,
    missingToken: partial.missingToken ?? fallback.missingToken,
    invalidToken: partial.invalidToken ?? fallback.invalidToken,
    passwordTooShort: partial.passwordTooShort ?? fallback.passwordTooShort,
    passwordMismatch: partial.passwordMismatch ?? fallback.passwordMismatch,
    error: partial.error ?? fallback.error,
  };
}

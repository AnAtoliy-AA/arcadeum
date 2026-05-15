'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import { XStack, YStack } from 'tamagui';
import { Typography } from '@arcadeum/ui/components/Typography/Typography';
import { Button } from '@arcadeum/ui/components/Button/Button';
import { FloatingLabelInput } from '@arcadeum/ui/components/FloatingLabelInput';
import { appConfig } from '@/shared/config/app-config';
import type { UseAuthFormResult } from '../hooks/useAuthForm';
import { isValidEmail } from '../lib/utils';
import type { AuthFormLabels } from '../types';
import { ArrowGlyph, MailGlyph } from './AuthProviderIcons';

interface AuthFormCredentialsProps {
  form: AuthFormLabels;
  auth: UseAuthFormResult;
  onRequestMagicLink: (email: string) => void;
}

export function AuthFormCredentials({
  form,
  auth,
  onRequestMagicLink,
}: AuthFormCredentialsProps) {
  const {
    isRegisterMode,
    email,
    password,
    username,
    rememberMe,
    setRememberMe,
    localLoading,
    localError,
    localSubmitDisabled,
    emailFieldId,
    passwordFieldId,
    usernameFieldId,
    showPasswordMismatch,
    showUsernameTooShort,
    showInvalidEmail,
    emailAvailability,
    usernameAvailability,
    handleEmailChange,
    handlePasswordChange,
    handleUsernameChange,
    handleUsernameBlur,
    handleEmailBlur,
    handleLocalSubmit,
  } = auth;

  const [showPassword, setShowPassword] = useState(false);

  const submitLabel = isRegisterMode ? form.submitRegister : form.submitSignIn;
  const canSendMagicLink = isValidEmail(email);

  const emailErrorMessage = getEmailError(
    showInvalidEmail,
    isRegisterMode,
    emailAvailability,
  );
  const usernameErrorMessage = getUsernameError(
    showUsernameTooShort,
    usernameAvailability,
  );

  return (
    <form
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        void handleLocalSubmit(event);
      }}
      noValidate
      data-mode={isRegisterMode ? 'register' : 'login'}
      data-testid="auth-credentials-form"
    >
      <YStack gap="$4">
        <FieldWithMessage error={emailErrorMessage}>
          <FloatingLabelInput
            id={emailFieldId}
            type="email"
            autoComplete="email"
            label={form.emailLabel}
            value={email}
            onChange={(value) =>
              handleEmailChange({
                target: { value },
              } as ChangeEvent<HTMLInputElement>)
            }
            onBlur={() => void handleEmailBlur()}
            required
            disabled={localLoading}
            error={Boolean(emailErrorMessage)}
            data-testid="auth-email-input"
          />
        </FieldWithMessage>

        <FieldWithMessage
          error={showPasswordMismatch ? form.passwordMismatch : undefined}
        >
          <div style={{ position: 'relative' }}>
            <FloatingLabelInput
              id={passwordFieldId}
              type={showPassword ? 'text' : 'password'}
              autoComplete={
                isRegisterMode ? 'new-password' : 'current-password'
              }
              label={form.passwordLabel}
              value={password}
              onChange={(value) =>
                handlePasswordChange({
                  target: { value },
                } as ChangeEvent<HTMLInputElement>)
              }
              required
              disabled={localLoading}
              data-testid="auth-password-input"
            />
            <button
              type="button"
              className="auth-pw-toggle"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? form.hidePassword : form.showPassword}
              data-testid="auth-password-toggle"
              style={passwordToggleStyle}
            >
              {showPassword ? form.hidePassword : form.showPassword}
            </button>
          </div>
        </FieldWithMessage>

        {isRegisterMode && (
          <FieldWithMessage error={usernameErrorMessage}>
            <FloatingLabelInput
              id={usernameFieldId}
              type="text"
              label={form.handleLabel}
              value={username}
              onChange={(value) =>
                handleUsernameChange({
                  target: { value },
                } as ChangeEvent<HTMLInputElement>)
              }
              onBlur={() => void handleUsernameBlur()}
              disabled={localLoading}
              error={Boolean(usernameErrorMessage)}
              data-testid="auth-username-input"
            />
          </FieldWithMessage>
        )}

        {!isRegisterMode && (
          <XStack alignItems="center" justifyContent="space-between" gap="$3">
            <RememberMeCheckbox
              checked={rememberMe}
              onChange={setRememberMe}
              label={form.rememberMe}
            />
            <Link href="/auth/forgot" style={{ textDecoration: 'none' }}>
              <Typography
                variant="body"
                uiSize="sm"
                color="$accent"
                weight="600"
              >
                {form.forgotPassword}
              </Typography>
            </Link>
          </XStack>
        )}

        {localError && (
          <Typography
            variant="body"
            uiSize="sm"
            color="$danger"
            data-testid="auth-credentials-error"
          >
            {localError}
          </Typography>
        )}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={localSubmitDisabled}
          loading={localLoading}
          data-testid="auth-submit-button"
          pill
        >
          <XStack gap="$2" alignItems="center" justifyContent="center">
            <Typography color="inherit" uiSize="md" weight="600">
              {submitLabel}
            </Typography>
            <ArrowGlyph size={14} />
          </XStack>
        </Button>

        {!isRegisterMode && (
          <XStack
            alignItems="center"
            justifyContent="center"
            gap="$2"
            flexWrap="wrap"
            marginTop="$1"
          >
            <Typography variant="body" uiSize="sm" color="$colorMuted">
              {form.magicLinkPrompt}
            </Typography>
            <button
              type="button"
              className="auth-magic-cta"
              onClick={() => onRequestMagicLink(email)}
              disabled={!canSendMagicLink}
              data-testid="auth-magic-link-cta"
              style={magicLinkCtaStyle}
            >
              <MailGlyph size={14} />
              {form.magicLinkCta}
            </button>
          </XStack>
        )}

        <YStack
          paddingTop="$4"
          marginTop="$2"
          borderTopWidth={1}
          borderColor="$glassBorder"
        >
          <Typography
            variant="caption"
            uiSize="xs"
            color="$colorMuted"
            textCenter
          >
            {form.legalPrefix.replace('{{appName}}', appConfig.appName)}
            <Link href="/terms" style={{ textDecoration: 'underline' }}>
              <Typography
                variant="caption"
                uiSize="xs"
                color="$colorMuted"
                weight="600"
              >
                {form.termsLink}
              </Typography>
            </Link>
            {form.legalConjunction}
            <Link href="/privacy" style={{ textDecoration: 'underline' }}>
              <Typography
                variant="caption"
                uiSize="xs"
                color="$colorMuted"
                weight="600"
              >
                {form.privacyLink}
              </Typography>
            </Link>
            {form.legalSuffix}
          </Typography>
        </YStack>
      </YStack>
    </form>
  );
}

function FieldWithMessage({
  error,
  children,
}: {
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <YStack gap="$1">
      {children}
      {error && (
        <Typography variant="body" uiSize="xs" color="$danger">
          {error}
        </Typography>
      )}
    </YStack>
  );
}

function RememberMeCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      data-testid="auth-remember-me"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        color: 'inherit',
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: 5,
          borderWidth: 1.5,
          borderStyle: 'solid',
          borderColor: checked
            ? 'var(--accent, #38bdf8)'
            : 'rgba(255,255,255,0.25)',
          background: checked ? 'var(--accent, #38bdf8)' : 'transparent',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 160ms ease, border-color 160ms ease',
        }}
      >
        {checked && (
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#06121a"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      <Typography variant="body" uiSize="sm" color="$colorMuted">
        {label}
      </Typography>
    </button>
  );
}

function getEmailError(
  showInvalidEmail: boolean,
  isRegisterMode: boolean,
  emailAvailability: string,
): string | undefined {
  if (showInvalidEmail) return 'Please enter a valid email address.';
  if (isRegisterMode && emailAvailability === 'taken')
    return 'This email is already registered.';
  return undefined;
}

function getUsernameError(
  showUsernameTooShort: boolean,
  usernameAvailability: string,
): string | undefined {
  if (showUsernameTooShort) return 'Username must be at least 3 characters.';
  if (usernameAvailability === 'taken')
    return 'This username is already taken.';
  return undefined;
}

const passwordToggleStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  right: 10,
  transform: 'translateY(-50%)',
  background: 'transparent',
  border: 'none',
  color: 'var(--color-muted, #94a3b8)',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  padding: '8px 10px',
  borderRadius: 10,
  transition: 'color 160ms ease, background-color 160ms ease',
};

const magicLinkCtaStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  background: 'transparent',
  border: 'none',
  padding: '4px 8px',
  borderRadius: 8,
  color: 'var(--color, #ecefee)',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
  textDecoration: 'none',
};

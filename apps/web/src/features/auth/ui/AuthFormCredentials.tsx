'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import { Typography } from '@arcadeum/ui/components/Typography/Typography';
import { Button } from '@arcadeum/ui/components/Button/Button';
import { FloatingLabelInput } from '@arcadeum/ui/components/FloatingLabelInput';
import { cx } from '@arcadeum/ui/utils/cx';
import { appConfig } from '@/shared/config/app-config';
import type { UseAuthFormResult } from '../hooks/useAuthForm';
import { isValidEmail } from '../lib/utils';
import type { AuthFormLabels } from '../types';
import { ArrowGlyph, MailGlyph } from './AuthProviderIcons';

interface AvailabilityMessages {
  checking: string;
  available: string;
  taken: string;
}

interface AuthFormCredentialsProps {
  form: AuthFormLabels;
  auth: UseAuthFormResult;
  onRequestMagicLink: (email: string) => void;
  usernameAvailabilityMessages: AvailabilityMessages;
  emailAvailabilityMessages: AvailabilityMessages;
}

export function AuthFormCredentials({
  form,
  auth,
  onRequestMagicLink,
  usernameAvailabilityMessages,
  emailAvailabilityMessages,
}: AuthFormCredentialsProps) {
  const {
    isRegisterMode,
    email,
    password,
    username,
    rememberMe,
    setRememberMe,
    agreeAgeTerms,
    setAgreeAgeTerms,
    localLoading,
    localError,
    localSubmitDisabled,
    emailFieldId,
    passwordFieldId,
    usernameFieldId,
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
    emailAvailabilityMessages.taken,
  );
  const usernameErrorMessage = getUsernameError(
    showUsernameTooShort,
    usernameAvailability,
    usernameAvailabilityMessages.taken,
  );
  const emailDescription =
    isRegisterMode &&
    (emailAvailability === 'checking' || emailAvailability === 'available')
      ? emailAvailability === 'checking'
        ? emailAvailabilityMessages.checking
        : emailAvailabilityMessages.available
      : undefined;
  const usernameDescription =
    usernameAvailability === 'checking' || usernameAvailability === 'available'
      ? usernameAvailability === 'checking'
        ? usernameAvailabilityMessages.checking
        : usernameAvailabilityMessages.available
      : undefined;

  return (
    <form
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        void handleLocalSubmit(event);
      }}
      noValidate
      data-mode={isRegisterMode ? 'register' : 'login'}
      data-testid="auth-credentials-form"
    >
      <div className="flex flex-col items-stretch gap-4">
        <FieldWithMessage
          error={emailErrorMessage}
          description={emailDescription}
        >
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

        <div className="relative">
          <FloatingLabelInput
            id={passwordFieldId}
            type={showPassword ? 'text' : 'password'}
            autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
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
            className="auth-pw-toggle absolute top-1/2 right-2.5 -translate-y-1/2 bg-transparent border-0 text-[var(--color-muted,#94a3b8)] text-xs font-semibold cursor-pointer px-2.5 py-2 rounded-[10px] transition-colors hover:text-white"
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? form.hidePassword : form.showPassword}
            data-testid="auth-password-toggle"
          >
            {showPassword ? form.hidePassword : form.showPassword}
          </button>
        </div>

        {isRegisterMode && (
          <FieldWithMessage
            error={usernameErrorMessage}
            description={usernameDescription}
          >
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
          <div className="flex flex-row items-center justify-between gap-3">
            <RememberMeCheckbox
              checked={rememberMe}
              onChange={setRememberMe}
              label={form.rememberMe}
            />
            <Link href="/auth/forgot" className="no-underline">
              <Typography
                variant="body"
                uiSize="sm"
                color="var(--accent)"
                weight="600"
              >
                {form.forgotPassword}
              </Typography>
            </Link>
          </div>
        )}

        {isRegisterMode && (
          <div className="flex flex-row items-start gap-2.5 pt-1">
            <button
              type="button"
              role="checkbox"
              aria-checked={agreeAgeTerms ? 'true' : 'false'}
              onClick={() => setAgreeAgeTerms(!agreeAgeTerms)}
              data-testid="auth-age-terms-checkbox"
              className={cx(
                'inline-flex items-center justify-center w-[18px] h-[18px] rounded-[5px] border-[1.5px] shrink-0 mt-0.5 transition-colors cursor-pointer',
                agreeAgeTerms
                  ? 'bg-[var(--accent,#38bdf8)] border-[var(--accent,#38bdf8)] text-slate-950'
                  : 'bg-transparent border-white/25 hover:border-white/40',
              )}
            >
              {agreeAgeTerms && (
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
            <div
              onClick={() => setAgreeAgeTerms(!agreeAgeTerms)}
              className="cursor-pointer select-none text-xs text-[var(--textSecondary)] leading-relaxed"
              data-testid="auth-age-terms-label"
            >
              <span>{form.legalAgePrefix}</span>{' '}
              <Link
                href="/terms"
                className="underline text-[var(--textSecondary)] font-semibold hover:text-white"
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                {form.termsLink}
              </Link>{' '}
              <span>{form.legalAgeConjunction}</span>{' '}
              <Link
                href="/privacy"
                className="underline text-[var(--textSecondary)] font-semibold hover:text-white"
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                {form.privacyLink}
              </Link>
              <span>{form.legalAgeSuffix}</span>
            </div>
          </div>
        )}

        {localError && (
          <Typography
            variant="body"
            uiSize="sm"
            color="var(--danger)"
            data-testid="auth-credentials-error"
          >
            {localError}
          </Typography>
        )}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          className="auth-submit-btn rounded-[14px]"
          disabled={localSubmitDisabled}
          loading={localLoading}
          data-testid="auth-submit-button"
        >
          <div className="flex flex-row gap-2 items-center justify-center">
            <Typography color="inherit" uiSize="md" weight="600">
              {submitLabel}
            </Typography>
            <ArrowGlyph size={14} />
          </div>
        </Button>

        {!isRegisterMode && (
          <div className="flex flex-row items-center justify-center gap-2 flex-wrap -mt-1">
            <Typography variant="body" uiSize="sm" color="var(--textSecondary)">
              {form.magicLinkPrompt}
            </Typography>
            <button
              className="auth-magic-cta inline-flex items-center gap-1.5 bg-transparent border-0 px-2 py-1 rounded-lg text-[var(--color,#ecefee)] font-semibold text-[13px] cursor-pointer no-underline hover:text-white"
              type="button"
              onClick={() => onRequestMagicLink(email)}
              disabled={!canSendMagicLink}
              data-testid="auth-magic-link-cta"
            >
              <MailGlyph size={14} />
              {form.magicLinkCta}
            </button>
          </div>
        )}

        {!isRegisterMode && (
          <div className="flex flex-col items-stretch pt-4 -mt-2 border-t border-[var(--glassBorder)]">
            <Typography
              variant="caption"
              uiSize="xs"
              color="var(--textSecondary)"
              textCenter
            >
              {form.legalPrefix.replace('{{appName}}', appConfig.appName)}
              <Link href="/terms" className="underline">
                <Typography
                  variant="caption"
                  uiSize="xs"
                  color="var(--textSecondary)"
                  weight="600"
                >
                  {form.termsLink}
                </Typography>
              </Link>
              {form.legalConjunction}
              <Link href="/privacy" className="underline">
                <Typography
                  variant="caption"
                  uiSize="xs"
                  color="var(--textSecondary)"
                  weight="600"
                >
                  {form.privacyLink}
                </Typography>
              </Link>
              {form.legalSuffix}
            </Typography>
          </div>
        )}
      </div>
    </form>
  );
}

function FieldWithMessage({
  error,
  description,
  children,
}: {
  error?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-stretch gap-1">
      {children}
      {error ? (
        <Typography variant="body" uiSize="xs" color="var(--danger)">
          {error}
        </Typography>
      ) : description ? (
        <Typography variant="body" uiSize="xs" color="var(--textSecondary)">
          {description}
        </Typography>
      ) : null}
    </div>
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
      className="inline-flex items-center gap-2 bg-transparent border-0 p-0 cursor-pointer text-inherit"
    >
      <span
        className={cx(
          'w-[18px] h-[18px] rounded-[5px] border-[1.5px] inline-flex items-center justify-center transition-colors',
          checked
            ? 'bg-[var(--accent,#38bdf8)] border-[var(--accent,#38bdf8)] text-slate-950'
            : 'bg-transparent border-white/25',
        )}
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
      <Typography variant="body" uiSize="sm" color="var(--textSecondary)">
        {label}
      </Typography>
    </button>
  );
}

function getEmailError(
  showInvalidEmail: boolean,
  isRegisterMode: boolean,
  emailAvailability: string,
  takenMessage: string,
): string | undefined {
  if (showInvalidEmail) return 'Please enter a valid email address.';
  if (isRegisterMode && emailAvailability === 'taken') return takenMessage;
  return undefined;
}

function getUsernameError(
  showUsernameTooShort: boolean,
  usernameAvailability: string,
  takenMessage: string,
): string | undefined {
  if (showUsernameTooShort) return 'Username must be at least 3 characters.';
  if (usernameAvailability === 'taken') return takenMessage;
  return undefined;
}

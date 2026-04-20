import { Button } from '@arcadeum/ui/components/Button/Button';
import { GlassCard } from '@arcadeum/ui/components/GlassCard/GlassCard';
import { FormGroup } from '@arcadeum/ui/components/FormGroup/FormGroup';
import { Input } from '@arcadeum/ui/components/Input/Input';
import { Typography } from '@arcadeum/ui/components/Typography/Typography';
import { Badge } from '@arcadeum/ui/components/Badge/Badge';
import { XStack, YStack } from 'tamagui';
import type { UseAuthFormResult } from '../hooks/useAuthForm';
import type { LocalAuthPanelLabels } from '../types';

interface LocalAuthPanelProps {
  labels: LocalAuthPanelLabels;
  auth: UseAuthFormResult;
}

export function LocalAuthPanel({ labels, auth }: LocalAuthPanelProps) {
  const {
    localBadge,
    localHeading,
    localSubtitle,
    emailLabel,
    passwordLabel,
    confirmPasswordLabel,
    usernameLabel,
    referralCodeLabel,
    helperText,
    submitLabel,
    toggleLabel,
    logoutLabel,
    passwordMismatchMessage,
    usernameTooShortMessage,
    invalidEmailMessage,
    processingStatusLabel,
    statusActiveMessage,
    sessionDetailLabels,
    usernameAvailabilityMessages,
    emailAvailabilityMessages,
  } = labels;

  const {
    isRegisterMode,
    email,
    password,
    confirmPassword,
    username,
    referralCode,
    localLoading,
    localError,
    localSubmitDisabled,
    emailFieldId,
    passwordFieldId,
    confirmFieldId,
    usernameFieldId,
    referralCodeFieldId,
    showPasswordMismatch,
    showUsernameTooShort,
    showInvalidEmail,
    usernameAvailability,
    emailAvailability,
    localAccessToken,
    storedEmail,
    storedUsername,
    storedDisplayName,
    handleEmailChange,
    handlePasswordChange,
    handleConfirmChange,
    handleUsernameChange,
    handleReferralCodeChange,
    handleUsernameBlur,
    handleEmailBlur,
    handleLocalSubmit,
    handleToggleMode,
    logoutLocal,
  } = auth;

  const getEmailError = () => {
    if (showInvalidEmail) return invalidEmailMessage;
    if (isRegisterMode && emailAvailability === 'taken')
      return emailAvailabilityMessages.taken;
    return undefined;
  };

  const getEmailDescription = () => {
    if (isRegisterMode) {
      if (emailAvailability === 'checking')
        return emailAvailabilityMessages.checking;
      if (emailAvailability === 'available')
        return emailAvailabilityMessages.available;
    }
    return undefined;
  };

  const getUsernameError = () => {
    if (showUsernameTooShort) return usernameTooShortMessage;
    if (usernameAvailability === 'taken')
      return usernameAvailabilityMessages.taken;
    return undefined;
  };

  const getUsernameDescription = () => {
    if (usernameAvailability === 'checking')
      return usernameAvailabilityMessages.checking;
    if (usernameAvailability === 'available')
      return usernameAvailabilityMessages.available;
    return undefined;
  };

  return (
    <GlassCard flex={1} minWidth={320} minHeight={450} gap="$4" padding="$5">
      <YStack gap="$1">
        <Badge size="sm" variant="neutral" alignSelf="flex-start">
          {localBadge}
        </Badge>
        <Typography variant="heading" uiSize="lg">
          {localHeading}
        </Typography>
        <Typography variant="body" uiSize="sm" color="$colorMuted">
          {localSubtitle}
        </Typography>
      </YStack>

      <form
        onSubmit={handleLocalSubmit}
        noValidate
        data-mode={isRegisterMode ? 'register' : 'login'}
      >
        <YStack gap="$4">
          <FormGroup
            label={emailLabel}
            htmlFor={emailFieldId}
            error={getEmailError()}
            description={getEmailDescription()}
            required
          >
            <Input
              id={emailFieldId}
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              placeholder={emailLabel}
              disabled={localLoading}
              data-testid="auth-email-input"
            />
          </FormGroup>

          <FormGroup label={passwordLabel} htmlFor={passwordFieldId} required>
            <Input
              id={passwordFieldId}
              type="password"
              autoComplete={
                isRegisterMode ? 'new-password' : 'current-password'
              }
              value={password}
              onChange={handlePasswordChange}
              placeholder={passwordLabel}
              disabled={localLoading}
              data-testid="auth-password-input"
            />
          </FormGroup>

          {isRegisterMode && (
            <>
              <FormGroup
                label={confirmPasswordLabel}
                htmlFor={confirmFieldId}
                error={
                  showPasswordMismatch ? passwordMismatchMessage : undefined
                }
                required
              >
                <Input
                  id={confirmFieldId}
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={handleConfirmChange}
                  placeholder={confirmPasswordLabel}
                  disabled={localLoading}
                  data-testid="auth-confirm-password-input"
                />
              </FormGroup>

              <FormGroup
                label={usernameLabel}
                htmlFor={usernameFieldId}
                error={getUsernameError()}
                description={getUsernameDescription()}
              >
                <Input
                  id={usernameFieldId}
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  onBlur={handleUsernameBlur}
                  placeholder={usernameLabel}
                  disabled={localLoading}
                  data-testid="auth-username-input"
                />
              </FormGroup>

              <FormGroup
                label={referralCodeLabel}
                htmlFor={referralCodeFieldId}
                description={helperText}
              >
                <Input
                  id={referralCodeFieldId}
                  type="text"
                  value={referralCode}
                  onChange={handleReferralCodeChange}
                  placeholder={referralCodeLabel}
                  disabled={localLoading}
                  data-testid="auth-referral-input"
                />
              </FormGroup>
            </>
          )}

          {localError && (
            <Typography variant="body" uiSize="xs" color="$error">
              {localError}
            </Typography>
          )}

          <XStack flexWrap="wrap" gap="$3" marginTop="$2">
            <Button
              type="submit"
              disabled={localSubmitDisabled}
              data-testid="auth-submit-button"
              variant="primary"
              pill
            >
              {submitLabel}
            </Button>
            <Button
              type="button"
              onClick={handleToggleMode}
              disabled={localLoading}
              data-testid="auth-toggle-mode-button"
              variant="secondary"
              pill
            >
              {toggleLabel}
            </Button>
          </XStack>
        </YStack>
      </form>

      {localLoading && processingStatusLabel && (
        <Typography variant="body" uiSize="xs" color="$accent">
          {processingStatusLabel}
        </Typography>
      )}

      {localAccessToken && (
        <YStack
          gap="$2"
          padding="$4"
          borderRadius={16}
          borderWidth={1}
          borderColor="$successBorder"
          backgroundColor="$successBgSoft"
        >
          <Typography variant="heading" uiSize="sm">
            {statusActiveMessage}
          </Typography>
          <YStack gap="$1">
            {storedEmail && (
              <Typography variant="body" uiSize="sm" color="$colorMuted">
                {emailLabel}: {storedEmail}
              </Typography>
            )}
            {storedUsername && (
              <Typography variant="body" uiSize="sm" color="$colorMuted">
                {usernameLabel}: {storedUsername}
              </Typography>
            )}
            {storedDisplayName && (
              <Typography variant="body" uiSize="sm" color="$colorMuted">
                {sessionDetailLabels.displayName}: {storedDisplayName}
              </Typography>
            )}
          </YStack>
          <Button
            type="button"
            onClick={() => void logoutLocal()}
            variant="secondary"
            pill
            size="sm"
            alignSelf="flex-start"
            marginTop="$2"
          >
            {logoutLabel}
          </Button>
        </YStack>
      )}
    </GlassCard>
  );
}

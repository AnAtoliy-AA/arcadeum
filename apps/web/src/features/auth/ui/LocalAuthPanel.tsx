import type { ChangeEvent, FormEvent } from 'react';
import {
  PanelCard,
  PanelHeader,
  PanelBadge,
  PanelTitle,
  PanelSubtitle,
  AuthForm,
  Field,
  FieldLabel,
  Input,
  HelperText,
  ErrorText,
  ButtonRow,
  PrimaryButton,
  SecondaryButton,
  StatusText,
  SessionCallout,
  CalloutHeading,
  CalloutDetail,
} from './styles';

export interface LocalAuthPanelLabels {
  localBadge: string;
  localHeading: string;
  localSubtitle: string;
  emailLabel: string;
  passwordLabel: string;
  confirmPasswordLabel: string;
  usernameLabel: string;
  referralCodeLabel: string;
  helperText: string;
  submitLabel: string;
  toggleLabel: string;
  logoutLabel: string;
  passwordMismatchMessage: string;
  usernameTooShortMessage: string;
  invalidEmailMessage: string;
  processingStatusLabel: string;
  statusActiveMessage: string;
  sessionDetailLabels: {
    displayName: string;
  };
  usernameAvailabilityMessages: {
    checking: string;
    available: string;
    taken: string;
  };
  emailAvailabilityMessages: {
    checking: string;
    available: string;
    taken: string;
  };
}

export interface LocalAuthPanelForm {
  isRegisterMode: boolean;
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  referralCode: string;
  localLoading: boolean;
  localError: string | null;
  localSubmitDisabled: boolean;
  emailFieldId: string;
  passwordFieldId: string;
  confirmFieldId: string;
  usernameFieldId: string;
  referralCodeFieldId: string;
  showPasswordMismatch: boolean;
  showUsernameTooShort: boolean;
  showInvalidEmail: boolean;
  usernameAvailability: 'idle' | 'checking' | 'available' | 'taken';
  emailAvailability: 'idle' | 'checking' | 'available' | 'taken';
  localAccessToken: string | null;
  storedEmail: string | null;
  storedUsername: string | null;
  storedDisplayName: string | null;
  handleEmailChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleConfirmChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleUsernameChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleReferralCodeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleUsernameBlur: () => void;
  handleEmailBlur: () => void;
  handleLocalSubmit: (e: FormEvent<HTMLFormElement>) => void;
  handleToggleMode: () => void;
  logoutLocal: () => void;
}

interface LocalAuthPanelProps {
  labels: LocalAuthPanelLabels;
  form: LocalAuthPanelForm;
}

export function LocalAuthPanel({ labels, form }: LocalAuthPanelProps) {
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
  } = form;

  return (
    <PanelCard>
      <PanelHeader>
        <PanelBadge>{localBadge}</PanelBadge>
        <PanelTitle>{localHeading}</PanelTitle>
        <PanelSubtitle>{localSubtitle}</PanelSubtitle>
      </PanelHeader>
      <AuthForm onSubmit={handleLocalSubmit} noValidate>
        <Field>
          <FieldLabel htmlFor={emailFieldId}>{emailLabel}</FieldLabel>
          <Input
            id={emailFieldId}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            placeholder={emailLabel}
            required
            disabled={localLoading}
          />
        </Field>
        {showInvalidEmail ? <ErrorText>{invalidEmailMessage}</ErrorText> : null}
        {isRegisterMode && emailAvailability === 'checking' ? (
          <HelperText>{emailAvailabilityMessages.checking}</HelperText>
        ) : null}
        {isRegisterMode && emailAvailability === 'available' ? (
          <HelperText>{emailAvailabilityMessages.available}</HelperText>
        ) : null}
        {isRegisterMode && emailAvailability === 'taken' ? (
          <ErrorText>{emailAvailabilityMessages.taken}</ErrorText>
        ) : null}
        <Field>
          <FieldLabel htmlFor={passwordFieldId}>{passwordLabel}</FieldLabel>
          <Input
            id={passwordFieldId}
            type="password"
            autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
            value={password}
            onChange={handlePasswordChange}
            placeholder={passwordLabel}
            required
            disabled={localLoading}
          />
        </Field>
        {isRegisterMode ? (
          <>
            <Field>
              <FieldLabel htmlFor={confirmFieldId}>
                {confirmPasswordLabel}
              </FieldLabel>
              <Input
                id={confirmFieldId}
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={handleConfirmChange}
                placeholder={confirmPasswordLabel}
                required
                disabled={localLoading}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={usernameFieldId}>{usernameLabel}</FieldLabel>
              <Input
                id={usernameFieldId}
                type="text"
                value={username}
                onChange={handleUsernameChange}
                onBlur={handleUsernameBlur}
                placeholder={usernameLabel}
                disabled={localLoading}
              />
            </Field>
            {usernameAvailability === 'checking' ? (
              <HelperText>{usernameAvailabilityMessages.checking}</HelperText>
            ) : null}
            {usernameAvailability === 'available' ? (
              <HelperText>{usernameAvailabilityMessages.available}</HelperText>
            ) : null}
            {usernameAvailability === 'taken' ? (
              <ErrorText>{usernameAvailabilityMessages.taken}</ErrorText>
            ) : null}
            <Field>
              <FieldLabel htmlFor={referralCodeFieldId}>
                {referralCodeLabel}
              </FieldLabel>
              <Input
                id={referralCodeFieldId}
                type="text"
                value={referralCode}
                onChange={handleReferralCodeChange}
                placeholder={referralCodeLabel}
                disabled={localLoading}
              />
            </Field>
            <HelperText>{helperText}</HelperText>
          </>
        ) : null}
        {showPasswordMismatch ? (
          <ErrorText>{passwordMismatchMessage}</ErrorText>
        ) : null}
        {showUsernameTooShort ? (
          <ErrorText>{usernameTooShortMessage}</ErrorText>
        ) : null}
        {localError ? <ErrorText>{localError}</ErrorText> : null}
        <ButtonRow>
          <PrimaryButton type="submit" disabled={localSubmitDisabled}>
            {submitLabel}
          </PrimaryButton>
          <SecondaryButton
            type="button"
            onClick={handleToggleMode}
            disabled={localLoading}
          >
            {toggleLabel}
          </SecondaryButton>
        </ButtonRow>
      </AuthForm>
      {localLoading && processingStatusLabel ? (
        <StatusText>{processingStatusLabel}</StatusText>
      ) : null}
      {localAccessToken ? (
        <SessionCallout>
          <CalloutHeading>{statusActiveMessage}</CalloutHeading>
          {storedEmail ? (
            <CalloutDetail>
              {emailLabel}: {storedEmail}
            </CalloutDetail>
          ) : null}
          {storedUsername ? (
            <CalloutDetail>
              {usernameLabel}: {storedUsername}
            </CalloutDetail>
          ) : null}
          {storedDisplayName ? (
            <CalloutDetail>
              {sessionDetailLabels.displayName}: {storedDisplayName}
            </CalloutDetail>
          ) : null}
          <ButtonRow>
            <SecondaryButton type="button" onClick={() => void logoutLocal()}>
              {logoutLabel}
            </SecondaryButton>
          </ButtonRow>
        </SessionCallout>
      ) : null}
    </PanelCard>
  );
}

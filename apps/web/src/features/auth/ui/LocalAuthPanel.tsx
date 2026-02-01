import type { ChangeEvent, FormEvent } from "react";
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
} from "./styles";

interface LocalAuthPanelProps {
  badge: string;
  title: string;
  subtitle: string;
  isRegisterMode: boolean;
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  loading: boolean;
  error: string | null;
  submitDisabled: boolean;
  emailFieldId: string;
  passwordFieldId: string;
  confirmFieldId: string;
  usernameFieldId: string;
  emailLabel: string;
  passwordLabel: string;
  confirmPasswordLabel: string;
  usernameLabel: string;
  helperText: string;
  submitLabel: string;
  toggleLabel: string;
  logoutLabel: string;
  passwordMismatchMessage: string;
  usernameTooShortMessage: string;
  showPasswordMismatch: boolean;
  showUsernameTooShort: boolean;
  processingStatusLabel: string;
  statusActiveMessage: string;
  displayNameLabel: string;
  accessToken: string | null;
  storedEmail: string | null;
  storedUsername: string | null;
  storedDisplayName: string | null;
  onEmailChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onConfirmChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onUsernameChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onToggleMode: () => void;
  onLogout: () => void;
}

export function LocalAuthPanel({
  badge,
  title,
  subtitle,
  isRegisterMode,
  email,
  password,
  confirmPassword,
  username,
  loading,
  error,
  submitDisabled,
  emailFieldId,
  passwordFieldId,
  confirmFieldId,
  usernameFieldId,
  emailLabel,
  passwordLabel,
  confirmPasswordLabel,
  usernameLabel,
  helperText,
  submitLabel,
  toggleLabel,
  logoutLabel,
  passwordMismatchMessage,
  usernameTooShortMessage,
  showPasswordMismatch,
  showUsernameTooShort,
  processingStatusLabel,
  statusActiveMessage,
  displayNameLabel,
  accessToken,
  storedEmail,
  storedUsername,
  storedDisplayName,
  onEmailChange,
  onPasswordChange,
  onConfirmChange,
  onUsernameChange,
  onSubmit,
  onToggleMode,
  onLogout,
}: LocalAuthPanelProps) {
  return (
    <PanelCard>
      <PanelHeader>
        <PanelBadge>{badge}</PanelBadge>
        <PanelTitle>{title}</PanelTitle>
        <PanelSubtitle>{subtitle}</PanelSubtitle>
      </PanelHeader>
      <AuthForm onSubmit={onSubmit} noValidate>
        <Field>
          <FieldLabel htmlFor={emailFieldId}>{emailLabel}</FieldLabel>
          <Input
            id={emailFieldId}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={onEmailChange}
            placeholder={emailLabel}
            required
            disabled={loading}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={passwordFieldId}>{passwordLabel}</FieldLabel>
          <Input
            id={passwordFieldId}
            type="password"
            autoComplete={isRegisterMode ? "new-password" : "current-password"}
            value={password}
            onChange={onPasswordChange}
            placeholder={passwordLabel}
            required
            disabled={loading}
          />
        </Field>
        {isRegisterMode ? (
          <>
            <Field>
              <FieldLabel htmlFor={confirmFieldId}>{confirmPasswordLabel}</FieldLabel>
              <Input
                id={confirmFieldId}
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={onConfirmChange}
                placeholder={confirmPasswordLabel}
                required
                disabled={loading}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={usernameFieldId}>{usernameLabel}</FieldLabel>
              <Input
                id={usernameFieldId}
                type="text"
                value={username}
                onChange={onUsernameChange}
                placeholder={usernameLabel}
                disabled={loading}
              />
            </Field>
            <HelperText>{helperText}</HelperText>
          </>
        ) : null}
        {showPasswordMismatch ? <ErrorText>{passwordMismatchMessage}</ErrorText> : null}
        {showUsernameTooShort ? <ErrorText>{usernameTooShortMessage}</ErrorText> : null}
        {error ? <ErrorText>{error}</ErrorText> : null}
        <ButtonRow>
          <PrimaryButton type="submit" disabled={submitDisabled}>
            {submitLabel}
          </PrimaryButton>
          <SecondaryButton
            type="button"
            onClick={onToggleMode}
            disabled={loading}
          >
            {toggleLabel}
          </SecondaryButton>
        </ButtonRow>
      </AuthForm>
      {loading && processingStatusLabel ? (
        <StatusText>{processingStatusLabel}</StatusText>
      ) : null}
      {accessToken ? (
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
              {displayNameLabel}: {storedDisplayName}
            </CalloutDetail>
          ) : null}
          <ButtonRow>
            <SecondaryButton type="button" onClick={onLogout}>
              {logoutLabel}
            </SecondaryButton>
          </ButtonRow>
        </SessionCallout>
      ) : null}
    </PanelCard>
  );
}

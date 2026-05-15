import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TamaguiProvider } from 'tamagui';
import config from '../../../shared/config/tamagui.config';
import { AuthFormPanel } from './AuthFormPanel';
import type { AuthLabels } from '../hooks/useAuthLabels';
import type { UseAuthFormResult } from '../hooks/useAuthForm';

const baseFormLabels: AuthLabels['form'] = {
  tabSignIn: 'Sign in',
  tabRegister: 'Create account',
  headingSignIn: 'Welcome back.',
  headingRegister: 'Make it official.',
  subSignIn: 'Use one of the buttons below.',
  subRegister: 'Takes 30 seconds.',
  orWithEmail: 'or with email',
  emailLabel: 'Email address',
  passwordLabel: 'Password',
  handleLabel: 'Player handle',
  rememberMe: 'Trust this device',
  forgotPassword: 'Forgot password?',
  showPassword: 'Show',
  hidePassword: 'Hide',
  submitSignIn: 'Sign in',
  submitRegister: 'Create account',
  magicLinkPrompt: "Don't have your password?",
  magicLinkCta: 'Email me a sign-in link',
  magicLinkSentTitle: 'Check your inbox',
  magicLinkSentBody: 'We sent a sign-in link to {{email}}.',
  magicLinkBack: 'Use a different method',
  passwordMismatch: "Passwords don't match.",
  legalPrefix: 'By continuing you agree to {{appName}}’s ',
  legalConjunction: ' and ',
  legalSuffix: '.',
  termsLink: 'Terms',
  privacyLink: 'Privacy Policy',
};

const baseProviders: AuthLabels['providers'] = {
  google: 'Continue with Google',
  googleShort: 'Google',
  apple: 'Continue with Apple',
  appleShort: 'Apple',
  discord: 'Continue with Discord',
  discordShort: 'Discord',
  comingSoon: 'Coming soon',
};

const labels = {
  form: baseFormLabels,
  providers: baseProviders,
  brand: {} as AuthLabels['brand'],
  pwa: {} as AuthLabels['pwa'],
  statusActiveMessage: '',
  statusDescription: '',
  signOutLabel: '',
  sessionDetailLabels: { displayName: '' },
  emailLabel: '',
  usernameLabel: '',
} as unknown as AuthLabels;

function makeAuth(
  overrides: Partial<UseAuthFormResult> = {},
): UseAuthFormResult {
  return {
    isRegisterMode: false,
    email: '',
    password: '',
    username: '',
    referralCode: '',
    rememberMe: true,
    setRememberMe: vi.fn(),
    magicLinkSent: false,
    magicLinkEmail: '',
    emailFieldId: 'email',
    passwordFieldId: 'password',
    usernameFieldId: 'username',
    referralCodeFieldId: 'ref',
    localLoading: false,
    localError: null,
    localAccessToken: null,
    storedEmail: null,
    storedUsername: null,
    storedDisplayName: null,
    localSubmitDisabled: true,
    showUsernameTooShort: false,
    showInvalidEmail: false,
    isEmailValid: false,
    usernameAvailability: 'idle',
    emailAvailability: 'idle',
    oauthLoading: false,
    isRedirecting: false,
    oauthError: null,
    authorizationCode: null,
    providerAccessToken: null,
    handleEmailChange: vi.fn(),
    handlePasswordChange: vi.fn(),
    handleUsernameChange: vi.fn(),
    handleReferralCodeChange: vi.fn(),
    handleUsernameBlur: vi.fn(),
    handleEmailBlur: vi.fn(),
    handleToggleMode: vi.fn(),
    handleLocalSubmit: vi.fn(),
    handleStartOAuth: vi.fn(),
    handleOAuthLogout: vi.fn(),
    handleSignOut: vi.fn(),
    logoutLocal: vi.fn(),
    requestMagicLink: vi.fn(),
    resetMagicLink: vi.fn(),
    hasSession: false,
    isSessionHydrating: false,
    session: {} as UseAuthFormResult['session'],
    sessionSnapshot: {} as UseAuthFormResult['sessionSnapshot'],
    ...overrides,
  } as UseAuthFormResult;
}

function renderPanel(auth: UseAuthFormResult) {
  return render(
    <TamaguiProvider config={config} defaultTheme="dark">
      <AuthFormPanel labels={labels} auth={auth} />
    </TamaguiProvider>,
  );
}

describe('AuthFormPanel', () => {
  it('calls handleToggleMode when switching to the register tab', () => {
    const toggle = vi.fn();
    const auth = makeAuth({ handleToggleMode: toggle });
    renderPanel(auth);
    fireEvent.click(screen.getByTestId('auth-tab-register'));
    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it('does not toggle mode when clicking the already-active tab', () => {
    const toggle = vi.fn();
    const auth = makeAuth({ handleToggleMode: toggle });
    renderPanel(auth);
    fireEvent.click(screen.getByTestId('auth-tab-signin'));
    expect(toggle).not.toHaveBeenCalled();
  });

  it('calls handleStartOAuth with "google" when the Google button is clicked', () => {
    const start = vi.fn();
    const auth = makeAuth({ handleStartOAuth: start });
    renderPanel(auth);
    fireEvent.click(screen.getByTestId('auth-oauth-google'));
    expect(start).toHaveBeenCalledWith('google');
  });

  it('renders Apple and Discord OAuth buttons in a disabled state', () => {
    renderPanel(makeAuth());
    expect(screen.getByTestId('auth-oauth-apple')).toBeDisabled();
    expect(screen.getByTestId('auth-oauth-discord')).toBeDisabled();
  });

  it('disables the submit button while the form is empty', () => {
    renderPanel(makeAuth({ localSubmitDisabled: true }));
    expect(screen.getByTestId('auth-submit-button')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('toggles password visibility when Show/Hide is clicked', () => {
    renderPanel(makeAuth({ password: 'hunter2' }));
    const input = screen.getByTestId('auth-password-input');
    expect(input).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByTestId('auth-password-toggle'));
    expect(input).toHaveAttribute('type', 'text');
  });

  it('disables the magic-link CTA until the email is valid', () => {
    const send = vi.fn();
    renderPanel(makeAuth({ requestMagicLink: send }));
    expect(screen.getByTestId('auth-magic-link-cta')).toBeDisabled();
  });

  it('calls requestMagicLink with the typed email when the CTA is clicked', () => {
    const send = vi.fn();
    renderPanel(
      makeAuth({ email: 'player@example.com', requestMagicLink: send }),
    );
    fireEvent.click(screen.getByTestId('auth-magic-link-cta'));
    expect(send).toHaveBeenCalledWith('player@example.com');
  });

  it('shows the magic-link success state and exposes a back action', () => {
    const reset = vi.fn();
    renderPanel(
      makeAuth({
        magicLinkSent: true,
        magicLinkEmail: 'player@example.com',
        resetMagicLink: reset,
      }),
    );
    expect(screen.getByText('Check your inbox')).toBeInTheDocument();
    expect(
      screen.getByText(/sent a sign-in link to player@example\.com/i),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('auth-magic-link-back'));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('renders the player handle field only in register mode', () => {
    const { rerender } = renderPanel(makeAuth({ isRegisterMode: false }));
    expect(screen.queryByTestId('auth-username-input')).toBeNull();
    rerender(
      <TamaguiProvider config={config} defaultTheme="dark">
        <AuthFormPanel
          labels={labels}
          auth={makeAuth({ isRegisterMode: true })}
        />
      </TamaguiProvider>,
    );
    expect(screen.getByTestId('auth-username-input')).toBeInTheDocument();
  });

  it('renders the magic-link CTA inside the credentials form (sign-in only)', () => {
    renderPanel(makeAuth({ isRegisterMode: false }));
    const cta = screen.getByTestId('auth-magic-link-cta');
    const form = screen.getByTestId('auth-credentials-form');
    expect(form.contains(cta)).toBe(true);
  });

  it('does not render the magic-link CTA in register mode', () => {
    renderPanel(makeAuth({ isRegisterMode: true }));
    expect(screen.queryByTestId('auth-magic-link-cta')).toBeNull();
  });

});

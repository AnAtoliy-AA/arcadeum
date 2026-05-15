import { appConfig } from '../../../config/app-config';

function withAppNamePlaceholder(value: string): string {
  const name = appConfig.appName;
  if (!value || !name || !value.includes(name)) {
    return value;
  }
  return value.split(name).join('{{appName}}');
}

export const en = {
  badge: 'Early access',
  title: 'Sign in to {{appName}}',
  description:
    "We're inviting creators in waves while we finish rolling out secure sign-in for {{appName}}.",
  statusHeadline: 'Web sign-in is rolling out soon.',
  statusDescription:
    "Request early access and we'll notify you when your account is ready, or continue on mobile today.",
  primaryCtaLabel: 'Contact the team',
  secondaryCtaLabel: appConfig.primaryCta.label,
  downloadsTitle: appConfig.downloads.title,
  downloadsDescription: withAppNamePlaceholder(appConfig.downloads.description),
  downloadsIosLabel: appConfig.downloads.iosLabel,
  downloadsAndroidLabel: appConfig.downloads.androidLabel,
  homeLinkLabel: 'Back to home',
  shortcuts: {
    browseGames: 'Browse games without signing in',
  },
  sections: {
    local: 'Email sign-in',
    oauth: 'Google sign-in',
    status: 'Session status',
  },
  providers: {
    guest: 'Guest',
    local: 'Email',
    oauth: 'Google',
  },
  statuses: {
    processing: 'Processing...',
    redirecting: 'Redirecting...',
    loadingSession: 'Loading session...',
  },
  local: {
    loginTitle: 'Sign in with email',
    registerTitle: 'Create an email account',
    helper: {
      allowedCharacters:
        'Usernames can include letters, numbers, underscores, and hyphens.',
    },
    errors: {
      passwordMismatch: 'Passwords do not match.',
      usernameTooShort: 'Username must be at least 3 characters.',
      invalidEmail: 'Please enter a valid email address.',
      usernameTaken: 'This username is already taken.',
      emailTaken: 'This email is already registered.',
      invalidCredentials: 'Invalid email or password.',
      unknownError: 'An error occurred. Please try again.',
    },
    availability: {
      checking: 'Checking...',
      available: 'Available',
    },
  },
  oauth: {
    title: 'Continue with Google',
    loginButton: 'Continue with Google',
    logoutButton: 'Disconnect Google',
    accessTokenLabel: 'Google access token',
    authorizationCodeLabel: 'Authorization code',
    google: 'Continue with Google',
    apple: 'Continue with Apple',
    discord: 'Continue with Discord',
    comingSoon: 'Coming soon',
  },
  form: {
    tabSignIn: 'Sign in',
    tabRegister: 'Create account',
    headingSignIn: 'Welcome back.',
    headingRegister: 'Make it official.',
    subSignIn: "Use one of the buttons below — whichever's fastest.",
    subRegister: 'Takes 30 seconds. Pick a way to start below.',
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
    magicLinkSentBody:
      'We sent a sign-in link to {{email}}. Click it from this device to finish signing in.',
    magicLinkBack: 'Use a different method',
    legal:
      "By continuing you agree to {{appName}}'s {{termsLink}} and {{privacyLink}}.",
    termsLink: 'Terms',
    privacyLink: 'Privacy Policy',
  },
  brand: {
    statusPill: 'All systems normal',
    eyebrow: 'Good to see you again',
    headlinePrefix: 'Pick up right where you',
    headlineHighlight: 'left off.',
    subline:
      "Sign in to jump back into ranked matches, claim today's daily bonus, and check on your tournament bracket.",
    featureOauthTitle: 'One-click sign-in',
    featureOauthDetail: 'Google, Apple, or Discord',
    featureMagicTitle: 'No password?',
    featureMagicDetail: "We'll email you a magic link.",
    featureProgressTitle: 'Your progress is safe',
    featureProgressDetail: 'stats, friends, and unlocks all carry over.',
    proof:
      'Joined by {{count}} players this week — see who’s online in Browse Games.',
    proofCount: '240,000+',
    footHome: '← Back home',
    footGames: 'Browse games',
    footHelp: 'Need help?',
  },
  pwa: {
    title: 'Get the app.',
    body: 'Push alerts for tournament starts and rematch invites.',
    cta: 'Install',
  },
  statusCard: {
    heading: 'Current session',
    description:
      "Manage your {{appName}} web session, review the linked identity, and disconnect when you're done.",
    sessionActive: 'You are signed in on the web.',
    signOutLabel: 'Sign out',
    guestDescription:
      'Your {{appName}} web session details will appear here once you sign in.',
    details: {
      provider: 'Provider',
      displayName: 'Display name',
      userId: 'User ID',
      accessExpires: 'Access expires',
      refreshExpires: 'Refresh expires',
      updated: 'Updated',
      sessionAccessToken: 'Session access token',
      refreshToken: 'Refresh token',
    },
  },
};

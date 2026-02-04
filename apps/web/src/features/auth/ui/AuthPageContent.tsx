'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { appConfig } from '@/shared/config/app-config';
import { routes } from '@/shared/config/routes';
import type { SessionDetailItem } from '../types';
import { formatDateTime } from '../lib/utils';
import { resolveProviderLabel } from '../lib/labels';
import { useAuthLabels } from '../hooks/useAuthLabels';
import { useAuthForm } from '../hooks/useAuthForm';
import { Page, Wrapper, PanelsSection } from './styles';
import { HeroSection } from './HeroSection';
import { LocalAuthPanel } from './LocalAuthPanel';
import { OAuthPanel } from './OAuthPanel';
import { SessionStatusPanel } from './SessionStatusPanel';
import { DownloadSection } from './DownloadSection';

export function AuthPageContent() {
  const router = useRouter();
  const { primaryCta, supportCta, downloads } = appConfig;

  const form = useAuthForm();
  const labels = useAuthLabels(form.isRegisterMode);

  useEffect(() => {
    if (form.hasSession) {
      router.push(routes.games);
    }
  }, [form.hasSession, router]);

  const providerLabel = resolveProviderLabel(
    form.sessionSnapshot.provider,
    undefined,
    undefined,
  );

  const sessionDetails: SessionDetailItem[] = [
    {
      key: 'provider',
      term: labels.sessionDetailLabels.provider,
      value: providerLabel,
    },
    {
      key: 'email',
      term: labels.emailLabel,
      value: form.sessionSnapshot.email,
    },
    {
      key: 'username',
      term: labels.usernameLabel,
      value: form.sessionSnapshot.username,
    },
    {
      key: 'displayName',
      term: labels.sessionDetailLabels.displayName,
      value: form.sessionSnapshot.displayName,
    },
    {
      key: 'userId',
      term: labels.sessionDetailLabels.userId,
      value: form.sessionSnapshot.userId,
    },
    {
      key: 'accessExpires',
      term: labels.sessionDetailLabels.accessExpires,
      value: formatDateTime(form.sessionSnapshot.accessTokenExpiresAt),
    },
    {
      key: 'refreshExpires',
      term: labels.sessionDetailLabels.refreshExpires,
      value: formatDateTime(form.sessionSnapshot.refreshTokenExpiresAt),
    },
    {
      key: 'updated',
      term: labels.sessionDetailLabels.updated,
      value: formatDateTime(form.sessionSnapshot.updatedAt),
    },
  ];

  return (
    <Page>
      <Wrapper>
        <HeroSection
          badgeLabel={labels.badgeLabel}
          title={labels.heroTitle}
          description={labels.heroDescription}
          statusHeadline={labels.heroStatusHeadline}
          statusDescription={labels.heroStatusDescription}
          primaryActionLabel={labels.primaryActionLabel}
          primaryActionHref={supportCta.href}
          secondaryActionLabel={labels.secondaryActionLabel}
          secondaryActionHref={primaryCta.href}
          homeLinkLabel={labels.homeLinkLabel}
          browseGamesLabel={labels.browseGamesLabel}
        />
        <PanelsSection>
          <LocalAuthPanel
            badge={labels.localBadge}
            title={labels.localHeading}
            subtitle={labels.localSubtitle}
            isRegisterMode={form.isRegisterMode}
            email={form.email}
            password={form.password}
            confirmPassword={form.confirmPassword}
            username={form.username}
            loading={form.localLoading}
            error={form.localError}
            submitDisabled={form.localSubmitDisabled}
            emailFieldId={form.emailFieldId}
            passwordFieldId={form.passwordFieldId}
            confirmFieldId={form.confirmFieldId}
            usernameFieldId={form.usernameFieldId}
            emailLabel={labels.emailLabel}
            passwordLabel={labels.passwordLabel}
            confirmPasswordLabel={labels.confirmPasswordLabel}
            usernameLabel={labels.usernameLabel}
            helperText={labels.helperText}
            submitLabel={labels.submitLabel}
            toggleLabel={labels.toggleLabel}
            logoutLabel={labels.logoutLabel}
            passwordMismatchMessage={labels.passwordMismatchMessage}
            usernameTooShortMessage={labels.usernameTooShortMessage}
            showPasswordMismatch={form.showPasswordMismatch}
            showUsernameTooShort={form.showUsernameTooShort}
            showInvalidEmail={form.showInvalidEmail}
            invalidEmailMessage={labels.invalidEmailMessage}
            processingStatusLabel={labels.processingStatusLabel}
            statusActiveMessage={labels.statusActiveMessage}
            displayNameLabel={labels.sessionDetailLabels.displayName}
            accessToken={form.localAccessToken}
            storedEmail={form.storedEmail}
            storedUsername={form.storedUsername}
            storedDisplayName={form.storedDisplayName}
            onEmailChange={form.handleEmailChange}
            onPasswordChange={form.handlePasswordChange}
            onConfirmChange={form.handleConfirmChange}
            onUsernameChange={form.handleUsernameChange}
            onSubmit={form.handleLocalSubmit}
            onToggleMode={form.handleToggleMode}
            onLogout={() => void form.logoutLocal()}
          />
          <OAuthPanel
            badge={labels.oauthBadge}
            title={labels.oauthTitle}
            subtitle={labels.heroStatusDescription}
            buttonLabel={labels.oauthButtonLabel}
            logoutLabel={labels.oauthLogoutLabel}
            processingStatusLabel={labels.processingStatusLabel}
            redirectingStatusLabel={labels.redirectingStatusLabel}
            authorizationCodeLabel={labels.oauthAuthorizationCodeLabel}
            accessTokenLabel={labels.oauthAccessTokenLabel}
            loading={form.oauthLoading}
            isRedirecting={form.isRedirecting}
            error={form.oauthError}
            authorizationCode={form.authorizationCode}
            providerAccessToken={form.providerAccessToken}
            sessionAccessToken={form.sessionSnapshot.accessToken}
            isOAuthProvider={form.sessionSnapshot.provider === 'oauth'}
            onStartOAuth={form.handleStartOAuth}
            onLogout={() => void form.handleOAuthLogout()}
          />
          <SessionStatusPanel
            badge={labels.statusBadge}
            heading={labels.statusHeading}
            description={labels.statusDescription}
            statusActiveMessage={labels.statusActiveMessage}
            heroStatusHeadline={labels.heroStatusHeadline}
            guestDescription={labels.guestDescription}
            signOutLabel={labels.signOutLabel}
            loadingStatusLabel={labels.loadingStatusLabel}
            accessTokenLabel={labels.oauthAccessTokenLabel}
            sessionDetailLabels={labels.sessionDetailLabels}
            isHydrating={form.isSessionHydrating}
            hasSession={form.hasSession}
            isOAuthProvider={form.sessionSnapshot.provider === 'oauth'}
            sessionAccessToken={form.sessionSnapshot.accessToken}
            sessionRefreshToken={form.sessionSnapshot.refreshToken}
            sessionDetails={sessionDetails}
            onSignOut={() => void form.handleSignOut()}
          />
        </PanelsSection>
        <DownloadSection
          title={labels.downloadsTitle}
          description={labels.downloadsDescription}
          iosLabel={labels.downloadsIosLabel}
          androidLabel={labels.downloadsAndroidLabel}
          iosHref={downloads.iosHref}
          androidHref={downloads.androidHref}
        />
      </Wrapper>
    </Page>
  );
}

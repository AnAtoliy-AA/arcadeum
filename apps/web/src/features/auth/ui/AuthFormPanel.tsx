'use client';

import { XStack, YStack } from 'tamagui';
import { GlassCard } from '@arcadeum/ui/components/GlassCard/GlassCard';
import { Typography } from '@arcadeum/ui/components/Typography/Typography';
import { Button } from '@arcadeum/ui/components/Button/Button';
import type { UseAuthFormResult } from '../hooks/useAuthForm';
import type { AuthLabels } from '../hooks/useAuthLabels';
import { AuthFormTabs } from './AuthFormTabs';
import { AuthFormOAuthRow } from './AuthFormOAuthRow';
import { AuthFormCredentials } from './AuthFormCredentials';
import { MailGlyph } from './AuthProviderIcons';

interface AuthFormPanelProps {
  labels: AuthLabels;
  auth: UseAuthFormResult;
  maxWidth?: number;
}

export function AuthFormPanel({
  labels,
  auth,
  maxWidth = 432,
}: AuthFormPanelProps) {
  const { form, providers } = labels;
  const {
    isRegisterMode,
    magicLinkSent,
    magicLinkEmail,
    handleToggleMode,
    handleStartOAuth,
    requestMagicLink,
    resetMagicLink,
    oauthLoading,
    localAccessToken,
  } = auth;

  if (magicLinkSent) {
    return (
      <GlassCard
        width="100%"
        maxWidth={maxWidth}
        borderRadius={24}
        padding="$7"
        gap="$5"
        alignItems="center"
        className="auth-card-enter"
        data-testid="auth-magic-link-success"
      >
        <YStack
          width={64}
          height={64}
          borderRadius={999}
          alignItems="center"
          justifyContent="center"
          marginBottom="$1"
          borderWidth={1}
          style={{
            color: 'var(--accent, #38bdf8)',
            background:
              'color-mix(in srgb, var(--accent, #38bdf8) 14%, transparent)',
            borderColor:
              'color-mix(in srgb, var(--accent, #38bdf8) 35%, transparent)',
          }}
        >
          <MailGlyph size={30} />
        </YStack>
        <YStack gap="$2" alignItems="center">
          <Typography
            variant="heading"
            uiSize="lg"
            weight="700"
            textCenter
          >
            {form.magicLinkSentTitle}
          </Typography>
          <Typography
            variant="body"
            uiSize="sm"
            color="$colorMuted"
            textCenter
          >
            {form.magicLinkSentBody.replace('{{email}}', magicLinkEmail)}
          </Typography>
        </YStack>
        <Button
          variant="secondary"
          borderRadius={14}
          onClick={resetMagicLink}
          data-testid="auth-magic-link-back"
        >
          ← {form.magicLinkBack}
        </Button>
      </GlassCard>
    );
  }

  if (localAccessToken) {
    return <ActiveSessionCard labels={labels} auth={auth} maxWidth={maxWidth} />;
  }

  return (
    <GlassCard
      width="100%"
      maxWidth={maxWidth}
      borderRadius={24}
      paddingHorizontal="$6"
      paddingVertical="$7"
      gap="$5"
      className="auth-card-enter"
      data-testid="auth-form-panel"
    >
      <AuthFormTabs
        isRegisterMode={isRegisterMode}
        signInLabel={form.tabSignIn}
        registerLabel={form.tabRegister}
        onSelectSignIn={() => {
          if (isRegisterMode) handleToggleMode();
        }}
        onSelectRegister={() => {
          if (!isRegisterMode) handleToggleMode();
        }}
      />

      <YStack gap="$2">
        <Typography
          variant="heading"
          uiSize="2xl"
          weight="700"
          style={{ lineHeight: 1.1, letterSpacing: '-0.02em' }}
        >
          {isRegisterMode ? form.headingRegister : form.headingSignIn}
        </Typography>
        <Typography variant="body" uiSize="sm" color="$colorMuted">
          {isRegisterMode ? form.subRegister : form.subSignIn}
        </Typography>
      </YStack>

      <AuthFormOAuthRow
        providers={providers}
        disabled={oauthLoading}
        onSelect={handleStartOAuth}
      />

      <OrDivider label={form.orWithEmail} />

      <AuthFormCredentials
        form={form}
        auth={auth}
        onRequestMagicLink={(emailValue) => void requestMagicLink(emailValue)}
      />
    </GlassCard>
  );
}

function OrDivider({ label }: { label: string }) {
  return (
    <XStack alignItems="center" gap="$3">
      <YStack flex={1} height={1} backgroundColor="$glassBorder" />
      <Typography
        variant="caption"
        uiSize="xs"
        color="$colorMuted"
        weight="600"
        style={{ textTransform: 'uppercase', letterSpacing: '0.16em' }}
      >
        {label}
      </Typography>
      <YStack flex={1} height={1} backgroundColor="$glassBorder" />
    </XStack>
  );
}

function ActiveSessionCard({
  labels,
  auth,
  maxWidth,
}: {
  labels: AuthLabels;
  auth: UseAuthFormResult;
  maxWidth: number;
}) {
  const {
    storedEmail,
    storedDisplayName,
    storedUsername,
    logoutLocal,
    localLoading,
  } = auth;
  return (
    <GlassCard
      width="100%"
      maxWidth={maxWidth}
      borderRadius={24}
      padding="$7"
      gap="$4"
      className="auth-card-enter"
      data-testid="auth-active-session"
    >
      <YStack gap="$1">
        <Typography variant="heading" uiSize="lg" weight="700">
          {labels.statusActiveMessage}
        </Typography>
        <Typography variant="body" uiSize="sm" color="$colorMuted">
          {labels.statusDescription}
        </Typography>
      </YStack>
      <YStack
        gap="$1.5"
        padding="$4"
        borderRadius={16}
        borderWidth={1}
        borderColor="$successBorder"
        backgroundColor="$successBgSoft"
      >
        {storedDisplayName && (
          <Typography variant="body" uiSize="sm">
            {labels.sessionDetailLabels.displayName}: {storedDisplayName}
          </Typography>
        )}
        {storedEmail && (
          <Typography variant="body" uiSize="sm" color="$colorMuted">
            {labels.emailLabel}: {storedEmail}
          </Typography>
        )}
        {storedUsername && (
          <Typography variant="body" uiSize="sm" color="$colorMuted">
            {labels.usernameLabel}: {storedUsername}
          </Typography>
        )}
      </YStack>
      <Button
        variant="secondary"
        borderRadius={14}
        onClick={() => void logoutLocal()}
        disabled={localLoading}
        alignSelf="flex-start"
      >
        {labels.signOutLabel}
      </Button>
    </GlassCard>
  );
}

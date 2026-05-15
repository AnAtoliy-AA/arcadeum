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
import type { AuthFormLabels } from '../types';

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
    email,
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
        padding="$7"
        gap="$5"
        alignItems="center"
        data-testid="auth-magic-link-success"
      >
        <YStack
          width={56}
          height={56}
          borderRadius={999}
          alignItems="center"
          justifyContent="center"
          backgroundColor="$glassBg"
          borderWidth={1}
          borderColor="$glassBorder"
        >
          <MailGlyph size={28} />
        </YStack>
        <YStack gap="$2" alignItems="center">
          <Typography variant="heading" uiSize="lg" weight="700" textCenter>
            {form.magicLinkSentTitle}
          </Typography>
          <Typography variant="body" uiSize="sm" color="$colorMuted" textCenter>
            {form.magicLinkSentBody.replace('{{email}}', magicLinkEmail)}
          </Typography>
        </YStack>
        <Button
          variant="secondary"
          onClick={resetMagicLink}
          pill
          data-testid="auth-magic-link-back"
        >
          ← {form.magicLinkBack}
        </Button>
      </GlassCard>
    );
  }

  if (localAccessToken) {
    return (
      <ActiveSessionCard labels={labels} auth={auth} maxWidth={maxWidth} />
    );
  }

  return (
    <GlassCard
      width="100%"
      maxWidth={maxWidth}
      paddingHorizontal="$6"
      paddingVertical="$7"
      gap="$5"
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
        <Typography variant="heading" uiSize="xl" weight="700">
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

      <AuthFormCredentials form={form} auth={auth} />

      {!isRegisterMode && (
        <MagicLinkPrompt
          email={email}
          form={form}
          onSend={() => void requestMagicLink(email)}
        />
      )}
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
        tracking="md"
        style={{ textTransform: 'uppercase' }}
      >
        {label}
      </Typography>
      <YStack flex={1} height={1} backgroundColor="$glassBorder" />
    </XStack>
  );
}

function MagicLinkPrompt({
  email,
  form,
  onSend,
}: {
  email: string;
  form: AuthFormLabels;
  onSend: () => void;
}) {
  const canSend = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  return (
    <XStack
      alignItems="center"
      justifyContent="center"
      gap="$2"
      flexWrap="wrap"
    >
      <Typography variant="body" uiSize="sm" color="$colorMuted">
        {form.magicLinkPrompt}
      </Typography>
      <button
        type="button"
        onClick={onSend}
        disabled={!canSend}
        data-testid="auth-magic-link-cta"
        style={{
          background: 'transparent',
          border: 'none',
          padding: 0,
          color: 'var(--accent, #38bdf8)',
          fontWeight: 700,
          cursor: canSend ? 'pointer' : 'not-allowed',
          opacity: canSend ? 1 : 0.55,
          textDecoration: 'underline',
          textUnderlineOffset: 4,
        }}
      >
        {form.magicLinkCta}
      </button>
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
      padding="$7"
      gap="$4"
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
        onClick={() => void logoutLocal()}
        disabled={localLoading}
        pill
        alignSelf="flex-start"
      >
        {labels.signOutLabel}
      </Button>
    </GlassCard>
  );
}

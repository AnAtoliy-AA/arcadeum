'use client';

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
        className="w-full rounded-[24px] p-7 gap-5 items-center"
        style={{ maxWidth: maxWidth }}
        data-testid="auth-magic-link-success"
      >
        <div
          className="box-border flex flex-col w-[64px] h-[64px] rounded-[999px] items-center justify-center -mb-1 border"
          style={{
            color: 'var(--accent, #38bdf8)',
            background:
              'color-mix(in srgb, var(--accent, #38bdf8) 14%, transparent)',
            borderColor:
              'color-mix(in srgb, var(--accent, #38bdf8) 35%, transparent)',
          }}
        >
          <MailGlyph size={30} />
        </div>
        <div className="box-border flex flex-col gap-2 items-center">
          <Typography variant="heading" uiSize="lg" weight="700" textCenter>
            {form.magicLinkSentTitle}
          </Typography>
          <Typography variant="body" uiSize="sm" color="$colorMuted" textCenter>
            {form.magicLinkSentBody.replace('{{email}}', magicLinkEmail)}
          </Typography>
        </div>
        <Button
          variant="secondary"
          className="rounded-[14px]"
          onClick={resetMagicLink}
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
      className="w-full rounded-[24px] px-6 py-7 gap-5"
      style={{ maxWidth: maxWidth }}
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

      <div className="box-border flex flex-col items-stretch gap-2">
        <Typography
          variant="heading"
          uiSize="2xl"
          weight="700"
          style={{ letterSpacing: '-0.02em' }}
        >
          {isRegisterMode ? form.headingRegister : form.headingSignIn}
        </Typography>
        <Typography variant="body" uiSize="sm" color="$colorMuted">
          {isRegisterMode ? form.subRegister : form.subSignIn}
        </Typography>
      </div>

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
        usernameAvailabilityMessages={labels.usernameAvailabilityMessages}
        emailAvailabilityMessages={labels.emailAvailabilityMessages}
      />
    </GlassCard>
  );
}

function OrDivider({ label }: { label: string }) {
  return (
    <div className="box-border flex flex-row items-center gap-3">
      <div className="box-border flex flex-col items-stretch flex-1 h-[1px] bg-[var(--glassBorder)]" />
      <Typography
        variant="caption"
        uiSize="xs"
        color="$colorMuted"
        weight="600"
        style={{ textTransform: 'uppercase', letterSpacing: '0.16em' }}
      >
        {label}
      </Typography>
      <div className="box-border flex flex-col items-stretch flex-1 h-[1px] bg-[var(--glassBorder)]" />
    </div>
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
      className="w-full rounded-[24px] p-7 gap-4"
      style={{ maxWidth: maxWidth }}
      data-testid="auth-active-session"
    >
      <div className="box-border flex flex-col items-stretch gap-1">
        <Typography variant="heading" uiSize="lg" weight="700">
          {labels.statusActiveMessage}
        </Typography>
        <Typography variant="body" uiSize="sm" color="$colorMuted">
          {labels.statusDescription}
        </Typography>
      </div>
      <div className="box-border flex flex-col items-stretch gap-null p-4 rounded-[16px] border border-[rgba(4,_120,_87,_0.4)] bg-[rgba(4,_120,_87,_0.1)]">
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
      </div>
      <Button
        variant="secondary"
        className="rounded-[14px] self-start"
        onClick={() => void logoutLocal()}
        disabled={localLoading}
      >
        {labels.signOutLabel}
      </Button>
    </GlassCard>
  );
}

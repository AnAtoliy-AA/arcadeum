'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { GlassCard } from '@arcadeum/ui/components/GlassCard/GlassCard';
import { Typography } from '@arcadeum/ui/components/Typography/Typography';
import { Card } from '@arcadeum/ui/components/Card/Card';
import { FloatingLabelInput } from '@arcadeum/ui/components/FloatingLabelInput';
import { FloatingLabelTextArea } from '@arcadeum/ui/components/FloatingLabelTextArea';
import { LaunchButton } from '@arcadeum/ui/components/LaunchButton';
import { XStack, YStack } from 'tamagui';
import { ContactAvatars } from './ContactAvatars';
import { useContactStyles } from './useContactStyles';
import { submitContactAction, type ContactActionState } from './actions';
import type { ContactMessages } from '@/shared/i18n/messages/legal/types';

type FormCopy = NonNullable<NonNullable<ContactMessages['sections']>['form']>;

const initialContactActionState: ContactActionState = { status: 'idle' };

// Off-screen but still in the DOM so bots see and fill it.
// Avoid `display: none` — some bots skip those.
const honeypotStyle = {
  position: 'absolute' as const,
  left: '-9999px',
  width: '1px',
  height: '1px',
  opacity: 0,
  pointerEvents: 'none' as const,
};

export type ContactFormProps = {
  form?: FormCopy;
};

function SubmitButton({
  idleLabel,
  sendingLabel,
}: {
  idleLabel: string;
  sendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <LaunchButton isLaunching={pending} data-testid="contact-submit-button">
      {pending ? sendingLabel : idleLabel}
    </LaunchButton>
  );
}

export function ContactForm({ form }: ContactFormProps) {
  const s = useContactStyles();

  const [actionState, formAction] = useActionState(
    submitContactAction,
    initialContactActionState,
  );

  const [dismissedState, setDismissedState] = useState<
    typeof actionState | null
  >(null);

  const [formKey, setFormKey] = useState(0);

  const fieldErrors =
    actionState.status === 'invalid' ? actionState.fieldErrors : undefined;
  const showSuccess =
    actionState.status === 'ok' && actionState !== dismissedState;
  const errorState =
    actionState.status === 'error' && actionState !== dismissedState
      ? actionState
      : null;

  const reset = () => {
    setDismissedState(actionState);
    setFormKey((k) => k + 1);
  };

  return (
    <GlassCard>
      <div style={s.formCardInnerStyle}>
        <div style={s.formHeaderStyle}>
          <YStack gap={2}>
            <span style={s.labelChipStyle}>
              {form?.subtitle ?? 'Direct message'}
            </span>
            <Typography variant="heading" uiSize="xl">
              {form?.title ?? 'Send the team a message'}
            </Typography>
          </YStack>
          <XStack alignItems="center" gap="$2">
            <ContactAvatars count={3} size={26} />
            <Typography variant="caption" alpha="medium">
              {form?.repliesNote ?? 'Replies hit your email'}
            </Typography>
          </XStack>
        </div>
        <hr style={s.ruleStyle} aria-hidden="true" />
        {showSuccess ? (
          <Card variant="glass" data-testid="contact-success-message">
            <div style={s.successCardStyle}>
              <div aria-hidden="true" style={s.burstStyle}>
                ✦
              </div>
              <Typography variant="heading" uiSize="lg">
                {form?.successTitle ?? form?.success ?? 'Message away.'}
              </Typography>
              <Typography variant="body" alpha="medium" marginTop="$2">
                {form?.successBody ??
                  'Expect a reply within 4 hours. We sent a copy to your email.'}
              </Typography>
              <YStack alignItems="center" marginTop="$4">
                <button type="button" onClick={reset} style={s.helpLinkStyle}>
                  {form?.sendAnother ?? 'Send another'}
                </button>
              </YStack>
            </div>
          </Card>
        ) : errorState ? (
          <Card variant="glass" data-testid="contact-error-message">
            <div style={s.successCardStyle}>
              <Typography variant="heading" uiSize="lg">
                {form?.errorTitle ?? "We couldn't send your message"}
              </Typography>
              <Typography variant="body" alpha="medium" marginTop="$2">
                {form?.errorBody ??
                  'Something went wrong on our end. You can try again, or open your mail app to send directly.'}
              </Typography>
              <YStack alignItems="center" gap="$3" marginTop="$4">
                <a
                  href={errorState.fallbackMailto}
                  style={s.helpLinkStyle}
                  data-testid="contact-fallback-mailto"
                >
                  {form?.openMail ?? 'Open in your mail app'}
                </a>
                <button type="button" onClick={reset} style={s.helpLinkStyle}>
                  {form?.tryAgain ?? 'Try again'}
                </button>
              </YStack>
            </div>
          </Card>
        ) : (
          <form key={formKey} action={formAction}>
            <YStack gap="$4">
              <div style={s.formGridStyle}>
                <FloatingLabelInput
                  id="contact-name"
                  name="name"
                  label={form?.name ?? form?.nameLabel ?? 'Your name'}
                  required
                  autoComplete="name"
                  error={!!fieldErrors?.name}
                  data-testid="contact-name-input"
                />
                <FloatingLabelInput
                  id="contact-email"
                  name="email"
                  type="email"
                  label={form?.email ?? form?.emailLabel ?? 'Email'}
                  required
                  autoComplete="email"
                  error={!!fieldErrors?.email}
                  data-testid="contact-email-input"
                />
              </div>
              <FloatingLabelInput
                id="contact-subject"
                name="subject"
                label={form?.subject ?? form?.subjectLabel ?? 'Subject'}
                required
                error={!!fieldErrors?.subject}
                data-testid="contact-subject-input"
              />
              <FloatingLabelTextArea
                id="contact-message"
                name="message"
                label={form?.message ?? form?.messageLabel ?? 'Message'}
                required
                maxLength={1200}
                error={!!fieldErrors?.message}
                data-testid="contact-message-textarea"
              />
              <div aria-hidden="true" style={honeypotStyle}>
                <label htmlFor="contact-website">Website</label>
                <input
                  id="contact-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  defaultValue=""
                />
              </div>
              <div style={s.submitRowStyle}>
                <span style={s.privacyStyle}>
                  <span aria-hidden="true">🔒</span>
                  {form?.privacy ?? 'Private — we never share your email.'}
                </span>
                <SubmitButton
                  idleLabel={form?.submit ?? 'Launch message'}
                  sendingLabel={form?.submitting ?? 'Sending…'}
                />
              </div>
            </YStack>
          </form>
        )}
      </div>
    </GlassCard>
  );
}

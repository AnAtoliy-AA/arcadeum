'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { GlassCard } from '@arcadeum/ui/components/GlassCard/GlassCard';
import { Typography } from '@arcadeum/ui/components/Typography/Typography';
import { Card } from '@arcadeum/ui/components/Card/Card';
import { FloatingLabelInput } from '@arcadeum/ui/components/FloatingLabelInput';
import { FloatingLabelTextArea } from '@arcadeum/ui/components/FloatingLabelTextArea';
import { LaunchButton } from '@arcadeum/ui/components/LaunchButton';
import { ContactAvatars } from './ContactAvatars';
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

const LABEL_CHIP_CLASS =
  'text-[11px] font-semibold tracking-[1.4px] uppercase text-[var(--textSecondary)]';

const HELP_LINK_CLASS =
  'inline-flex items-center gap-2 px-[14px] py-2 rounded-[12px] border border-[var(--glassBorder)] bg-[var(--glassBg)] text-[var(--color)] no-underline text-[13.5px]';

const ERROR_TEXT_CLASS = 'text-xs text-[#ef4444] mt-1 leading-[1.3]';

export function ContactForm({ form }: ContactFormProps) {
  const [actionState, formAction] = useActionState(
    submitContactAction,
    initialContactActionState,
  );

  const [dismissedState, setDismissedState] = useState<
    typeof actionState | null
  >(null);

  const [formKey, setFormKey] = useState(0);

  // Captured once per form mount (and re-captured when formKey bumps for
  // "Send another"). BE uses this to reject instant-submit bots — real
  // users take seconds to fill the form, bots POST immediately.
  const [formMountedAt] = useState(() => Date.now());

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
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col items-stretch gap-2">
            <span className={LABEL_CHIP_CLASS}>
              {form?.subtitle ?? 'Direct message'}
            </span>
            <Typography variant="heading" uiSize="xl">
              {form?.title ?? 'Send the team a message'}
            </Typography>
          </div>
          <div className="flex flex-row items-center gap-2">
            <ContactAvatars count={3} size={26} />
            <Typography variant="caption" alpha="medium">
              {form?.repliesNote ?? 'Replies hit your email'}
            </Typography>
          </div>
        </div>
        <hr
          className="border-0 h-px bg-[var(--glassBorder)] my-3"
          aria-hidden="true"
        />
        {showSuccess ? (
          <Card variant="glass" data-testid="contact-success-message">
            <div className="text-center px-6 py-10">
              <div
                aria-hidden="true"
                className="text-[28px] text-[var(--accent)] mb-2"
              >
                ✦
              </div>
              <Typography variant="heading" uiSize="lg">
                {form?.successTitle ?? form?.success ?? 'Message away.'}
              </Typography>
              <Typography variant="body" alpha="medium" className="mt-2">
                {form?.successBody ??
                  'Expect a reply within 4 hours. We sent a copy to your email.'}
              </Typography>
              <div className="flex flex-col items-center -mt-4">
                <button
                  type="button"
                  onClick={reset}
                  className={HELP_LINK_CLASS}
                >
                  {form?.sendAnother ?? 'Send another'}
                </button>
              </div>
            </div>
          </Card>
        ) : errorState ? (
          <Card variant="glass" data-testid="contact-error-message">
            <div className="text-center px-6 py-10">
              <Typography variant="heading" uiSize="lg">
                {form?.errorTitle ?? "We couldn't send your message"}
              </Typography>
              <Typography variant="body" alpha="medium" className="mt-2">
                {form?.errorBody ??
                  'Something went wrong on our end. You can try again, or open your mail app to send directly.'}
              </Typography>
              <div className="flex flex-col items-center gap-3 -mt-4">
                <a
                  href={errorState.fallbackMailto}
                  className={HELP_LINK_CLASS}
                  data-testid="contact-fallback-mailto"
                >
                  {form?.openMail ?? 'Open in your mail app'}
                </a>
                <button
                  type="button"
                  onClick={reset}
                  className={HELP_LINK_CLASS}
                >
                  {form?.tryAgain ?? 'Try again'}
                </button>
              </div>
            </div>
          </Card>
        ) : (
          <form key={formKey} action={formAction}>
            <div className="flex flex-col items-stretch gap-4">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                <div>
                  <FloatingLabelInput
                    id="contact-name"
                    name="name"
                    label={form?.name ?? form?.nameLabel ?? 'Your name'}
                    required
                    autoComplete="name"
                    maxLength={120}
                    error={!!fieldErrors?.name}
                    data-testid="contact-name-input"
                  />
                  {fieldErrors?.name && (
                    <span className={ERROR_TEXT_CLASS} role="alert">
                      {fieldErrors.name}
                    </span>
                  )}
                </div>
                <div>
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
                  {fieldErrors?.email && (
                    <span className={ERROR_TEXT_CLASS} role="alert">
                      {fieldErrors.email}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <FloatingLabelInput
                  id="contact-subject"
                  name="subject"
                  label={form?.subject ?? form?.subjectLabel ?? 'Subject'}
                  required
                  maxLength={200}
                  error={!!fieldErrors?.subject}
                  data-testid="contact-subject-input"
                />
                {fieldErrors?.subject && (
                  <span className={ERROR_TEXT_CLASS} role="alert">
                    {fieldErrors.subject}
                  </span>
                )}
              </div>
              <div>
                <FloatingLabelTextArea
                  id="contact-message"
                  name="message"
                  label={form?.message ?? form?.messageLabel ?? 'Message'}
                  required
                  minLength={10}
                  maxLength={1200}
                  error={!!fieldErrors?.message}
                  data-testid="contact-message-textarea"
                />
                {fieldErrors?.message && (
                  <span className={ERROR_TEXT_CLASS} role="alert">
                    {fieldErrors.message}
                  </span>
                )}
              </div>
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
              <input
                type="hidden"
                name="formMountedAt"
                value={String(formMountedAt)}
              />
              <div className="flex flex-wrap-reverse items-center justify-between gap-3 mt-1">
                <span className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--textSecondary)]">
                  <span aria-hidden="true">🔒</span>
                  {form?.privacy ?? 'Private — we never share your email.'}
                </span>
                <SubmitButton
                  idleLabel={form?.submit ?? 'Launch message'}
                  sendingLabel={form?.submitting ?? 'Sending…'}
                />
              </div>
            </div>
          </form>
        )}
      </div>
    </GlassCard>
  );
}

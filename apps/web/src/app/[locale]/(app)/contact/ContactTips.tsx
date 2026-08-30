import { GlassCard } from '@arcadeum/ui/components/GlassCard/GlassCard';
import { Typography } from '@arcadeum/ui/components/Typography/Typography';
import type { ContactMessages } from '@/shared/i18n/messages/legal/types';

type TipsCopy = NonNullable<NonNullable<ContactMessages['sections']>['tips']>;

export type ContactTipsProps = {
  tips?: TipsCopy;
};

export function ContactTips({ tips }: ContactTipsProps) {
  const items = [
    tips?.orderId ??
      'Include your order ID for refund or payment questions — we can pull the receipt instantly.',
    tips?.bugs ??
      'For bugs: steps to reproduce, your browser, and your device. The more specific, the faster we triage.',
    tips?.screenshots ??
      'Screenshots are welcome — paste them straight into the message field, no need to attach.',
    tips?.account ??
      'For login or account issues, include the email you registered with so we can match the account.',
    tips?.urgent ??
      "Time-sensitive? Add 'urgent' to the subject and we'll route it to the on-call team.",
    tips?.language ??
      'Write in whichever language you think in — we answer in EN, RU, ES, FR, BY.',
  ];
  const footer =
    tips?.footer ??
    'Every message is read by a human on our team — no chatbots, no autoresponders.';
  return (
    <GlassCard>
      <span className="text-[11px] font-semibold tracking-[1.4px] uppercase text-[var(--textSecondary)]">
        {tips?.label ?? 'Faster replies'}
      </span>
      <Typography variant="heading" uiSize="md" className="mt-2">
        {tips?.title ?? 'Help us help you faster'}
      </Typography>
      <div className="flex flex-col items-stretch gap-3 -mt-3">
        {items.map((item, i) => (
          <div className="flex flex-row gap-3 items-start" key={i}>
            <span
              aria-hidden="true"
              className="h-[7px] w-[7px] mt-2 shrink-0 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]"
            />
            <Typography variant="body" alpha="medium">
              {item}
            </Typography>
          </div>
        ))}
      </div>
      <hr
        className="border-0 h-px bg-[var(--glassBorder)] mt-4 mb-3"
        aria-hidden="true"
      />
      <Typography variant="caption" alpha="medium">
        {footer}
      </Typography>
    </GlassCard>
  );
}

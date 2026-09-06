import { GlassCard } from '@arcadeum/ui/components/GlassCard/GlassCard';
import { Typography } from '@arcadeum/ui/components/Typography/Typography';
import { GithubIcon } from './ContactView.icons';
import { ContactAvatars } from './ContactAvatars';
import { appConfig } from '@/shared/config/app-config';
import { formatMessage } from '@/shared/i18n';
import type { ContactMessages } from '@/shared/i18n/messages/legal/types';

export type ContactSidePanelProps = {
  side?: ContactMessages['sections'] extends infer S
    ? S extends { side?: infer V }
      ? V
      : never
    : never;
  workingHours: string;
};

const LABEL_CHIP_CLASS =
  'text-[11px] font-semibold tracking-[1.4px] uppercase text-[var(--textSecondary)]';

export function ContactSidePanel({
  side,
  workingHours,
}: ContactSidePanelProps) {
  return (
    <div className="flex flex-col flex-1 min-w-0 gap-4">
      <GlassCard>
        <span className={LABEL_CHIP_CLASS}>
          {side?.onCall ?? 'On call right now'}
        </span>
        <div className="flex flex-row items-center gap-3 -mt-2">
          <ContactAvatars count={4} size={32} />
          <div className="flex flex-col items-stretch gap-2">
            <Typography weight="700">
              {formatMessage(side?.onCallTeam, { extra: '2' }) ??
                'Maria, Anatoliy +2'}
            </Typography>
            <Typography variant="caption" alpha="medium">
              {side?.onCallRegion ?? 'Support · EU + LATAM'}
            </Typography>
          </div>
        </div>
        <hr
          className="border-0 h-px bg-[var(--glassBorder)] my-3"
          aria-hidden="true"
        />
        <div className="flex flex-col items-stretch gap-2">
          <div className="flex justify-between items-center text-[13.5px]">
            <Typography alpha="medium">
              {side?.medianFirstReply ?? 'Median first reply'}
            </Typography>
            <Typography weight="700">
              {side?.medianFirstReplyValue ?? '4 hr'}
            </Typography>
          </div>
          <div className="flex justify-between items-center text-[13.5px]">
            <Typography alpha="medium">
              {side?.workingHours ?? 'Working hours'}
            </Typography>
            <Typography weight="700">{workingHours}</Typography>
          </div>
          <div className="flex justify-between items-center text-[13.5px]">
            <Typography alpha="medium">
              {side?.coverage ?? 'Coverage'}
            </Typography>
            <Typography weight="700">
              {side?.coverageValue ?? 'GMT-5 → GMT+8'}
            </Typography>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <span className={LABEL_CHIP_CLASS}>
          {side?.devsLabel ?? 'For developers'}
        </span>
        <Typography variant="heading" uiSize="md" className="mt-2">
          {side?.devsTitle ?? 'Bugs & integration'}
        </Typography>
        <Typography variant="body" alpha="medium" className="mt-1">
          {side?.devsBody ??
            'Reproducible bugs, API issues, and SDK questions are tracked in GitHub. We triage within 24 hours.'}
        </Typography>
        {appConfig.social.github ? (
          <div className="flex flex-col items-stretch -mt-3">
            <a
              href={appConfig.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full px-[14px] py-[10px] rounded-[12px] border border-[var(--glassBorder)] bg-[var(--glassBg)] text-[var(--color)] no-underline text-[14px] font-medium"
            >
              <GithubIcon />
              <span>{side?.openIssue ?? 'Open an issue'}</span>
            </a>
          </div>
        ) : null}
      </GlassCard>

      <GlassCard>
        <span className={LABEL_CHIP_CLASS}>
          {side?.press ?? 'Press & partnerships'}
        </span>
        <Typography weight="700" className="mt-2">
          <a
            href={`mailto:${appConfig.supportEmail}`}
            className="text-[var(--accent)] underline"
          >
            {appConfig.supportEmail}
          </a>
        </Typography>
        <Typography variant="caption" alpha="medium" className="mt-1">
          {side?.pressBody ?? 'For media, creators, and partner studios.'}
        </Typography>
      </GlassCard>

      <GlassCard>
        <span className={LABEL_CHIP_CLASS}>
          {side?.statusLabel ?? 'System status'}
        </span>
        <div className="flex flex-row items-center gap-2 -mt-2">
          <span
            aria-hidden="true"
            className="h-[9px] w-[9px] rounded-full shrink-0 bg-emerald-400 shadow-[0_0_8px_#34d399]"
          />
          <Typography weight="700">
            {side?.statusTitle ?? 'All systems operational'}
          </Typography>
        </div>
        <Typography variant="caption" alpha="medium" className="mt-1">
          {side?.statusBody ?? '99.98% uptime over the last 30 days.'}
        </Typography>
        {/* TODO(ARC-575): restore status-page CTA once status.arcadeum.games
            is live. */}
      </GlassCard>
    </div>
  );
}

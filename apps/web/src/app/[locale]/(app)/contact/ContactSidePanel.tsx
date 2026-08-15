'use client';

import { GlassCard } from '@arcadeum/ui/components/GlassCard/GlassCard';
import { Typography } from '@arcadeum/ui/components/Typography/Typography';
import { GithubIcon } from './ContactView.icons';
import { ContactAvatars } from './ContactAvatars';
import { useContactStyles } from './useContactStyles';
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

export function ContactSidePanel({
  side,
  workingHours,
}: ContactSidePanelProps) {
  const s = useContactStyles();
  return (
    <div
      className="box-border flex flex-col items-stretch flex-1 min-w-0"
      style={s.sideStackStyle}
    >
      <GlassCard>
        <span style={s.labelChipStyle}>
          {side?.onCall ?? 'On call right now'}
        </span>
        <div className="box-border flex flex-row items-center gap-3 -mt-2">
          <ContactAvatars count={4} size={32} />
          <div className="box-border flex flex-col items-stretch gap-2">
            <Typography weight="700">
              {formatMessage(side?.onCallTeam, { extra: '2' }) ??
                'Maria, Anatoliy +2'}
            </Typography>
            <Typography variant="caption" alpha="medium">
              {side?.onCallRegion ?? 'Support · EU + LATAM'}
            </Typography>
          </div>
        </div>
        <hr style={s.ruleStyle} aria-hidden="true" />
        <div className="box-border flex flex-col items-stretch gap-2">
          <div style={s.sideRowStyle}>
            <Typography alpha="medium">
              {side?.medianFirstReply ?? 'Median first reply'}
            </Typography>
            <Typography weight="700">
              {side?.medianFirstReplyValue ?? '4 hr'}
            </Typography>
          </div>
          <div style={s.sideRowStyle}>
            <Typography alpha="medium">
              {side?.workingHours ?? 'Working hours'}
            </Typography>
            <Typography weight="700">{workingHours}</Typography>
          </div>
          <div style={s.sideRowStyle}>
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
        <span style={s.labelChipStyle}>
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
          <div className="box-border flex flex-col items-stretch -mt-3">
            <a
              href={appConfig.social.github}
              target="_blank"
              rel="noopener noreferrer"
              style={s.externalIssueLinkStyle}
            >
              <GithubIcon />
              <span>{side?.openIssue ?? 'Open an issue'}</span>
            </a>
          </div>
        ) : null}
      </GlassCard>

      <GlassCard>
        <span style={s.labelChipStyle}>
          {side?.press ?? 'Press & partnerships'}
        </span>
        <Typography weight="700" className="mt-2">
          <a
            href={`mailto:${side?.pressEmail ?? 'hello@arcadeum.games'}`}
            style={{ color: s.tokens.accent, textDecoration: 'underline' }}
          >
            {side?.pressEmail ?? 'hello@arcadeum.games'}
          </a>
        </Typography>
        <Typography variant="caption" alpha="medium" className="mt-1">
          {side?.pressBody ?? 'For media, creators, and partner studios.'}
        </Typography>
      </GlassCard>

      <GlassCard>
        <span style={s.labelChipStyle}>
          {side?.statusLabel ?? 'System status'}
        </span>
        <div className="box-border flex flex-row items-center gap-2 -mt-2">
          <span
            aria-hidden="true"
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: '#34d399',
              boxShadow: '0 0 8px #34d399',
              flexShrink: 0,
            }}
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

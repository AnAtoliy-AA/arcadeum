'use client';

import { GlassCard } from '@arcadeum/ui/components/GlassCard/GlassCard';
import { Typography } from '@arcadeum/ui/components/Typography/Typography';
import { XStack, YStack } from 'tamagui';
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
    <YStack flex={1} minWidth={0} style={s.sideStackStyle}>
      <GlassCard>
        <span style={s.labelChipStyle}>
          {side?.onCall ?? 'On call right now'}
        </span>
        <XStack alignItems="center" gap="$3" marginTop="$2">
          <ContactAvatars count={4} size={32} />
          <YStack gap={2}>
            <Typography fontWeight="700">
              {formatMessage(side?.onCallTeam, { extra: '2' }) ??
                'Maria, Anatoliy +2'}
            </Typography>
            <Typography variant="caption" alpha="medium">
              {side?.onCallRegion ?? 'Support · EU + LATAM'}
            </Typography>
          </YStack>
        </XStack>
        <hr style={s.ruleStyle} aria-hidden="true" />
        <YStack gap="$2">
          <div style={s.sideRowStyle}>
            <Typography alpha="medium">
              {side?.medianFirstReply ?? 'Median first reply'}
            </Typography>
            <Typography fontWeight="700">
              {side?.medianFirstReplyValue ?? '4 hr'}
            </Typography>
          </div>
          <div style={s.sideRowStyle}>
            <Typography alpha="medium">
              {side?.workingHours ?? 'Working hours'}
            </Typography>
            <Typography fontWeight="700">{workingHours}</Typography>
          </div>
          <div style={s.sideRowStyle}>
            <Typography alpha="medium">
              {side?.coverage ?? 'Coverage'}
            </Typography>
            <Typography fontWeight="700">
              {side?.coverageValue ?? 'GMT-5 → GMT+8'}
            </Typography>
          </div>
        </YStack>
      </GlassCard>

      <GlassCard>
        <span style={s.labelChipStyle}>
          {side?.devsLabel ?? 'For developers'}
        </span>
        <Typography variant="heading" uiSize="md" marginTop="$2">
          {side?.devsTitle ?? 'Bugs & integration'}
        </Typography>
        <Typography variant="body" alpha="medium" marginTop="$1">
          {side?.devsBody ??
            'Reproducible bugs, API issues, and SDK questions are tracked in GitHub. We triage within 24 hours.'}
        </Typography>
        {appConfig.social.github ? (
          <YStack marginTop="$3">
            <a
              href={appConfig.social.github}
              target="_blank"
              rel="noopener noreferrer"
              style={s.externalIssueLinkStyle}
            >
              <GithubIcon />
              <span>{side?.openIssue ?? 'Open an issue'}</span>
            </a>
          </YStack>
        ) : null}
      </GlassCard>

      <GlassCard>
        <span style={s.labelChipStyle}>
          {side?.press ?? 'Press & partnerships'}
        </span>
        <Typography fontWeight="700" marginTop="$2">
          <a
            href={`mailto:${side?.pressEmail ?? 'hello@arcadeum.games'}`}
            style={{ color: s.tokens.accent, textDecoration: 'underline' }}
          >
            {side?.pressEmail ?? 'hello@arcadeum.games'}
          </a>
        </Typography>
        <Typography variant="caption" alpha="medium" marginTop="$1">
          {side?.pressBody ?? 'For media, creators, and partner studios.'}
        </Typography>
      </GlassCard>

      <GlassCard>
        <span style={s.labelChipStyle}>
          {side?.statusLabel ?? 'System status'}
        </span>
        <XStack alignItems="center" gap="$2" marginTop="$2">
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
          <Typography fontWeight="700">
            {side?.statusTitle ?? 'All systems operational'}
          </Typography>
        </XStack>
        <Typography variant="caption" alpha="medium" marginTop="$1">
          {side?.statusBody ?? '99.98% uptime over the last 30 days.'}
        </Typography>
        <YStack marginTop="$3">
          <a
            href="https://status.arcadeum.games"
            target="_blank"
            rel="noopener noreferrer"
            style={s.externalIssueLinkStyle}
          >
            <span>{side?.statusLinkLabel ?? 'View status page'}</span>
          </a>
        </YStack>
      </GlassCard>
    </YStack>
  );
}

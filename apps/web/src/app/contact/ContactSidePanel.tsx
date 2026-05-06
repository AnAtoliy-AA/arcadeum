'use client';

import { GlassCard } from '@arcadeum/ui/components/GlassCard/GlassCard';
import { Typography } from '@arcadeum/ui/components/Typography/Typography';
import { YStack } from 'tamagui';
import { GithubIcon } from './ContactView.icons';
import {
  externalIssueLinkStyle,
  labelChipStyle,
  ruleStyle,
  sideRowStyle,
  sideStackStyle,
} from './ContactView.styles';
import type { ContactMessages } from '@/shared/i18n/messages/legal/types';

export type ContactSidePanelProps = {
  side?: ContactMessages['sections'] extends infer S
    ? S extends { side?: infer V }
      ? V
      : never
    : never;
  workingHours: string;
  supportEmail: string;
};

export function ContactSidePanel({
  side,
  workingHours,
  supportEmail,
}: ContactSidePanelProps) {
  return (
    <YStack flex={1} minWidth={0} style={sideStackStyle}>
      <GlassCard>
        <span style={labelChipStyle}>
          {side?.onCall ?? 'On call right now'}
        </span>
        <Typography fontWeight="700" marginTop="$2">
          Maria, Anatoliy +2
        </Typography>
        <Typography variant="caption" alpha="medium">
          Support · EU + LATAM
        </Typography>
        <hr style={ruleStyle} aria-hidden="true" />
        <YStack gap="$2">
          <div style={sideRowStyle}>
            <Typography alpha="medium">
              {side?.medianFirstReply ?? 'Median first reply'}
            </Typography>
            <Typography fontWeight="700">4 hr</Typography>
          </div>
          <div style={sideRowStyle}>
            <Typography alpha="medium">
              {side?.workingHours ?? 'Working hours'}
            </Typography>
            <Typography fontWeight="700">{workingHours}</Typography>
          </div>
          <div style={sideRowStyle}>
            <Typography alpha="medium">
              {side?.coverage ?? 'Coverage'}
            </Typography>
            <Typography fontWeight="700">GMT-5 → GMT+8</Typography>
          </div>
        </YStack>
      </GlassCard>

      <GlassCard>
        <span style={labelChipStyle}>For developers</span>
        <Typography variant="heading" uiSize="md" marginTop="$2">
          {side?.devsTitle ?? 'Bugs & integration'}
        </Typography>
        <Typography variant="body" alpha="medium" marginTop="$1">
          {side?.devsBody ??
            'Reproducible bugs, API issues, and SDK questions are tracked in GitHub. We triage within 24 hours.'}
        </Typography>
        <YStack marginTop="$3">
          <a
            href="https://github.com/arcadeum"
            target="_blank"
            rel="noopener noreferrer"
            style={externalIssueLinkStyle}
          >
            <GithubIcon />
            <span>{side?.openIssue ?? 'Open an issue'}</span>
          </a>
        </YStack>
      </GlassCard>

      <GlassCard>
        <span style={labelChipStyle}>
          {side?.press ?? 'Press & partnerships'}
        </span>
        <Typography fontWeight="700" marginTop="$2">
          <a
            href={`mailto:${supportEmail}`}
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {supportEmail}
          </a>
        </Typography>
        <Typography variant="caption" alpha="medium" marginTop="$1">
          {side?.pressBody ?? 'For media, creators, and partner studios.'}
        </Typography>
        <Typography variant="caption" alpha="medium" marginTop="$2">
          <a
            href={`mailto:${side?.pressEmail ?? 'hello@arcadeum.games'}`}
            style={{ color: 'inherit' }}
          >
            {side?.pressEmail ?? 'hello@arcadeum.games'}
          </a>
        </Typography>
      </GlassCard>
    </YStack>
  );
}

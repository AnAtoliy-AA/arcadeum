import Link from 'next/link';
import { GlassCard } from '@arcadeum/ui/components/GlassCard/GlassCard';
import { Badge } from '@arcadeum/ui/components/Badge/Badge';
import { PageTitle } from '@arcadeum/ui/components/PageTitle/PageTitle';
import { Typography } from '@arcadeum/ui/components/Typography/Typography';
import { Button } from '@arcadeum/ui/components/Button/Button';
import { XStack, YStack } from 'tamagui';

import type { HeroSectionLabels } from '../types';

export interface HeroSectionConfig {
  primaryActionHref: string;
  secondaryActionHref: string;
}

interface HeroSectionProps {
  labels: HeroSectionLabels;
  config: HeroSectionConfig;
}

export function HeroSection({ labels, config }: HeroSectionProps) {
  const {
    badgeLabel,
    heroTitle,
    heroDescription,
    heroStatusHeadline,
    heroStatusDescription,
    primaryActionLabel,
    secondaryActionLabel,
    homeLinkLabel,
    browseGamesLabel,
  } = labels;

  const { primaryActionHref, secondaryActionHref } = config;

  return (
    <GlassCard gap="$5" padding="$7">
      <Badge size="sm" variant="neutral" alignSelf="flex-start">
        {badgeLabel}
      </Badge>

      <PageTitle>{heroTitle}</PageTitle>

      <Typography variant="body" uiSize="lg" color="$colorMuted">
        {heroDescription}
      </Typography>

      <YStack
        gap="$2"
        padding="$5"
        borderRadius={18}
        borderWidth={1}
        borderColor="$borderColor"
        backgroundColor="$backgroundHover"
      >
        <Typography variant="heading" uiSize="md">
          {heroStatusHeadline}
        </Typography>
        <Typography variant="body" uiSize="md" color="$colorMuted">
          {heroStatusDescription}
        </Typography>

        <XStack flexWrap="wrap" gap="$3" marginTop="$2">
          <Link href={primaryActionHref} passHref>
            <Button variant="primary" size="md">
              {primaryActionLabel}
            </Button>
          </Link>
          <Link href={secondaryActionHref} passHref>
            <Button variant="secondary" size="md">
              {secondaryActionLabel}
            </Button>
          </Link>
        </XStack>
      </YStack>

      <Link href="/" passHref style={{ textDecoration: 'none' }}>
        <XStack alignItems="center" gap="$1.5">
          <Typography color="$accent" weight="600">
            ← {homeLinkLabel}
          </Typography>
        </XStack>
      </Link>

      <XStack flexWrap="wrap" gap="$3">
        <Link href="/games" passHref style={{ textDecoration: 'none' }}>
          <XStack alignItems="center" gap="$1.5">
            <Typography color="$accent" weight="600">
              → {browseGamesLabel}
            </Typography>
          </XStack>
        </Link>
      </XStack>
    </GlassCard>
  );
}

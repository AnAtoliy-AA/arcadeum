import Link from 'next/link';
import { XStack, YStack } from 'tamagui';
import { Typography } from '@arcadeum/ui/components/Typography/Typography';
import { appConfig } from '@/shared/config/app-config';
import type { AuthBrandLabels } from '../types';

interface AuthBrandPanelProps {
  brand: AuthBrandLabels;
  flex?: number;
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
  'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
  'linear-gradient(135deg, #22d3ee 0%, #14b8a6 100%)',
  'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
];

export function AuthBrandPanel({ brand, flex = 1.05 }: AuthBrandPanelProps) {
  return (
    <YStack
      flex={flex}
      paddingHorizontal="$8"
      paddingVertical="$8"
      gap="$8"
      backgroundColor="$backgroundHover"
      borderRightWidth={1}
      borderColor="$glassBorder"
      justifyContent="space-between"
      $md={{
        borderRightWidth: 0,
        borderBottomWidth: 1,
        paddingHorizontal: '$5',
        paddingVertical: '$6',
        gap: '$6',
      }}
      data-testid="auth-brand-panel"
    >
      <BrandHeader brand={brand} />
      <BrandHero brand={brand} />
      <BrandFooterLinks brand={brand} />
    </YStack>
  );
}

function BrandHeader({ brand }: { brand: AuthBrandLabels }) {
  return (
    <XStack alignItems="center" justifyContent="space-between" gap="$3">
      <Link href="/" style={{ textDecoration: 'none' }}>
        <XStack alignItems="center" gap="$2">
          <YStack
            width={36}
            height={36}
            borderRadius={10}
            style={{
              background:
                'linear-gradient(135deg, #38bdf8 0%, #a855f7 50%, #ec4899 100%)',
            }}
          />
          <Typography variant="heading" uiSize="md" weight="700">
            {appConfig.appName}
          </Typography>
        </XStack>
      </Link>
      <XStack
        alignItems="center"
        gap="$2"
        paddingHorizontal="$3"
        paddingVertical="$1.5"
        borderRadius={999}
        borderWidth={1}
        borderColor="$glassBorder"
        backgroundColor="$glassBg"
      >
        <YStack
          width={8}
          height={8}
          borderRadius={999}
          backgroundColor="#22c55e"
        />
        <Typography variant="caption" uiSize="xs" color="$colorMuted">
          {brand.statusPill}
        </Typography>
      </XStack>
    </XStack>
  );
}

function BrandHero({ brand }: { brand: AuthBrandLabels }) {
  return (
    <YStack gap="$5" maxWidth={520}>
      <XStack
        alignSelf="flex-start"
        alignItems="center"
        gap="$2"
        paddingHorizontal="$3"
        paddingVertical="$1.5"
        borderRadius={999}
        borderWidth={1}
        borderColor="$glassBorder"
        backgroundColor="$glassBg"
      >
        <Typography variant="caption" uiSize="xs" color="$accent" weight="600">
          {brand.eyebrow}
        </Typography>
      </XStack>

      <YStack gap="$2">
        <Typography
          variant="heading"
          uiSize="3xl"
          weight="700"
          style={{ lineHeight: 1.05 }}
        >
          {brand.headlinePrefix}{' '}
          <Typography
            variant="heading"
            uiSize="3xl"
            weight="700"
            gradient="primary"
          >
            {brand.headlineHighlight}
          </Typography>
        </Typography>
        <Typography
          variant="body"
          uiSize="lg"
          color="$colorMuted"
          style={{ lineHeight: 1.55 }}
        >
          {brand.subline}
        </Typography>
      </YStack>

      <YStack gap="$3" marginTop="$2">
        <FeatureBullet
          accent="🔑"
          title={brand.featureOauthTitle}
          detail={brand.featureOauthDetail}
        />
        <FeatureBullet
          accent="✉️"
          title={brand.featureMagicTitle}
          detail={brand.featureMagicDetail}
        />
        <FeatureBullet
          accent="🛡️"
          title={brand.featureProgressTitle}
          detail={brand.featureProgressDetail}
        />
      </YStack>

      <XStack alignItems="center" gap="$3" marginTop="$2">
        <XStack>
          {AVATAR_GRADIENTS.map((bg, i) => (
            <YStack
              key={bg}
              width={32}
              height={32}
              borderRadius={999}
              borderWidth={2}
              borderColor="$background"
              marginLeft={i === 0 ? 0 : -10}
              style={{ background: bg }}
            />
          ))}
        </XStack>
        <Typography variant="body" uiSize="sm" color="$colorMuted" flex={1}>
          {brand.proofBefore}
          <Typography
            variant="body"
            uiSize="sm"
            weight="600"
            color="$colorStrong"
          >
            {brand.proofCount}
          </Typography>
          {brand.proofAfter}
        </Typography>
      </XStack>
    </YStack>
  );
}

function FeatureBullet({
  accent,
  title,
  detail,
}: {
  accent: string;
  title: string;
  detail: string;
}) {
  return (
    <XStack alignItems="flex-start" gap="$3">
      <YStack
        width={28}
        height={28}
        borderRadius={8}
        alignItems="center"
        justifyContent="center"
        backgroundColor="$glassBg"
        borderWidth={1}
        borderColor="$glassBorder"
      >
        <Typography variant="body" uiSize="sm">
          {accent}
        </Typography>
      </YStack>
      <YStack flex={1} gap="$0.5">
        <Typography variant="body" uiSize="md" weight="600">
          {title}
        </Typography>
        <Typography variant="body" uiSize="sm" color="$colorMuted">
          {detail}
        </Typography>
      </YStack>
    </XStack>
  );
}

function BrandFooterLinks({ brand }: { brand: AuthBrandLabels }) {
  const linkStyle = {
    textDecoration: 'underline',
    textUnderlineOffset: 4,
    textDecorationStyle: 'dotted' as const,
    color: 'inherit',
  };
  return (
    <XStack gap="$4" flexWrap="wrap" alignItems="center">
      <Link href="/" style={linkStyle} data-testid="auth-brand-home-link">
        <Typography variant="body" uiSize="sm" color="$colorMuted">
          {brand.footHome}
        </Typography>
      </Link>
      <Typography variant="body" uiSize="sm" color="$colorMuted">
        ·
      </Typography>
      <Link href="/games" style={linkStyle} data-testid="auth-brand-games-link">
        <Typography variant="body" uiSize="sm" color="$colorMuted">
          {brand.footGames}
        </Typography>
      </Link>
      <Typography variant="body" uiSize="sm" color="$colorMuted">
        ·
      </Typography>
      <Link
        href="/support"
        style={linkStyle}
        data-testid="auth-brand-help-link"
      >
        <Typography variant="body" uiSize="sm" color="$colorMuted">
          {brand.footHelp}
        </Typography>
      </Link>
    </XStack>
  );
}

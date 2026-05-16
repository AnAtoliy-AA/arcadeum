import Link from 'next/link';
import { XStack, YStack } from 'tamagui';
import { Typography } from '@arcadeum/ui/components/Typography/Typography';
import type { AuthBrandLabels } from '../types';
import { CheckGlyph, SparkleGlyph } from './AuthProviderIcons';

interface AuthBrandPanelProps {
  brand: AuthBrandLabels;
  flex?: number;
}

interface AvatarEntry {
  ch: string;
  bg: string;
}

const AVATARS: AvatarEntry[] = [
  { ch: 'M', bg: 'linear-gradient(135deg, #5eead4, #818cf8)' },
  { ch: 'J', bg: 'linear-gradient(135deg, #fbbf24, #f87171)' },
  { ch: 'A', bg: 'linear-gradient(135deg, #c084fc, #f472b6)' },
  { ch: '+', bg: 'linear-gradient(135deg, #22d3ee, #a78bfa)' },
];

export function AuthBrandPanel({ brand, flex = 1.55 }: AuthBrandPanelProps) {
  return (
    <YStack
      flex={flex}
      paddingHorizontal="$8"
      paddingVertical="$8"
      gap="$8"
      position="relative"
      justifyContent="space-between"
      $md={{ display: 'none' }}
      data-testid="auth-brand-panel"
    >
      <YStack
        position="absolute"
        top="10%"
        bottom="10%"
        right={0}
        width={1}
        pointerEvents="none"
        $md={{ display: 'none' }}
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.10) 30%, rgba(255,255,255,0.10) 70%, transparent 100%)',
        }}
      />
      <BrandHeader brand={brand} className="auth-fade-in-1" />
      <BrandHero brand={brand} className="auth-fade-in-2" />
      <BrandFooterLinks brand={brand} className="auth-fade-in-3" />
    </YStack>
  );
}

function BrandHeader({
  brand,
  className,
}: {
  brand: AuthBrandLabels;
  className?: string;
}) {
  return (
    <XStack
      className={className}
      alignItems="center"
      gap="$3"
      width="100%"
      maxWidth={680}
      alignSelf="center"
    >
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
          className="auth-status-dot"
          width={8}
          height={8}
          borderRadius={999}
          backgroundColor="#22c55e"
        />
        <Typography
          variant="caption"
          uiSize="xs"
          color="$colorMuted"
          style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}
        >
          {brand.statusPill}
        </Typography>
      </XStack>
    </XStack>
  );
}

function BrandHero({
  brand,
  className,
}: {
  brand: AuthBrandLabels;
  className?: string;
}) {
  return (
    <YStack
      className={className}
      gap="$5"
      maxWidth={680}
      alignSelf="center"
      width="100%"
    >
      <XStack
        alignSelf="flex-start"
        alignItems="center"
        gap="$2"
        paddingHorizontal="$3"
        paddingVertical="$1.5"
        borderRadius={999}
        borderWidth={1}
        style={{
          borderColor:
            'color-mix(in srgb, var(--accent, #38bdf8) 25%, transparent)',
          background:
            'color-mix(in srgb, var(--accent, #38bdf8) 10%, transparent)',
          color: 'var(--accent, #38bdf8)',
        }}
      >
        <SparkleGlyph size={12} />
        <Typography
          variant="caption"
          uiSize="xs"
          color="$accent"
          weight="600"
          style={{
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            fontFamily: 'var(--font-mono, ui-monospace, monospace)',
          }}
        >
          {brand.eyebrow}
        </Typography>
      </XStack>

      <YStack gap="$2">
        <Typography
          variant="heading"
          weight="800"
          style={{ fontSize: 80, lineHeight: 84, letterSpacing: '-0.02em' }}
        >
          {brand.headlinePrefix}{' '}
          <Typography
            variant="heading"
            weight="800"
            style={{
              fontSize: 80,
              lineHeight: 84,
              letterSpacing: '-0.02em',
              backgroundImage:
                'linear-gradient(120deg, #38bdf8 0%, #a78bfa 55%, #ff6af7 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {brand.headlineHighlight}
          </Typography>
        </Typography>
        <Typography variant="body" uiSize="lg" color="$colorMuted">
          {brand.subline}
        </Typography>
      </YStack>

      <YStack gap="$3" marginTop="$2">
        <FeatureBullet
          title={brand.featureOauthTitle}
          detail={brand.featureOauthDetail}
        />
        <FeatureBullet
          title={brand.featureMagicTitle}
          detail={brand.featureMagicDetail}
        />
        <FeatureBullet
          title={brand.featureProgressTitle}
          detail={brand.featureProgressDetail}
        />
      </YStack>

      <XStack alignItems="center" gap="$3" marginTop="$2">
        <XStack>
          {AVATARS.map((a, i) => (
            <YStack
              key={a.ch}
              width={34}
              height={34}
              borderRadius={999}
              borderWidth={2}
              borderColor="$background"
              marginLeft={i === 0 ? 0 : -10}
              alignItems="center"
              justifyContent="center"
              style={{ background: a.bg }}
            >
              <Typography
                variant="heading"
                uiSize="xs"
                weight="700"
                style={{ color: '#06011b', fontSize: 12 }}
              >
                {a.ch}
              </Typography>
            </YStack>
          ))}
        </XStack>
        <Typography variant="body" uiSize="sm" color="$colorMuted" flex={1}>
          {brand.proofBefore}
          <Typography variant="body" uiSize="sm" weight="600">
            {brand.proofCount}
          </Typography>
          {brand.proofAfter}
        </Typography>
      </XStack>
    </YStack>
  );
}

function FeatureBullet({ title, detail }: { title: string; detail: string }) {
  return (
    <XStack alignItems="flex-start" gap="$3">
      <YStack
        width={28}
        height={28}
        borderRadius={999}
        alignItems="center"
        justifyContent="center"
        marginTop={2}
        flexShrink={0}
        borderWidth={1}
        style={{
          color: '#ffffff',
          background:
            'color-mix(in srgb, var(--accent, #38bdf8) 18%, transparent)',
          borderColor:
            'color-mix(in srgb, var(--accent, #38bdf8) 35%, transparent)',
        }}
      >
        <CheckGlyph size={14} />
      </YStack>
      <Typography variant="body" uiSize="md" flex={1}>
        <Typography variant="body" uiSize="md" weight="700">
          {title}
        </Typography>{' '}
        <Typography variant="body" uiSize="md" color="$colorMuted">
          — {detail}
        </Typography>
      </Typography>
    </XStack>
  );
}

function BrandFooterLinks({
  brand,
  className,
}: {
  brand: AuthBrandLabels;
  className?: string;
}) {
  const linkStyle = {
    textDecoration: 'underline',
    textUnderlineOffset: 4,
    textDecorationStyle: 'dotted' as const,
    color: 'inherit',
  };
  return (
    <XStack
      className={className}
      gap="$4"
      flexWrap="wrap"
      alignItems="center"
      width="100%"
      maxWidth={680}
      alignSelf="center"
    >
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

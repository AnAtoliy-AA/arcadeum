import Link from 'next/link';
import { XStack, YStack } from 'tamagui';
import { Typography } from '@arcadeum/ui/components/Typography/Typography';
import { appConfig } from '@/shared/config/app-config';
import type { AuthBrandLabels } from '../types';
import { CheckGlyph, PlusGlyph } from './AuthProviderIcons';

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
      $md={{
        paddingHorizontal: '$5',
        paddingVertical: '$6',
        gap: '$6',
      }}
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
  const initial = appConfig.appName.slice(0, 1).toUpperCase();
  return (
    <XStack
      className={className}
      alignItems="center"
      justifyContent="space-between"
      gap="$3"
    >
      <Link href="/" style={{ textDecoration: 'none' }}>
        <XStack alignItems="center" gap="$2">
          <YStack
            width={38}
            height={38}
            borderRadius={12}
            alignItems="center"
            justifyContent="center"
            position="relative"
            style={{
              background:
                'linear-gradient(135deg, var(--accent, #38bdf8), color-mix(in srgb, var(--accent, #38bdf8) 35%, #ff6af7))',
              boxShadow:
                '0 10px 28px -10px color-mix(in srgb, var(--accent, #38bdf8) 60%, transparent)',
            }}
          >
            <Typography
              variant="heading"
              uiSize="md"
              weight="700"
              style={{
                color: '#06011b',
                fontSize: 18,
                letterSpacing: '-0.04em',
              }}
            >
              {initial}
            </Typography>
            <YStack
              position="absolute"
              top={1}
              left={1}
              right={1}
              bottom={1}
              borderRadius={11}
              pointerEvents="none"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.18), transparent 40%)',
              }}
            />
          </YStack>
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
    <YStack className={className} gap="$5" maxWidth={520}>
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
        <PlusGlyph size={12} />
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
          uiSize="3xl"
          weight="700"
          style={{ lineHeight: 1.05 }}
        >
          {brand.headlinePrefix}{' '}
          <Typography
            variant="heading"
            uiSize="3xl"
            weight="700"
            style={{
              backgroundImage:
                'linear-gradient(120deg, var(--accent, #38bdf8) 20%, #ff6af7 90%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
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
        width={22}
        height={22}
        borderRadius={999}
        alignItems="center"
        justifyContent="center"
        marginTop={1}
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
        <CheckGlyph size={12} />
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
    <XStack className={className} gap="$4" flexWrap="wrap" alignItems="center">
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

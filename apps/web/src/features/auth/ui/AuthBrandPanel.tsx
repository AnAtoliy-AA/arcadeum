import { useEffect } from 'react';
import Link from 'next/link';
import { Typography } from '@arcadeum/ui/components/Typography/Typography';
import { useLiveStatsStore } from '@/features/live-stats';
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
    <div
      className="flex flex-col items-stretch px-8 py-8 gap-8 relative justify-between max-[1150px]:hidden"
      style={{ flex }}
      data-testid="auth-brand-panel"
    >
      <div
        className="flex flex-col items-stretch absolute top-[10%] bottom-[10%] right-0 w-[1px] pointer-events-none max-[1150px]:hidden"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.10) 30%, rgba(255,255,255,0.10) 70%, transparent 100%)',
        }}
      />
      <BrandHeader brand={brand} className="auth-fade-in-1" />
      <BrandHero brand={brand} className="auth-fade-in-2" />
      <BrandFooterLinks brand={brand} className="auth-fade-in-3" />
    </div>
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
    <div
      className={`flex flex-row items-center gap-3 w-full max-w-[680px] self-center ${className ?? ''}`}
    >
      <div className="flex flex-row items-center gap-2 px-3 rounded-[999px] border border-[var(--glassBorder)] bg-[var(--glassBg)]">
        <div className="flex flex-col items-stretch w-[8px] h-[8px] rounded-[999px] bg-[#22c55e] auth-status-dot" />
        <Typography
          variant="caption"
          uiSize="xs"
          color="var(--textSecondary)"
          style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}
        >
          {brand.statusPill}
        </Typography>
      </div>
    </div>
  );
}

function BrandHero({
  brand,
  className,
}: {
  brand: AuthBrandLabels;
  className?: string;
}) {
  const { stats, fetchLiveStats } = useLiveStatsStore();

  useEffect(() => {
    void fetchLiveStats();
  }, [fetchLiveStats]);

  const displayProofCount =
    stats.totalUsers > 0
      ? stats.totalUsers.toLocaleString()
      : stats.onlineUsers > 0
        ? stats.onlineUsers.toLocaleString()
        : brand.proofCount || '0';

  return (
    <div
      className={`flex flex-col items-stretch gap-5 max-w-[680px] self-center w-full ${className ?? ''}`}
    >
      <div
        className="flex flex-row self-start items-center gap-2 px-3 rounded-[999px] border"
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
          color="var(--accent)"
          weight="600"
          style={{
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            fontFamily: 'var(--font-mono, ui-monospace, monospace)',
          }}
        >
          {brand.eyebrow}
        </Typography>
      </div>

      <div className="flex flex-col items-stretch gap-2">
        <Typography
          variant="heading"
          weight="800"
          style={{ fontSize: 80, lineHeight: '84px', letterSpacing: '-0.02em' }}
        >
          {brand.headlinePrefix}{' '}
          <Typography
            variant="body"
            weight="800"
            style={{
              fontSize: 80,
              lineHeight: '84px',
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
        <Typography variant="body" uiSize="lg" color="var(--textSecondary)">
          {brand.subline}
        </Typography>
      </div>

      <div className="flex flex-col items-stretch gap-3 -mt-2">
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
      </div>

      <div className="flex flex-row items-center gap-3 -mt-2">
        <div className="flex flex-row items-stretch">
          {AVATARS.map((a, i) => (
            <div
              className="flex flex-col w-[34px] h-[34px] rounded-[999px] border-[2px] border-[var(--background)] items-center justify-center"
              style={{ marginLeft: i === 0 ? 0 : -10 }}
              key={a.ch}
            >
              <Typography
                variant="heading"
                uiSize="xs"
                weight="700"
                style={{ color: '#06011b', fontSize: 12 }}
              >
                {a.ch}
              </Typography>
            </div>
          ))}
        </div>
        <Typography
          variant="body"
          uiSize="sm"
          className="flex-1 text-secondary"
        >
          {brand.proofBefore}
          <Typography variant="body" uiSize="sm" weight="600">
            {displayProofCount}
          </Typography>
          {brand.proofAfter}
        </Typography>
      </div>
    </div>
  );
}

function FeatureBullet({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex flex-row items-start gap-3">
      <div
        className="flex flex-col w-[28px] h-[28px] rounded-[999px] items-center justify-center -mt-2 shrink-0 border"
        style={{
          color: '#ffffff',
          background:
            'color-mix(in srgb, var(--accent, #38bdf8) 18%, transparent)',
          borderColor:
            'color-mix(in srgb, var(--accent, #38bdf8) 35%, transparent)',
        }}
      >
        <CheckGlyph size={14} />
      </div>
      <Typography variant="body" uiSize="md" className="flex-1">
        <Typography variant="body" uiSize="md" weight="700">
          {title}
        </Typography>{' '}
        <Typography variant="body" uiSize="md" className="text-secondary">
          — {detail}
        </Typography>
      </Typography>
    </div>
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
    <div
      className={`flex flex-row gap-4 flex-wrap items-center w-full max-w-[680px] self-center ${className ?? ''}`}
    >
      <Link href="/" style={linkStyle} data-testid="auth-brand-home-link">
        <Typography variant="body" uiSize="sm" color="var(--textSecondary)">
          {brand.footHome}
        </Typography>
      </Link>
      <Typography variant="body" uiSize="sm" color="var(--textSecondary)">
        ·
      </Typography>
      <Link href="/games" style={linkStyle} data-testid="auth-brand-games-link">
        <Typography variant="body" uiSize="sm" color="var(--textSecondary)">
          {brand.footGames}
        </Typography>
      </Link>
      <Typography variant="body" uiSize="sm" color="var(--textSecondary)">
        ·
      </Typography>
      <Link
        href="/support"
        style={linkStyle}
        data-testid="auth-brand-help-link"
      >
        <Typography variant="body" uiSize="sm" color="var(--textSecondary)">
          {brand.footHelp}
        </Typography>
      </Link>
    </div>
  );
}

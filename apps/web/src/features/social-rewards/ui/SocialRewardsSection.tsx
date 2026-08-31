import React from 'react';
import { GlassCard, Typography, Badge } from '@arcadeum/ui';
import {
  DiscordIcon,
  TelegramIcon,
  XIcon,
  GithubIcon,
  YouTubeIcon,
  InstagramIcon,
  TikTokIcon,
  ThreadsIcon,
  FacebookIcon,
  LinkedInIcon,
} from '@arcadeum/ui/components/Icons/index';
import { appConfig } from '@/shared/config/app-config';
import { SocialRewardButton } from './SocialRewardButton';
import type { SocialRewardsStatus } from '../server/social-rewards.types';

interface PlatformMeta {
  title: string;
  icon: React.ComponentType<{ size?: number }>;
  hrefKey: keyof typeof appConfig.social;
  fallbackHref: string;
}

const PLATFORM_META_MAP: Record<string, PlatformMeta> = {
  discord: {
    title: 'Discord',
    icon: DiscordIcon,
    hrefKey: 'discord',
    fallbackHref: 'https://discord.gg/arcadeum',
  },
  telegram: {
    title: 'Telegram',
    icon: TelegramIcon,
    hrefKey: 'telegram',
    fallbackHref: 'https://t.me/arcadeum',
  },
  x: {
    title: 'X / Twitter',
    icon: XIcon,
    hrefKey: 'x',
    fallbackHref: 'https://x.com/arcadeum',
  },
  twitter: {
    title: 'X / Twitter',
    icon: XIcon,
    hrefKey: 'x',
    fallbackHref: 'https://x.com/arcadeum',
  },
  github: {
    title: 'GitHub',
    icon: GithubIcon,
    hrefKey: 'github',
    fallbackHref: 'https://github.com/AnAtoliy-AA/arcadeum',
  },
  youtube: {
    title: 'YouTube',
    icon: YouTubeIcon,
    hrefKey: 'youtube',
    fallbackHref: 'https://youtube.com/@arcadeum',
  },
  instagram: {
    title: 'Instagram',
    icon: InstagramIcon,
    hrefKey: 'instagram',
    fallbackHref: 'https://instagram.com/arcadeum',
  },
  tiktok: {
    title: 'TikTok',
    icon: TikTokIcon,
    hrefKey: 'tiktok',
    fallbackHref: 'https://tiktok.com/@arcadeum',
  },
  threads: {
    title: 'Threads',
    icon: ThreadsIcon,
    hrefKey: 'threads',
    fallbackHref: 'https://threads.net/@arcadeum',
  },
  facebook: {
    title: 'Facebook',
    icon: FacebookIcon,
    hrefKey: 'facebook',
    fallbackHref: 'https://facebook.com/arcadeum',
  },
  linkedin: {
    title: 'LinkedIn',
    icon: LinkedInIcon,
    hrefKey: 'linkedin',
    fallbackHref: 'https://linkedin.com/company/arcadeum',
  },
};

const DEFAULT_PLATFORMS = [
  'discord',
  'telegram',
  'x',
  'github',
  'youtube',
  'instagram',
  'tiktok',
  'threads',
  'facebook',
  'linkedin',
];

export interface SocialRewardsSectionLabels {
  title?: string;
  subtitle?: string;
  badge?: string;
  claim?: string;
  claimed?: string;
  followAndClaim?: string;
  toastSuccess?: string;
  errorAlreadyClaimed?: string;
  errorUnauthorized?: string;
  errorGeneric?: string;
}

export interface SocialRewardsSectionProps {
  status?: SocialRewardsStatus | null;
  labels?: SocialRewardsSectionLabels;
}

export function SocialRewardsSection({
  status,
  labels,
}: SocialRewardsSectionProps) {
  const items =
    status?.items ??
    DEFAULT_PLATFORMS.map((platform) => ({
      platform,
      gems: status?.gemsPerSubscription ?? 1,
      claimed: false,
      claimedAt: null,
    }));

  const title = labels?.title ?? 'Social Network Rewards';
  const subtitle =
    labels?.subtitle ??
    'Follow and subscribe to our official social channels to earn gems.';
  const badgeText = labels?.badge ?? 'GEMS REWARD';

  return (
    <div className="flex flex-col gap-6" data-testid="social-rewards-section">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge accent="var(--gold)">{badgeText}</Badge>
          {status && (
            <span className="text-xs text-[var(--colorTextSecondary)]">
              {status.totalClaimed} / {status.totalAvailable} claimed
            </span>
          )}
        </div>
        <Typography variant="heading" uiSize="xl" weight="800">
          {title}
        </Typography>
        <Typography variant="body" uiSize="md" alpha="medium">
          {subtitle}
        </Typography>
      </div>

      <div
        className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4"
        data-testid="social-rewards-grid"
      >
        {items.map((item) => {
          const meta = PLATFORM_META_MAP[item.platform.toLowerCase()] ?? {
            title:
              item.platform.charAt(0).toUpperCase() + item.platform.slice(1),
            icon: DiscordIcon,
            hrefKey: 'discord' as keyof typeof appConfig.social,
            fallbackHref: `https://${item.platform}.com/arcadeum`,
          };

          const IconComponent = meta.icon;
          const href =
            appConfig.social[meta.hrefKey] || meta.fallbackHref || undefined;

          return (
            <GlassCard
              key={item.platform}
              data-testid={`social-reward-card-${item.platform}`}
              className="bg-slate-900/60 border-white/10 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-200 hover:border-white/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                    <IconComponent size={20} />
                  </div>
                  <div className="flex flex-col">
                    <Typography variant="heading" uiSize="sm" weight="700">
                      {meta.title}
                    </Typography>
                    <span className="text-xs text-amber-400 font-semibold">
                      +{item['gems']} 💎
                    </span>
                  </div>
                </div>

                {item.claimed && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Claimed
                  </span>
                )}
              </div>

              <SocialRewardButton
                platform={item.platform}
                href={href}
                gems={item['gems']}
                initialClaimed={item.claimed}
                labels={{
                  claim: labels?.claim,
                  claimed: labels?.claimed,
                  followAndClaim: labels?.followAndClaim,
                  toastSuccess: labels?.toastSuccess,
                  errorAlreadyClaimed: labels?.errorAlreadyClaimed,
                  errorUnauthorized: labels?.errorUnauthorized,
                  errorGeneric: labels?.errorGeneric,
                }}
              />
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

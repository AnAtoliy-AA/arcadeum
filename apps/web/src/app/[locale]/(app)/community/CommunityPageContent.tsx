'use client';

import React from 'react';
import type { PageTranslations } from '@/shared/i18n/page-translations';
import { useLanguage } from '@/shared/i18n/context';
import { appConfig } from '@/shared/config/app-config';
import {
  PageLayout,
  Badge,
  Container,
  GlassCard,
  PageTitle,
  Typography,
} from '@arcadeum/ui';
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

interface CommunityPageContentProps {
  t?: PageTranslations;
}

interface NetworkConfig {
  id: string;
  key: keyof typeof appConfig.social;
  titleKey: string;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
  gradientBg: string;
  fallbackHref: string;
}

const NETWORK_CONFIGS: NetworkConfig[] = [
  {
    id: 'discord',
    key: 'discord',
    titleKey: 'discord',
    icon: DiscordIcon,
    color: '#5865F2',
    gradientBg:
      'linear-gradient(135deg, rgba(88, 101, 242, 0.25) 0%, rgba(88, 101, 242, 0.05) 100%)',
    fallbackHref: 'https://discord.gg/arcadeum',
  },
  {
    id: 'telegram',
    key: 'telegram',
    titleKey: 'telegram',
    icon: TelegramIcon,
    color: '#26A5E4',
    gradientBg:
      'linear-gradient(135deg, rgba(38, 165, 228, 0.25) 0%, rgba(38, 165, 228, 0.05) 100%)',
    fallbackHref: 'https://t.me/arcadeum',
  },
  {
    id: 'twitter',
    key: 'x',
    titleKey: 'twitter',
    icon: XIcon,
    color: '#F1F5F9',
    gradientBg:
      'linear-gradient(135deg, rgba(241, 245, 249, 0.2) 0%, rgba(241, 245, 249, 0.03) 100%)',
    fallbackHref: 'https://x.com/arcadeum',
  },
  {
    id: 'github',
    key: 'github',
    titleKey: 'github',
    icon: GithubIcon,
    color: '#E2E8F0',
    gradientBg:
      'linear-gradient(135deg, rgba(226, 232, 240, 0.2) 0%, rgba(226, 232, 240, 0.03) 100%)',
    fallbackHref: 'https://github.com/AnAtoliy-AA/arcadeum',
  },
  {
    id: 'youtube',
    key: 'youtube',
    titleKey: 'youtube',
    icon: YouTubeIcon,
    color: '#FF0000',
    gradientBg:
      'linear-gradient(135deg, rgba(255, 0, 0, 0.25) 0%, rgba(255, 0, 0, 0.05) 100%)',
    fallbackHref: 'https://youtube.com/@arcadeum',
  },
  {
    id: 'instagram',
    key: 'instagram',
    titleKey: 'instagram',
    icon: InstagramIcon,
    color: '#E1306C',
    gradientBg:
      'linear-gradient(135deg, rgba(225, 48, 108, 0.25) 0%, rgba(225, 48, 108, 0.05) 100%)',
    fallbackHref: 'https://instagram.com/arcadeum',
  },
  {
    id: 'tiktok',
    key: 'tiktok',
    titleKey: 'tiktok',
    icon: TikTokIcon,
    color: '#00F2FE',
    gradientBg:
      'linear-gradient(135deg, rgba(0, 242, 254, 0.2) 0%, rgba(0, 242, 254, 0.03) 100%)',
    fallbackHref: 'https://tiktok.com/@arcadeum',
  },
  {
    id: 'threads',
    key: 'threads',
    titleKey: 'threads',
    icon: ThreadsIcon,
    color: '#CBD5E1',
    gradientBg:
      'linear-gradient(135deg, rgba(203, 213, 225, 0.2) 0%, rgba(203, 213, 225, 0.03) 100%)',
    fallbackHref: 'https://threads.net/@arcadeum',
  },
  {
    id: 'facebook',
    key: 'facebook',
    titleKey: 'facebook',
    icon: FacebookIcon,
    color: '#1877F2',
    gradientBg:
      'linear-gradient(135deg, rgba(24, 119, 242, 0.25) 0%, rgba(24, 119, 242, 0.05) 100%)',
    fallbackHref: 'https://facebook.com/arcadeum',
  },
  {
    id: 'linkedin',
    key: 'linkedin',
    titleKey: 'linkedin',
    icon: LinkedInIcon,
    color: '#0A66C2',
    gradientBg:
      'linear-gradient(135deg, rgba(10, 102, 194, 0.25) 0%, rgba(10, 102, 194, 0.05) 100%)',
    fallbackHref: 'https://linkedin.com/company/arcadeum',
  },
];

export default function CommunityPageContent({
  t: initialT,
}: CommunityPageContentProps) {
  const { messages } = useLanguage();
  const t =
    (messages.pages?.community as unknown as PageTranslations) || initialT;

  const sections =
    (t?.sections as Record<string, Record<string, string>>) || {};
  const stats = (t?.stats as Record<string, string>) || {};

  return (
    <PageLayout>
      <Container size="xl">
        <div
          className="flex flex-col gap-8 py-6"
          data-testid="community-page-wrapper"
        >
          <GlassCard
            style={{
              background:
                'radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.2) 0%, rgba(15, 23, 42, 0.6) 80%)',
            }}
            className="items-center text-center p-9"
          >
            <div className="flex flex-col gap-3 items-center max-w-[720px]">
              {t?.badge && (
                <Badge accent="#818CF8">
                  {(t.badge as string).toUpperCase()}
                </Badge>
              )}

              <PageTitle
                size="xl"
                gradient
                className="text-4xl font-extrabold tracking-tight"
              >
                {t?.title ?? 'Join the Community'}
              </PageTitle>

              {t?.subtitle && (
                <Typography variant="subheading" uiSize="md" alpha="medium">
                  {t.subtitle}
                </Typography>
              )}

              <Typography
                variant="body"
                uiSize="lg"
                alpha="high"
                className="mt-2"
              >
                {t?.description}
              </Typography>
            </div>

            <div className="flex flex-wrap gap-6 mt-6 justify-center sm:flex-row max-sm:flex-col max-sm:gap-3">
              <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 items-center min-w-[160px] flex flex-col">
                <Typography
                  variant="heading"
                  uiSize="lg"
                  style={{ color: '#818CF8' }}
                  className="font-extrabold"
                >
                  {stats.players ?? '10K+'}
                </Typography>
                <Typography variant="caption" alpha="medium">
                  {stats.playersLabel ?? 'Active Players'}
                </Typography>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 items-center min-w-[160px] flex flex-col">
                <Typography
                  variant="heading"
                  uiSize="lg"
                  style={{ color: '#38BDF8' }}
                  className="font-extrabold"
                >
                  {stats.discordMembers ?? '5K+'}
                </Typography>
                <Typography variant="caption" alpha="medium">
                  {stats.discordLabel ?? 'Discord Gamers'}
                </Typography>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 items-center min-w-[160px] flex flex-col">
                <Typography
                  variant="heading"
                  uiSize="lg"
                  style={{ color: '#34D399' }}
                  className="font-extrabold"
                >
                  {stats.githubStars ?? 'Open Source'}
                </Typography>
                <Typography variant="caption" alpha="medium">
                  {stats.githubLabel ?? 'Community Driven'}
                </Typography>
              </div>
            </div>
          </GlassCard>

          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <Typography variant="heading" uiSize="md">
                Official Networks & Socials
              </Typography>
              <Typography variant="caption" alpha="medium">
                {NETWORK_CONFIGS.length} Channels Connected
              </Typography>
            </div>

            <div
              className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4"
              data-testid="community-networks-grid"
            >
              {NETWORK_CONFIGS.map((net) => {
                const IconComponent = net.icon;
                const sectionData = sections[net.titleKey] || {};
                const title = sectionData.title || net.id.toUpperCase();
                const subtitle = sectionData.subtitle;
                const description = sectionData.description;
                const href = appConfig.social[net.key] || net.fallbackHref;
                const actionText = (t?.actionLabel as string) ?? 'Join Channel';

                return (
                  <a
                    key={net.id}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-underline flex"
                    data-testid={`network-card-${net.id}`}
                  >
                    <GlassCard className="flex-1 bg-slate-900/65 border-white/10 rounded-2xl p-5.5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:border-white/20">
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center border"
                            style={{
                              background: net.gradientBg,
                              borderColor: `${net.color}33`,
                              color: net.color,
                            }}
                          >
                            <IconComponent size={24} />
                          </div>
                          {subtitle && (
                            <Badge accent={net.color}>{subtitle}</Badge>
                          )}
                        </div>

                        <div className="flex flex-col gap-1">
                          <Typography
                            variant="heading"
                            uiSize="sm"
                            className="font-bold"
                          >
                            {title}
                          </Typography>
                          {description && (
                            <Typography
                              variant="body"
                              uiSize="sm"
                              alpha="medium"
                              className="line-clamp-3 text-xs leading-relaxed"
                            >
                              {description}
                            </Typography>
                          )}
                        </div>
                      </div>

                      <div
                        className="flex items-center gap-2 mt-4 font-semibold text-xs"
                        style={{ color: net.color }}
                      >
                        <Typography
                          variant="caption"
                          style={{ color: net.color }}
                          className="font-bold"
                        >
                          {actionText} →
                        </Typography>
                      </div>
                    </GlassCard>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </PageLayout>
  );
}

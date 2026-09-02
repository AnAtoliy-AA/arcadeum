'use client';

import { type ReactNode, useEffect } from 'react';
import { useLanguage } from '@/shared/i18n/context';
import { useLiveStatsStore } from '@/features/live-stats';
import { PageLayout } from '@arcadeum/ui/components/PageLayout/PageLayout';
import { Container } from '@arcadeum/ui/components/Container/Container';
import { Typography } from '@arcadeum/ui/components/Typography/Typography';
import { appConfig } from '@/shared/config/app-config';
import { ActivityTicker } from '@arcadeum/ui/components/ActivityTicker';
import { ChannelTile } from '@arcadeum/ui/components/ChannelTile';
import { StatTile } from '@arcadeum/ui/components/StatTile';
import { cx } from '@arcadeum/ui/utils/cx';
import { formatMessage } from '@/shared/i18n';
import type { ContactMessages } from '@/shared/i18n/messages/legal/types';
import {
  ClockIcon,
  DiscordIcon,
  GithubIcon,
  GlobeIcon,
  InstagramIcon,
  TwitterIcon,
} from './ContactView.icons';
import { ContactSidePanel } from './ContactSidePanel';
import { ContactFaq, getFaqItems } from './ContactFaq';
import { ContactAvatars } from './ContactAvatars';
import { ContactForm } from './ContactForm';
import { ContactTips } from './ContactTips';
import styles from './ContactView.module.scss';

export interface ContactViewProps {
  t?: ContactMessages;
  SUPPORT_EMAIL: string;
  WORKING_HOURS: string;
}

function HeroPill({
  icon,
  children,
}: {
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] text-[var(--color)] border border-[var(--glassBorder)] bg-[var(--glassBg)]">
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      {children}
    </span>
  );
}

const tickerItems = [
  {
    tag: 'support',
    who: 'Maria',
    what: 'answered a ticket',
    when: '12s ago',
    color: '#22d3ee',
  },
  {
    tag: 'release',
    who: 'v2.41',
    what: 'shipped to production',
    when: '4m ago',
    color: '#a78bfa',
  },
  {
    tag: 'bug',
    who: 'Anatoliy',
    what: 'fixed lobby latency on EU-West',
    when: '11m ago',
    color: '#f472b6',
  },
  {
    tag: 'support',
    who: 'Sergey',
    what: 'joined Discord office hours',
    when: '23m ago',
    color: '#22d3ee',
  },
  {
    tag: 'status',
    who: 'All systems',
    what: 'operational · 99.98% uptime',
    when: '—',
    color: '#34d399',
  },
];

export default function ContactView({
  t: initialT,
  SUPPORT_EMAIL,
  WORKING_HOURS,
}: ContactViewProps) {
  const { messages } = useLanguage();
  const { stats: liveStats, fetchLiveStats } = useLiveStatsStore();

  useEffect(() => {
    void fetchLiveStats();
  }, [fetchLiveStats]);

  const t = (messages.legal?.contact as unknown as ContactMessages) || initialT;
  const sections = t?.sections;
  const hero = sections?.hero;
  const stats = sections?.stats;
  const channels = sections?.channels;
  const form = sections?.form;
  const side = sections?.side;
  const ticker = sections?.ticker;
  const faq = sections?.faq;

  const titleParts = (hero?.title ?? '').trim().split(/\s+/);
  const lastWord = titleParts.pop() ?? '';
  const titleHead = titleParts.join(' ');

  const faqItems = getFaqItems(t);

  const discordCount = (
    liveStats.platformSubscribers?.['discord'] ??
    liveStats.totalSubscribers ??
    0
  ).toLocaleString();

  const social = appConfig.social;
  const channelDefs = [
    social.discord && {
      key: 'discord',
      icon: <DiscordIcon />,
      title: channels?.discord?.title ?? 'Discord',
      sub: formatMessage(channels?.discord?.sub, {
        count: discordCount,
      }),
      gradient: 'linear-gradient(135deg,#5865f2 0%,#8b5cf6 100%)',
      href: social.discord,
    },
    social.x && {
      key: 'x',
      icon: <TwitterIcon />,
      title: channels?.x?.title ?? '@_arcadeum_',
      sub: channels?.x?.sub ?? 'DMs are open',
      gradient: 'linear-gradient(135deg,#0f1419 0%,#1a8cd8 100%)',
      href: social.x,
    },
    social.instagram && {
      key: 'instagram',
      icon: <InstagramIcon />,
      title: channels?.instagram?.title ?? 'Instagram',
      sub: channels?.instagram?.sub ?? 'Daily updates & screenshots',
      gradient: 'linear-gradient(135deg,#f58529 0%,#dd2a7b 50%,#8134af 100%)',
      href: social.instagram,
    },
    social.github && {
      key: 'github',
      icon: <GithubIcon />,
      title: channels?.github?.title ?? 'GitHub Issues',
      sub: channels?.github?.sub ?? 'Bugs & feature requests',
      gradient: 'linear-gradient(135deg,#1f2328 0%,#6e40c9 100%)',
      href: social.github,
    },
  ].filter((c): c is Exclude<typeof c, false | undefined | ''> => Boolean(c));

  return (
    <PageLayout>
      <Container size="lg" className="max-w-[1120px]">
        <div className="flex flex-col items-stretch gap-8">
          <div className="relative overflow-hidden rounded-[24px] border border-[var(--glassBorder)] bg-[radial-gradient(80%_80%_at_50%_100%,rgba(56,189,248,0.18),transparent_70%),radial-gradient(60%_60%_at_0%_0%,rgba(3,105,161,0.22),transparent_65%),var(--background)] p-[clamp(28px,5vw,56px)_clamp(20px,3vw,32px)]">
            <span aria-hidden="true" className={styles.orb1} />
            <span aria-hidden="true" className={styles.orb2} />
            <div className="flex flex-col items-stretch gap-4 relative z-10">
              <div className="flex flex-row flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-[1.2px] uppercase text-[var(--accent)] border border-[var(--glassBorder)] bg-[var(--glassBg)]">
                  <span
                    aria-hidden="true"
                    className="h-[7px] w-[7px] rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]"
                  />
                  {hero?.eyebrow ?? 'Player support'}
                </span>
                <Typography variant="caption" alpha="medium">
                  arcadeum.games / contact
                </Typography>
              </div>
              <h1 className="text-[clamp(40px,6vw,60px)] font-bold tracking-[-0.035em] leading-[1.05] mb-4">
                {titleHead ? `${titleHead} ` : ''}
                <span className="bg-[linear-gradient(120deg,var(--accent)_0%,#f472b6_100%)] bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(56,189,248,0.4)]">
                  {lastWord}
                </span>
              </h1>
              <p className="max-w-[600px] text-[18px] leading-[1.55] text-[var(--textSecondary)] m-0">
                {hero?.tagline ?? t?.tagline}
              </p>
              <div className="flex flex-row items-stretch flex-wrap gap-3 -mt-3">
                <HeroPill>
                  <span
                    aria-hidden="true"
                    className={cx(
                      'h-[7px] w-[7px] rounded-full',
                      styles.statusDot,
                    )}
                  />
                  {hero?.statusOk ?? 'All systems operational'}
                </HeroPill>
                <HeroPill icon={<ClockIcon />}>
                  {formatMessage(hero?.medianReply, { hours: '4' }) ??
                    '~ 4 hr median reply'}
                </HeroPill>
                <HeroPill icon={<ContactAvatars count={3} size={20} />}>
                  {formatMessage(hero?.humansOnline, { count: '3' }) ??
                    '3 humans online'}
                </HeroPill>
                <HeroPill icon={<GlobeIcon />}>
                  {formatMessage(hero?.languages, { count: '5' }) ??
                    '5 languages'}
                </HeroPill>
              </div>
              <div className="flex flex-col items-stretch -mt-4">
                <ActivityTicker items={tickerItems} label={ticker?.label} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-px bg-[var(--glassBorder)] border border-[var(--glassBorder)] rounded-[16px] overflow-hidden">
            <div className="bg-[var(--background)]">
              <StatTile
                value={
                  liveStats.totalMatches > 0
                    ? liveStats.totalMatches.toLocaleString()
                    : (stats?.ticketsResolvedValue ?? '0')
                }
                label={stats?.ticketsResolved ?? 'Tickets resolved this month'}
              />
            </div>
            <div className="bg-[var(--background)]">
              <StatTile
                value={stats?.avgRatingValue ?? '4.9 ★'}
                label={stats?.avgRating ?? 'Avg. support rating'}
              />
            </div>
            <div className="bg-[var(--background)]">
              <StatTile
                value={stats?.languagesSupportedValue ?? '5'}
                label={stats?.languagesSupported ?? 'Languages supported'}
              />
            </div>
            <div className="bg-[var(--background)]">
              <StatTile
                value={stats?.slaHitValue ?? '98%'}
                label={stats?.slaHit ?? 'SLA hit rate'}
              />
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
            {channelDefs.map((c) => (
              <ChannelTile
                key={c.key}
                icon={c.icon}
                title={c.title}
                sub={c.sub}
                gradient={c.gradient}
                href={c.href}
                external
              />
            ))}
          </div>

          <div className={styles.row}>
            <div className={styles.formCol}>
              <ContactForm form={form} />
              <ContactTips tips={sections?.tips} />
            </div>
            <div className={styles.sideCol}>
              <ContactSidePanel side={side} workingHours={WORKING_HOURS} />
            </div>
          </div>

          <ContactFaq
            items={faqItems}
            supportEmail={SUPPORT_EMAIL}
            title={faq?.title}
            browseLabel={faq?.browse}
            questionsLabel={sections?.common?.questionsLabel}
          />
        </div>
      </Container>
    </PageLayout>
  );
}

'use client';

import { type CSSProperties, type ReactNode } from 'react';
import { useLanguage } from '@/shared/i18n/context';
import { PageLayout } from '@arcadeum/ui/components/PageLayout/PageLayout';
import { Container } from '@arcadeum/ui/components/Container/Container';
import { Typography } from '@arcadeum/ui/components/Typography/Typography';
import { appConfig } from '@/shared/config/app-config';
import { ActivityTicker } from '@arcadeum/ui/components/ActivityTicker';
import { ChannelTile } from '@arcadeum/ui/components/ChannelTile';
import { StatTile } from '@arcadeum/ui/components/StatTile';
import { XStack, YStack } from 'tamagui';
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
import { useContactStyles } from './useContactStyles';
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
  pillStyle,
}: {
  icon?: ReactNode;
  children: ReactNode;
  pillStyle: CSSProperties;
}) {
  return (
    <span style={pillStyle}>
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
  const s = useContactStyles();
  const { messages } = useLanguage();
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

  const social = appConfig.social;
  const channelDefs = [
    social.discord && {
      key: 'discord',
      icon: <DiscordIcon />,
      title: channels?.discord?.title ?? 'Discord',
      sub: formatMessage(channels?.discord?.sub, {
        count: channels?.discord?.memberCount ?? '12.4k',
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
      <Container size="lg" maxWidth={1120}>
        <YStack gap="$8">
          <div style={s.heroWrapStyle}>
            <span
              aria-hidden="true"
              style={s.orbStyle(
                360,
                '-160px',
                '-80px',
                'rgba(56,189,248,0.45)',
              )}
            />
            <span
              aria-hidden="true"
              style={s.orbStyle(320, '-100px', '70%', 'rgba(244,114,182,0.45)')}
            />
            <YStack gap="$4" position="relative" zIndex={1}>
              <XStack flexWrap="wrap" alignItems="center" gap="$3">
                <span style={s.eyebrowStyle}>
                  <span aria-hidden="true" style={s.eyebrowDotStyle} />
                  {hero?.eyebrow ?? 'Player support'}
                </span>
                <Typography variant="caption" alpha="medium">
                  arcadeum.games / contact
                </Typography>
              </XStack>
              <h1 style={s.heroTitleStyle}>
                {titleHead ? `${titleHead} ` : ''}
                <span style={s.titleAccentStyle}>{lastWord}</span>
              </h1>
              <p style={s.heroTaglineStyle}>{hero?.tagline ?? t?.tagline}</p>
              <XStack flexWrap="wrap" gap="$3" marginTop="$3">
                <HeroPill pillStyle={s.pillStyle}>
                  <span
                    aria-hidden="true"
                    style={{
                      ...s.eyebrowDotStyle,
                      background: '#34d399',
                      boxShadow: '0 0 8px #34d399',
                    }}
                  />
                  {hero?.statusOk ?? 'All systems operational'}
                </HeroPill>
                <HeroPill pillStyle={s.pillStyle} icon={<ClockIcon />}>
                  {formatMessage(hero?.medianReply, { hours: '4' }) ??
                    '~ 4 hr median reply'}
                </HeroPill>
                <HeroPill
                  pillStyle={s.pillStyle}
                  icon={<ContactAvatars count={3} size={20} />}
                >
                  {formatMessage(hero?.humansOnline, { count: '3' }) ??
                    '3 humans online'}
                </HeroPill>
                <HeroPill pillStyle={s.pillStyle} icon={<GlobeIcon />}>
                  {formatMessage(hero?.languages, { count: '5' }) ??
                    '5 languages'}
                </HeroPill>
              </XStack>
              <YStack marginTop="$4">
                <ActivityTicker items={tickerItems} label={ticker?.label} />
              </YStack>
            </YStack>
          </div>

          <div style={s.statStripStyle}>
            <div style={s.statCellWrap}>
              <StatTile
                value={stats?.ticketsResolvedValue ?? '2,840'}
                label={stats?.ticketsResolved ?? 'Tickets resolved this month'}
              />
            </div>
            <div style={s.statCellWrap}>
              <StatTile
                value={stats?.avgRatingValue ?? '4.9 ★'}
                label={stats?.avgRating ?? 'Avg. support rating'}
              />
            </div>
            <div style={s.statCellWrap}>
              <StatTile
                value={stats?.languagesSupportedValue ?? '5'}
                label={stats?.languagesSupported ?? 'Languages supported'}
              />
            </div>
            <div style={s.statCellWrap}>
              <StatTile
                value={stats?.slaHitValue ?? '98%'}
                label={stats?.slaHit ?? 'SLA hit rate'}
              />
            </div>
          </div>

          <div style={s.tilesGridStyle}>
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
        </YStack>
      </Container>
    </PageLayout>
  );
}

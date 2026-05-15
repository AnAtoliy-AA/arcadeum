'use client';
import {
  DiscordIcon,
  FacebookIcon,
  GithubIcon,
  InstagramIcon,
  SupportIcon,
  ThreadsIcon,
  XIcon,
  YouTubeIcon,
} from '@arcadeum/ui';
import { Footer, type SocialLink } from '@arcadeum/ui/components/Footer/Footer';
import { View } from 'tamagui';
import { appConfig } from '@/shared/config/app-config';
import { useTranslation } from '@/shared/lib/useTranslation';

const SOCIAL_MAPPING = [
  { id: 'instagram', label: 'Instagram', Icon: InstagramIcon },
  { id: 'facebook', label: 'Facebook', Icon: FacebookIcon },
  { id: 'youtube', label: 'YouTube', Icon: YouTubeIcon },
  { id: 'threads', label: 'Threads', Icon: ThreadsIcon },
  { id: 'x', label: 'X', Icon: XIcon },
  { id: 'discord', label: 'Discord', Icon: DiscordIcon },
  { id: 'github', label: 'GitHub', Icon: GithubIcon },
] as const;

export default function AppFooter() {
  const { social, appName, appVersion } = appConfig;
  const { t } = useTranslation();

  const sections = [
    {
      title: t('home.footerPlatformTitle'),
      links: [
        { href: '/games', label: t('home.footerAllGames') },
        { href: '/tournaments', label: t('home.footerTournaments') },
        { href: '/leaderboards', label: t('home.footerLeaderboards') },
        { href: '/rewards', label: t('home.footerRewards') },
      ],
    },
    {
      title: t('home.footerResourcesTitle'),
      links: [
        { href: '/help', label: t('home.footerHelpCenter') },
        { href: '/blog', label: t('home.footerGamingBlog') },
        { href: '/community', label: t('home.footerCommunity') },
        { href: '/developers', label: t('home.footerDevelopers') },
      ],
    },
    {
      title: t('home.footerLegalTitle'),
      links: [
        { href: '/privacy', label: t('home.footerPrivacyPolicy') },
        { href: '/terms', label: t('home.footerTermsOfService') },
        { href: '/cookies', label: t('home.footerCookiePolicy') },
        { href: '/contact', label: t('home.footerContactUs') },
      ],
    },
  ];

  // Build socialLinks ourselves so the shared Footer doesn't auto-append a
  // standalone "support" entry that wraps to its own row on narrow widths.
  const socialLinks: SocialLink[] = SOCIAL_MAPPING.flatMap(
    ({ id, label, Icon }) => {
      const href = social?.[id as keyof typeof social];
      if (!href) return [];
      return [{ id, label, icon: <Icon size={18} />, href, external: true }];
    },
  );

  if (socialLinks.length === 0) {
    socialLinks.push({
      id: 'support',
      label: 'Support',
      icon: <SupportIcon size={16} />,
      href: '/support',
    });
  }

  return (
    <View data-testid="app-footer" $sm={{ paddingHorizontal: '$4' }}>
      <Footer
        appName={appName}
        socialLinks={socialLinks}
        copyrightLabel={t('home.footerRights', {
          year: 2026,
          appName,
        })}
        versionLabel={appVersion}
        description={t('home.footerDescription')}
        followUsLabel={t('home.footerFollowUs')}
        sections={sections}
        stableReleaseLabel={t('home.footerStableRelease')}
        craftedWithLoveLabel={t('home.footerCraftedWithLove')}
      />
    </View>
  );
}

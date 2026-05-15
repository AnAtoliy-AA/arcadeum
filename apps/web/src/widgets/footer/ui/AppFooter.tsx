'use client';
import { Footer } from '@arcadeum/ui/components/Footer/Footer';
import { appConfig } from '@/shared/config/app-config';
import { useTranslation } from '@/shared/lib/useTranslation';

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

  return (
    <div data-testid="app-footer">
      <Footer
        appName={appName}
        social={social}
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
    </div>
  );
}

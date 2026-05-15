'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/shared/lib/useTranslation';
import { appConfig } from '@/shared/config/app-config';
import {
  InstagramIcon,
  FacebookIcon,
  YouTubeIcon,
  ThreadsIcon,
  XIcon,
  DiscordIcon,
  GithubIcon,
  SupportIcon,
  ChevronDownIcon,
} from '@arcadeum/ui';

import './app-footer.css';

const SOCIAL_MAPPING = [
  { id: 'instagram', label: 'Instagram', Icon: InstagramIcon },
  { id: 'facebook', label: 'Facebook', Icon: FacebookIcon },
  { id: 'youtube', label: 'YouTube', Icon: YouTubeIcon },
  { id: 'threads', label: 'Threads', Icon: ThreadsIcon },
  { id: 'x', label: 'X', Icon: XIcon },
  { id: 'discord', label: 'Discord', Icon: DiscordIcon },
  { id: 'github', label: 'GitHub', Icon: GithubIcon },
] as const;

type SocialLink = {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
};

type FooterColumnProps = {
  title: string;
  links: { href: string; label: string }[];
};

const CollapsibleColumn = ({ title, links }: FooterColumnProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <div className={`home-footer-column ${isOpen ? 'open' : ''}`}>
      <div className="home-footer-col-header" onClick={toggle}>
        <h3 className="home-footer-col-title">{title.toUpperCase()}</h3>
        <div className="home-footer-chevron">
          <ChevronDownIcon size={16} />
        </div>
      </div>
      <div className="home-footer-col-content">
        <ul className="home-footer-list">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="home-footer-link">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default function AppFooter() {
  const { social, appName, appVersion } = appConfig;
  const { t } = useTranslation();
  const CURRENT_YEAR = 2026;

  const sections: FooterColumnProps[] = [
    {
      title: t('home.footerPlatformTitle') || 'Platform',
      links: [
        { href: '/games', label: t('home.footerAllGames') || 'All Games' },
        {
          href: '/tournaments',
          label: t('home.footerTournaments') || 'Tournaments',
        },
        {
          href: '/leaderboards',
          label: t('home.footerLeaderboards') || 'Leaderboards',
        },
        { href: '/rewards', label: t('home.footerRewards') || 'Rewards' },
      ],
    },
    {
      title: t('home.footerResourcesTitle') || 'Resources',
      links: [
        { href: '/help', label: t('home.footerHelpCenter') || 'Help Center' },
        { href: '/blog', label: t('home.footerGamingBlog') || 'Gaming Blog' },
        { href: '/community', label: t('home.footerCommunity') || 'Community' },
        {
          href: '/developers',
          label: t('home.footerDevelopers') || 'Developers (API)',
        },
      ],
    },
    {
      title: t('home.footerLegalTitle') || 'Legal',
      links: [
        {
          href: '/privacy',
          label: t('home.footerPrivacyPolicy') || 'Privacy Policy',
        },
        {
          href: '/terms',
          label: t('home.footerTermsOfService') || 'Terms of Service',
        },
        {
          href: '/cookies',
          label: t('home.footerCookiePolicy') || 'Cookie Policy',
        },
        { href: '/contact', label: t('home.footerContactUs') || 'Contact Us' },
      ],
    },
  ];

  const socialLinks: SocialLink[] = [];
  if (social) {
    SOCIAL_MAPPING.forEach(({ id, label, Icon }) => {
      const href = social[id as keyof typeof social];
      if (href && typeof href === 'string') {
        socialLinks.push({ id, label, icon: <Icon size={22} />, href });
      }
    });
  }

  if (socialLinks.length === 0 || (social && 'support' in social)) {
    socialLinks.push({
      id: 'support',
      label: 'Support',
      icon: <SupportIcon size={20} />,
      href: '/support',
    });
  }

  return (
    <div className="home-footer-wrapper">
      <footer className="home-footer-root" data-testid="app-footer">
        <div className="home-footer-border-line" />
        <div className="home-footer-container">
          <div className="home-footer-grid">
            <div className="home-footer-brand-col">
              <div className="home-footer-brand-info">
                <h2 className="home-footer-brand-name">
                  {appName.toUpperCase()}
                </h2>
                <p className="home-footer-description">
                  {t('home.footerDescription') ||
                    'Your ultimate destination for competitive and casual gaming experiences.'}
                </p>
              </div>

              <div className="home-footer-social">
                <h3 className="home-footer-social-title">
                  {t('home.footerFollowUs')?.toUpperCase() || 'FOLLOW US'}
                </h3>
                <div className="home-footer-social-links">
                  {socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label}
                      className="home-footer-social-icon"
                      data-testid={`footer-social-${link.id}`}
                    >
                      {link.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {sections.map((section) => (
              <CollapsibleColumn
                key={section.title}
                title={section.title}
                links={section.links}
              />
            ))}
          </div>

          <div className="home-footer-bottom-bar">
            <div className="home-footer-copyright-col">
              <p className="home-footer-copyright">
                {t('home.footerRights', { year: CURRENT_YEAR, appName }) ||
                  `© ${CURRENT_YEAR} ${appName}. All rights reserved.`}
              </p>
              <div className="home-footer-version">
                <div className="home-footer-status-dot" />
                <span className="home-footer-version-text">
                  {t('home.footerStableRelease') || 'STABLE RELEASE'}{' '}
                  {appVersion}
                </span>
              </div>
            </div>

            <div className="home-footer-crafted">
              <p>
                {t('home.footerCraftedWithLove') ||
                  'Crafted with passion for gamers worldwide.'}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

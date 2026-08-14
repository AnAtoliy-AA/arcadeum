'use client';

import { memo, useMemo, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
  InstagramIcon,
  FacebookIcon,
  YouTubeIcon,
  ThreadsIcon,
  XIcon,
  TelegramIcon,
  DiscordIcon,
  GithubIcon,
  SupportIcon,
  ChevronDownIcon,
} from '../Icons';
import { Typography } from '../Typography/Typography';
import { Container } from '../Container/Container';
import { FooterLink } from './FooterLink';
import { SocialIcon } from './SocialIcon';
import { cx } from '../../utils/cx';

export type SocialLink = {
  id: string;
  label: string;
  icon: ReactNode;
  href: string;
  external?: boolean;
};

export type FooterLinkItem = {
  href: string;
  label: string;
};

export type FooterSection = {
  title: string;
  links: FooterLinkItem[];
};

export type FooterProps = {
  social?: Record<string, string | undefined>;
  socialLinks?: SocialLink[];
  followUsLabel?: string;
  copyrightLabel?: string;
  versionLabel?: string;
  description?: string;
  appName?: string;
  sections?: FooterSection[];
  craftedWithLoveLabel?: string;
  stableReleaseLabel?: string;
};

const SOCIAL_MAPPING = [
  { id: 'instagram', label: 'Instagram', Icon: InstagramIcon },
  { id: 'facebook', label: 'Facebook', Icon: FacebookIcon },
  { id: 'youtube', label: 'YouTube', Icon: YouTubeIcon },
  { id: 'threads', label: 'Threads', Icon: ThreadsIcon },
  { id: 'x', label: 'X', Icon: XIcon },
  { id: 'telegram', label: 'Telegram', Icon: TelegramIcon },
  { id: 'discord', label: 'Discord', Icon: DiscordIcon },
  { id: 'github', label: 'GitHub', Icon: GithubIcon },
] as const;

const CURRENT_YEAR = 2026;

type CollapsibleColumnProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

const CollapsibleColumn = ({ title, children, defaultOpen = false }: CollapsibleColumnProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <div className="flex min-w-[180px] flex-col gap-4 sm:min-w-full sm:gap-0 sm:border-b sm:border-[var(--glassBorder)] sm:pb-4">
      <div
        onClick={toggle}
        className="flex cursor-pointer items-center justify-between py-4 sm:pointer-events-none sm:py-0 sm:pb-2"
      >
        <Typography variant="heading" uiSize="sm" weight="700" tracking="sm">
          {title.toUpperCase()}
        </Typography>
        <span
          className="sm:hidden"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
        >
          <ChevronDownIcon size={16} />
        </span>
      </div>

      <div className={cx('flex flex-col gap-3 sm:flex sm:pb-6 sm:pt-2 sm:items-center', !isOpen && 'hidden sm:flex')}>
        {children}
      </div>
    </div>
  );
};

export const Footer = memo(function Footer({
  social,
  socialLinks: customSocialLinks,
  followUsLabel = 'Follow Us',
  copyrightLabel,
  versionLabel = '1.1.0',
  description = 'Your ultimate destination for competitive and casual gaming experiences.',
  appName = 'Arcadeum',
  sections,
  craftedWithLoveLabel = 'Crafted with passion for gamers worldwide.',
  stableReleaseLabel = 'STABLE RELEASE',
}: FooterProps) {
  const socialLinks = useMemo(() => {
    if (customSocialLinks) return customSocialLinks;

    const links: SocialLink[] = [];

    if (social) {
      SOCIAL_MAPPING.forEach(({ id, label, Icon }) => {
        const href = social[id];
        if (href) {
          links.push({
            id,
            label,
            icon: <Icon size={18} />,
            href,
            external: true,
          });
        }
      });
    }

    if (links.length === 0 || social?.support !== null) {
      links.push({
        id: 'support',
        label: (social?.support_label as string) || 'Support',
        icon: <SupportIcon size={16} />,
        href: (social?.support_href as string) || '/support',
      });
    }

    return links;
  }, [social, customSocialLinks]);

  const defaultSections: FooterSection[] = [
    {
      title: 'Platform',
      links: [
        { href: '/games', label: 'All Games' },
        { href: '/tournaments', label: 'Tournaments' },
        { href: '/leaderboards', label: 'Leaderboards' },
        { href: '/rewards', label: 'Rewards' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { href: '/help', label: 'Help Center' },
        { href: '/blog', label: 'Gaming Blog' },
        { href: '/community', label: 'Community' },
        { href: '/developers', label: 'Developers (API)' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { href: '/privacy', label: 'Privacy Policy' },
        { href: '/terms', label: 'Terms of Service' },
        { href: '/cookies', label: 'Cookie Policy' },
        { href: '/contact', label: 'Contact Us' },
      ],
    },
  ];

  const footerSections = sections || defaultSections;

  return (
    <footer className="w-full">
      <div
        className="relative w-full pb-10 pt-12 backdrop-blur-[32px] backdrop-saturate-[1.8] sm:pb-8 sm:pt-10"
        style={{ backgroundColor: 'var(--glass-background)' }}
      >
        {/* Top glow border */}
        <div
          className="pointer-events-none absolute left-0 right-0 top-0 h-px opacity-80"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, var(--glass-border) 15%, var(--primaryGradientStart) 50%, var(--glass-border) 85%, transparent 100%)',
          }}
        />
        <Container size="xl">
          <div className="flex w-full flex-wrap justify-between gap-12 sm:flex-col sm:items-center sm:gap-0">
            {/* Brand column */}
            <div className="flex min-w-[320px] max-w-[600px] flex-2 flex-col gap-6 sm:min-w-full sm:flex-grow-0 sm:flex-shrink-0 sm:items-center sm:pb-10 sm:mb-6 sm:border-b sm:border-[var(--glassBorder)]">
              <div className="flex flex-col gap-4 sm:items-center">
                <Typography
                  variant="heading"
                  uiSize="3xl"
                  weight="800"
                  gradient="primary"
                  className="sm:text-center"
                >
                  {appName.toUpperCase()}
                </Typography>
                <Typography
                  uiSize="md"
                  alpha="medium"
                  className="sm:text-center"
                  style={{ lineHeight: 24, maxWidth: 500 }}
                >
                  {description}
                </Typography>
              </div>

              <div className="flex flex-col gap-4 sm:items-center">
                <Typography variant="label" uiSize="xs" weight="700" tracking="xl">
                  {followUsLabel.toUpperCase()}
                </Typography>
                <div className="flex flex-wrap gap-3 sm:justify-center">
                  {socialLinks.map((link) => (
                    <SocialIcon
                      key={link.id}
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      aria-label={link.label}
                      data-testid={`footer-social-${link.id}`}
                    >
                      {link.icon}
                    </SocialIcon>
                  ))}
                </div>
              </div>
            </div>

            {footerSections.map((section) => (
              <CollapsibleColumn key={section.title} title={section.title}>
                {section.links.map((link) => (
                  <FooterLink key={link.href} href={link.href}>
                    {link.label}
                  </FooterLink>
                ))}
              </CollapsibleColumn>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-[var(--borderColor)] pt-8 sm:mt-10 sm:flex-col sm:items-center">
            <div className="flex flex-col gap-1 sm:items-center">
              <Typography uiSize="sm" alpha="medium" className="sm:text-center">
                {copyrightLabel || `© ${CURRENT_YEAR} ${appName}. All rights reserved.`}
              </Typography>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-[6px] w-[6px] rounded-[3px]"
                  style={{ backgroundColor: 'var(--success)' }}
                />
                <Typography variant="label" uiSize="xs" tracking="xl">
                  {stableReleaseLabel} {versionLabel}
                </Typography>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6">
              <Typography uiSize="xs" className="sm:text-center">
                {craftedWithLoveLabel}
              </Typography>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
});

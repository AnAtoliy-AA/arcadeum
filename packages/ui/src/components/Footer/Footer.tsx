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
  rel?: string;
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
  className?: string;
  'data-testid'?: string;
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
  defaultMobileOpen?: boolean;
};

const CollapsibleColumn = ({
  title,
  children,
  defaultMobileOpen = false,
}: CollapsibleColumnProps) => {
  const [isOpen, setIsOpen] = useState(defaultMobileOpen);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <div className="flex min-w-[180px] flex-col gap-4 max-[800px]:min-w-full max-[800px]:gap-0 max-[800px]:border-b max-[800px]:border-[var(--glassBorder)] max-[800px]:py-1">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        className="flex w-full cursor-pointer items-center justify-between bg-transparent text-[var(--color)] py-4 text-left max-[800px]:py-3 min-[801px]:pointer-events-none"
      >
        <Typography variant="heading" uiSize="sm" weight="700" tracking="sm">
          {title.toUpperCase()}
        </Typography>
        <span
          className={cx(
            'transition-transform duration-200 min-[801px]:hidden text-[var(--colorMuted)]',
            isOpen ? 'rotate-180' : 'rotate-0',
          )}
        >
          <ChevronDownIcon size={16} />
        </span>
      </button>

      <div
        className={cx(
          'flex flex-col gap-3 min-[801px]:flex',
          isOpen
            ? 'flex pb-4 pt-1 max-[800px]:items-start'
            : 'hidden min-[801px]:flex',
        )}
      >
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
  className,
  'data-testid': dataTestId,
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
    <footer className={cx('w-full', className)} data-testid={dataTestId}>
      <div className="relative w-full bg-[var(--glassBg)] pb-10 pt-12 backdrop-blur-[32px] backdrop-saturate-[1.8] max-[800px]:pb-8 max-[800px]:pt-10">
        <div className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--primaryGradientStart)] to-transparent opacity-80" />
        <Container size="xl">
          <div className="flex w-full flex-wrap justify-between gap-12 max-[800px]:flex-col max-[800px]:items-center max-[800px]:gap-0">
            <div className="flex min-w-[320px] max-w-[600px] grow-[2] flex-col gap-6 max-[800px]:mb-6 max-[800px]:min-w-full max-[800px]:flex-grow-0 max-[800px]:flex-shrink-0 max-[800px]:items-center max-[800px]:border-b max-[800px]:border-[var(--glassBorder)] max-[800px]:pb-10">
              <div className="flex flex-col gap-4 max-[800px]:items-center">
                <Typography
                  variant="heading"
                  uiSize="3xl"
                  weight="800"
                  gradient="primary"
                  className="max-[800px]:text-center"
                >
                  {appName.toUpperCase()}
                </Typography>
                <Typography
                  uiSize="md"
                  alpha="medium"
                  className="max-w-[500px] leading-[24px] max-[800px]:text-center"
                >
                  {description}
                </Typography>
              </div>

              <div className="flex flex-col gap-4 max-[800px]:items-center">
                <Typography
                  variant="label"
                  uiSize="xs"
                  weight="700"
                  tracking="xl"
                >
                  {followUsLabel.toUpperCase()}
                </Typography>
                <div className="flex flex-wrap gap-3 max-[800px]:justify-center">
                  {socialLinks.map((link) => (
                    <SocialIcon
                      key={link.id}
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={
                        link.rel ??
                        (link.external ? 'noopener noreferrer' : undefined)
                      }
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

          <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-[var(--borderColor)] pt-8 max-[800px]:mt-10 max-[800px]:flex-col max-[800px]:items-center">
            <div className="flex flex-col gap-1 max-[800px]:items-center">
              <Typography
                uiSize="sm"
                alpha="medium"
                className="max-[800px]:text-center"
              >
                {copyrightLabel ||
                  `© ${CURRENT_YEAR} ${appName}. All rights reserved.`}
              </Typography>
              <div className="flex items-center gap-2">
                <span className="inline-block h-[6px] w-[6px] rounded-[3px] bg-[var(--success)]" />
                <Typography variant="label" uiSize="xs" tracking="xl">
                  {stableReleaseLabel} {versionLabel}
                </Typography>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6">
              <Typography uiSize="xs" className="max-[800px]:text-center">
                {craftedWithLoveLabel}
              </Typography>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
});

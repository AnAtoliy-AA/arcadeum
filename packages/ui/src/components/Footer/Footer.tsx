'use client';

import { YStack, XStack, styled, View } from 'tamagui';
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

const FooterRoot = styled(View, {
  name: 'Footer',
  width: '100%',
  backgroundColor: 'var(--glass-background)',
  borderTopWidth: 0,
  paddingTop: '$12',
  paddingBottom: '$10',
  position: 'relative',
  backdropFilter: 'blur(32px) saturate(180%)',

  $sm: {
    paddingTop: '$10',
    paddingBottom: '$8',
  },
});

const FooterBorderLine = styled(YStack, {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 1,
  pointerEvents: 'none',
  background:
    'linear-gradient(90deg, transparent 0%, var(--glass-border) 15%, var(--primaryGradientStart) 50%, var(--glass-border) 85%, transparent 100%)',
  opacity: 0.8,
});

const FooterGrid = styled(XStack, {
  gap: '$12',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  width: '100%',

  $tablet: {
    gap: '$8',
  },

  $sm: {
    flexDirection: 'column',
    gap: 0,
    alignItems: 'center',
  },
});

const BrandColumn = styled(YStack, {
  gap: '$6',
  flex: 2,
  minWidth: 320,
  maxWidth: 600,

  $sm: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    alignItems: 'center',
    minWidth: '100%',
    paddingBottom: '$10',
    borderBottomWidth: 1,
    borderBottomColor: '$glassBorder',
    marginBottom: '$6',
  },
});

const FooterColumnContainer = styled(YStack, {
  gap: '$4',
  minWidth: 180,

  $sm: {
    minWidth: '100%',
    gap: 0,
    borderBottomWidth: 1,
    borderBottomColor: '$glassBorder',
    paddingBottom: '$4', // Clearance when closed
  },
});

const ColumnHeader = styled(XStack, {
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: '$4',
  cursor: 'pointer',

  $gtSm: {
    paddingVertical: 0,
    paddingBottom: '$2',
    pointerEvents: 'none',
  },
});

const ColumnContent = styled(YStack, {
  gap: '$3',

  $sm: {
    paddingBottom: '$6',
    paddingTop: '$2',
    alignItems: 'center',
  },
});

const ChevronContainer = styled(View, {
  $gtSm: { display: 'none' },
});

type CollapsibleColumnProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

const CollapsibleColumn = ({ title, children, defaultOpen = false }: CollapsibleColumnProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <FooterColumnContainer>
      <ColumnHeader onClick={toggle}>
        <Typography variant="heading" uiSize="sm" weight="700" tracking="sm">
          {title.toUpperCase()}
        </Typography>
        <ChevronContainer rotate={isOpen ? '180deg' : '0deg'}>
          <ChevronDownIcon size={16} />
        </ChevronContainer>
      </ColumnHeader>

      <YStack $sm={{ display: isOpen ? 'flex' : 'none' }}>
        <ColumnContent>
          {children}
        </ColumnContent>
      </YStack>
    </FooterColumnContainer>
  );
};

const BottomBar = styled(XStack, {
  borderTopWidth: 1,
  borderTopColor: '$borderColor',
  marginTop: '$12',
  paddingTop: '$8',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '$6',

  $sm: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '$10',
  },
});

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
    <YStack asChild width="100%">
      <footer>
        <FooterRoot>
          <FooterBorderLine />
          <Container size="xl">
            <FooterGrid>
              <BrandColumn>
                <YStack gap="$4" $sm={{ alignItems: 'center' }}>
                  <Typography
                    variant="heading"
                    uiSize="3xl"
                    weight="800"
                    gradient="primary"
                    $sm={{ textCenter: true }}
                  >
                    {appName.toUpperCase()}
                  </Typography>
                  <Typography
                    uiSize="md"
                    alpha="medium"
                    lineHeight={24}
                    maxWidth={500}
                    $sm={{ textCenter: true }}
                  >
                    {description}
                  </Typography>
                </YStack>

                <YStack gap="$4" $sm={{ alignItems: 'center' }}>
                  <Typography variant="label" uiSize="xs" weight="700" tracking="xl">
                    {followUsLabel.toUpperCase()}
                  </Typography>
                  <XStack gap="$3" flexWrap="wrap" $sm={{ justifyContent: 'center' }}>
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
                  </XStack>
                </YStack>
              </BrandColumn>

              {footerSections.map((section) => (
                <CollapsibleColumn key={section.title} title={section.title}>
                  {section.links.map((link) => (
                    <FooterLink key={link.href} href={link.href}>
                      {link.label}
                    </FooterLink>
                  ))}
                </CollapsibleColumn>
              ))}
            </FooterGrid>

            <BottomBar>
              <YStack gap="$1" $sm={{ alignItems: 'center' }}>
                <Typography uiSize="sm" alpha="medium" $sm={{ textCenter: true }}>
                  {copyrightLabel || `© ${CURRENT_YEAR} ${appName}. All rights reserved.`}
                </Typography>
                <XStack gap="$2" alignItems="center">
                  <View width={6} height={6} borderRadius={3} backgroundColor="$success" />
                  <Typography variant="label" uiSize="xs" tracking="xl">
                    {stableReleaseLabel} {versionLabel}
                  </Typography>
                </XStack>
              </YStack>

              <XStack alignItems="center" gap="$6" flexWrap="wrap" justifyContent="center">
                <Typography uiSize="xs" $sm={{ textCenter: true }}>
                  {craftedWithLoveLabel}
                </Typography>
              </XStack>
            </BottomBar>
          </Container>
        </FooterRoot>
      </footer>
    </YStack>
  );
});

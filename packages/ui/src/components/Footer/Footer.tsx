'use client';

import { YStack, XStack, styled, View } from 'tamagui';
import { memo, useMemo } from 'react';
import type { ReactNode } from 'react';
import {
  InstagramIcon,
  FacebookIcon,
  YouTubeIcon,
  ThreadsIcon,
  XIcon,
  DiscordIcon,
  SupportIcon,
} from '../Icons';
import { Typography } from '../Typography/Typography';
import { Container } from '../Container/Container';
import { Divider } from '../Divider/Divider';
import { FooterLink } from './FooterLink';
import { SocialIcon } from './SocialIcon';

export type SocialLink = {
  id: string;
  label: string;
  icon: ReactNode;
  href: string;
  external?: boolean;
};

export type FooterProps = {
  social?: Record<string, string | undefined>;
  socialLinks?: SocialLink[];
  followUsLabel?: string;
  copyrightLabel?: string;
  versionLabel?: string;
  description?: string;
  appName?: string;
};

const SOCIAL_MAPPING = [
  { id: 'instagram', label: 'Instagram', Icon: InstagramIcon },
  { id: 'facebook', label: 'Facebook', Icon: FacebookIcon },
  { id: 'youtube', label: 'YouTube', Icon: YouTubeIcon },
  { id: 'threads', label: 'Threads', Icon: ThreadsIcon },
  { id: 'x', label: 'X', Icon: XIcon },
  { id: 'discord', label: 'Discord', Icon: DiscordIcon },
] as const;

const CURRENT_YEAR = new Date().getFullYear();

const FooterRoot = styled(View, {
  name: 'Footer',
  width: '100%',
  backgroundColor: '$glassBg',
  borderTopWidth: 0,
  paddingTop: '$10',
  paddingBottom: '$8',
  position: 'relative',
  backdropFilter: 'blur(24px) saturate(180%)',
});

const FooterBorderLine = styled(YStack, {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 1,
  pointerEvents: 'none',
  background:
    'linear-gradient(90deg, transparent 0%, var(--borderColor) 15%, var(--primaryGradientStart) 50%, var(--borderColor) 85%, transparent 100%)',
});

const BrandSection = styled(XStack, {
  gap: '$8',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  alignItems: 'center',

  $xs: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: '$6',
  },
});

const BrandInfo = styled(YStack, {
  flex: 1,
  minWidth: 280,
  gap: '$2',

  $xs: {
    alignItems: 'center',
  },
});

const BottomBar = styled(XStack, {
  borderTopWidth: 1,
  borderTopColor: '$borderColor',
  marginTop: '$12',
  paddingTop: '$8',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '$6',

  $xs: {
    flexDirection: 'column',
    alignItems: 'center',
  },
});

export const Footer = memo(function Footer({
  social,
  socialLinks: customSocialLinks,
  followUsLabel = 'Follow Us',
  copyrightLabel,
  versionLabel = '1.0.0',
  description = 'Your ultimate destination for competitive and casual gaming experiences.',
  appName = 'Arcadeum',
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
            icon: <Icon size={20} />,
            href,
            external: true,
          });
        }
      });
    }

    if (links.length === 0 || social?.support !== null) {
      links.push({
        id: 'support',
        label: 'Support',
        icon: <SupportIcon size={18} />,
        href: '/support',
      });
    }

    return links;
  }, [social, customSocialLinks]);

  return (
    <YStack asChild width="100%">
      <footer>
        <FooterRoot>
          <FooterBorderLine />
          <Container size="xl">
            <BrandSection>
              <BrandInfo>
                <YStack gap="$2">
                  <Typography variant="heading" uiSize="2xl" weight="800" gradient="primary">
                    {appName}
                  </Typography>
                  <Typography uiSize="md" alpha="medium" maxWidth={420} lineHeight={24}>
                    {description}
                  </Typography>
                </YStack>
              </BrandInfo>

              <YStack gap="$4" alignItems="flex-end" $xs={{ alignItems: 'center' }}>
                <Typography variant="label" uiSize="xs" alpha="low">
                  {followUsLabel}
                </Typography>
                <XStack gap="$3" flexWrap="wrap" justifyContent="center">
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
            </BrandSection>

            <BottomBar>
              <YStack gap="$1" $xs={{ alignItems: 'center' }}>
                <Typography uiSize="sm" alpha="medium">
                  {copyrightLabel || `© ${CURRENT_YEAR} ${appName}`}
                </Typography>
                <Typography variant="label" uiSize="xs" tracking="xl" alpha="low">
                  VERSION {versionLabel}
                </Typography>
              </YStack>

              <XStack alignItems="center" gap="$4" flexWrap="wrap" justifyContent="center">
                <FooterLink href="/contact" data-testid="footer-legal-contact">Contact Us</FooterLink>
                <Divider vertical spacing="none" height={12} opacity={0.3} $xs={{ display: 'none' }} />
                <FooterLink href="/privacy" data-testid="footer-legal-privacy">Privacy Policy</FooterLink>
                <Divider vertical spacing="none" height={12} opacity={0.3} $xs={{ display: 'none' }} />
                <FooterLink href="/terms" data-testid="footer-legal-terms">Terms of Service</FooterLink>
              </XStack>
            </BottomBar>
          </Container>
        </FooterRoot>
      </footer>
    </YStack>
  );
});

'use client';

import { styled, YStack, XStack, Text } from 'tamagui';

export const FooterSection = styled(YStack, {
  tag: 'footer',
  paddingTop: '$10',
  paddingBottom: '$6',
  paddingHorizontal: '$6',
  backgroundColor: '$background',
  borderTopWidth: 1,
  borderTopColor: '$borderColor',
  position: 'relative',
  zIndex: 10,
} as any);

export const FooterContent = styled(YStack, {
  maxWidth: 1200,
  alignSelf: 'center',
  width: '100%',
  gap: '$8',
  alignItems: 'center',
} as any);

export const SocialContainer = styled(YStack, {
  alignItems: 'center',
  gap: '$5',
} as any);

export const SocialTitle = styled(Text, {
  tag: 'h3',
  fontSize: 14,
  fontWeight: '600',
  letterSpacing: 1,
  textTransform: 'uppercase',
  color: 'rgba(236, 239, 238, 0.45)',
  margin: 0,
} as any);

export const SocialLinks = styled(XStack, {
  gap: '$5',
  flexWrap: 'wrap',
  justifyContent: 'center',
} as any);

// SocialIcon has ::before pseudo-element and hover — use CSS class + inline <style>
export const SOCIAL_ICON_CLASS = 'footer-social-icon';

export const socialIconCSS = `
  .footer-social-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #1e2122;
    border: 1px solid #32353d;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: #ecefee;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
    text-decoration: none;
  }
  .footer-social-icon::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #7ad7ff, #57c3ff);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .footer-social-icon span,
  .footer-social-icon svg {
    position: relative;
    z-index: 1;
  }
  .footer-social-icon:hover {
    transform: translateY(-2px);
    border-color: transparent;
    color: white;
    box-shadow: 0 4px 12px #7ad7ff40;
  }
  .footer-social-icon:hover::before {
    opacity: 1;
  }
  .footer-social-icon:hover svg {
    fill: currentColor;
  }
`;

export const Copyright = styled(YStack, {
  alignItems: 'center',
} as any);

export const VersionText = styled(Text, {
  tag: 'span',
  opacity: 0.5,
  marginLeft: '$2',
  fontVariantNumeric: 'tabular-nums',
} as any);

export const LegalLinks = styled(XStack, {
  gap: '$5',
  marginTop: '$3',
  flexWrap: 'wrap',
  justifyContent: 'center',
} as any);

// LegalLink has :hover — use CSS class + inline <style>
export const LEGAL_LINK_CLASS = 'footer-legal-link';

export const legalLinkCSS = `
  .footer-legal-link {
    font-size: 0.85rem;
    color: rgba(236, 239, 238, 0.45);
    text-decoration: none;
    transition: color 0.2s;
  }
  .footer-legal-link:hover {
    color: #ecefee;
  }
`;

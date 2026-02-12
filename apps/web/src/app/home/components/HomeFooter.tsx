'use client';

import Link from 'next/link';
import { useLanguage, formatMessage } from '@/app/i18n/LanguageProvider';
import { appConfig } from '@/shared/config/app-config';
import { routes } from '@/shared/config/routes';
import {
  FooterSection,
  FooterContent,
  SocialContainer,
  SocialTitle,
  SocialLinks,
  SocialIcon,
  Copyright,
} from './styles/Footer.styles';

const SOCIAL_ICONS = [
  {
    id: 'instagram' as const,
    label: 'Instagram',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.919-.058-1.265-.069-1.645-.069-4.849 0-3.204.012-3.584.069-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    id: 'facebook' as const,
    label: 'Facebook',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: 'youtube' as const,
    label: 'YouTube',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
      </svg>
    ),
  },
  {
    id: 'support' as const,
    label: 'Support',
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
];

export function HomeFooter() {
  const { messages } = useLanguage();
  const homeCopy = messages.home ?? {};
  const { social, appName } = appConfig;

  const currentYear = new Date().getFullYear();

  return (
    <FooterSection>
      <FooterContent>
        <SocialContainer>
          <SocialTitle>{homeCopy.footerFollowUs ?? 'Follow Us'}</SocialTitle>
          <SocialLinks>
            {SOCIAL_ICONS.map((item) => {
              if (item.id === 'support') {
                return (
                  <SocialIcon
                    key={item.id}
                    as={Link}
                    href={routes.support}
                    aria-label={item.label}
                  >
                    {item.icon}
                  </SocialIcon>
                );
              }

              const href = social[item.id as keyof typeof social];
              if (!href) return null;

              return (
                <SocialIcon
                  key={item.id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                >
                  {item.icon}
                </SocialIcon>
              );
            })}
          </SocialLinks>
        </SocialContainer>

        <Copyright>
          {formatMessage(homeCopy.footerRights, {
            year: currentYear,
            appName,
          }) ?? `© ${currentYear} ${appName}. All rights reserved.`}
        </Copyright>
      </FooterContent>
    </FooterSection>
  );
}

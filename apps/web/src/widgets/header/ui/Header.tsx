'use client';

import React, { useCallback, useMemo } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
import { appConfig } from '@/shared/config/app-config';
import { routes } from '@/shared/config/routes';
import { InstallPWAButton } from '@/features/pwa';
import { LinkButton } from '@/shared/ui';
import { ProfileMenu } from './ProfileMenu';
import { MobileMenu } from './MobileMenu';

export function Header() {
  const pathname = usePathname();
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isAuthenticated = !!snapshot.accessToken;
  const displayName =
    snapshot.displayName || snapshot.username || snapshot.email;

  const navItems = useMemo(
    () => [
      { href: routes.games, label: t('navigation.gamesTab') },
      { href: routes.chats, label: t('navigation.chatsTab') },
      { href: routes.history, label: t('navigation.historyTab') },
      { href: routes.stats, label: t('navigation.statsTab') },
      { href: routes.settings, label: t('navigation.settingsTab') },
    ],
    [t],
  );

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  // Close mobile menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        isMobileMenuOpen &&
        !target.closest('[data-mobile-menu]') &&
        !target.closest('[data-mobile-menu-button]')
      ) {
        closeMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMobileMenuOpen, closeMobileMenu]);

  return (
    <>
      <HeaderContainer>
        <HeaderInner>
          <Logo href="/" onClick={closeMobileMenu}>
            <Image src="/logo.png" alt="" width={32} height={32} priority />
            <LogoText>{appConfig.appName}</LogoText>
          </Logo>

          <Nav>
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                $active={pathname === item.href}
              >
                {item.label}
              </NavLink>
            ))}
          </Nav>

          <Actions>
            <InstallPWAButton />
            <DesktopOnly>
              <LinkButton
                href={routes.support}
                variant="ghost"
                size="sm"
                aria-label={t('common.actions.support')}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: 18, height: 18, color: '#ec4899' }}
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {t('common.actions.support')}
              </LinkButton>
            </DesktopOnly>
            {isAuthenticated && displayName && <ProfileMenu />}

            {!isAuthenticated && (
              <DesktopOnly>
                <NavLink
                  href={routes.terms}
                  $active={pathname === routes.terms}
                >
                  {t('legal.nav.terms')}
                </NavLink>
                <NavLink
                  href={routes.privacy}
                  $active={pathname === routes.privacy}
                >
                  {t('legal.nav.privacy')}
                </NavLink>
                <NavLink
                  href={routes.contact}
                  $active={pathname === routes.contact}
                >
                  {t('legal.nav.contact')}
                </NavLink>
                <AuthButton href="/auth">
                  {t('common.actions.login')}
                </AuthButton>
              </DesktopOnly>
            )}

            <MobileLoginIndicator
              href={isAuthenticated ? routes.settings : routes.auth}
              $isAuthenticated={isAuthenticated}
              title={
                isAuthenticated ? displayName || 'Logged in' : 'Not logged in'
              }
            >
              {isAuthenticated ? (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              )}
            </MobileLoginIndicator>

            <MobileMenuButton
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              data-mobile-menu-button
              data-testid="mobile-menu-button"
            >
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
                {isMobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </MobileMenuButton>
          </Actions>
        </HeaderInner>
      </HeaderContainer>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        navItems={navItems}
      />
    </>
  );
}

import {
  HeaderContainer,
  HeaderInner,
  Logo,
  LogoText,
  Nav,
  NavLink,
  Actions,
  DesktopOnly,
  AuthButton,
  MobileMenuButton,
  MobileLoginIndicator,
} from './styles';

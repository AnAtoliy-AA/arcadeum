'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
import { routes } from '@/shared/config/routes';
import { InstallPWAButton } from '@/features/pwa';
import {
  Button,
  SupportIcon,
  MenuIcon,
  CloseIcon,
  LinkButton,
  MobileLoginIndicator,
} from '@arcadeum/ui';
import { ProfileMenu } from './ProfileMenu';
import { MobileMenu } from './MobileMenu';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Nav, Actions, DesktopOnly, MobileMenuContainer, NavLinkContainer, NavHeaderLink, NavLinkIndicator } from './styles';

export function HeaderInteractive() {
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

  useEffect(() => {
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
      <Nav>
        {navItems.map((item) => (
          <NavLinkContainer key={item.href}>
            <NavHeaderLink
              href={item.href}
              variant="ghost"
              size="sm"
              isActive={pathname === item.href}
              data-testid={`nav-${item.href.replace('/', '') || 'home'}`}
            >
              {item.label}
            </NavHeaderLink>
            <NavLinkIndicator active={pathname === item.href} />
          </NavLinkContainer>
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
            <SupportIcon size={18} />
            {t('common.actions.support')}
          </LinkButton>
        </DesktopOnly>
        <LanguageSwitcher data-testid="header-language-switcher" />
        {isAuthenticated && displayName && <ProfileMenu />}

        {!isAuthenticated && (
          <DesktopOnly>
            <LinkButton
              variant="primary"
              size="sm"
              href="/auth"
              data-testid="desktop-login-button"
            >
              {t('common.actions.login')}
            </LinkButton>
          </DesktopOnly>
        )}

        <MobileLoginIndicator
          href={isAuthenticated ? routes.settings : routes.auth}
          isAuthenticated={isAuthenticated}
          title={isAuthenticated ? displayName || 'Logged in' : 'Not logged in'}
          data-testid="mobile-login-indicator"
        />

        <MobileMenuContainer>
          <Button
            variant="icon"
            size="sm"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
            data-mobile-menu-button
            data-testid="mobile-menu-button"
          >
            {isMobileMenuOpen ? (
              <CloseIcon size={20} />
            ) : (
              <MenuIcon size={20} />
            )}
          </Button>
        </MobileMenuContainer>
      </Actions>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        navItems={navItems}
      />
    </>
  );
}

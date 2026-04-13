'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
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
import {
  Nav,
  Actions,
  DesktopOnly,
  MobileMenuContainer,
  NavLinkWrapper,
  NavHeaderLink,
  NavLinkIndicator,
} from './styles';
import { useIsMounted } from './useIsMounted';
import { useHeaderAuth } from './useHeaderAuth';
import { useMobileMenu } from './useMobileMenu';

export function HeaderInteractive() {
  const isMounted = useIsMounted();
  const pathname = usePathname();
  const { isAuthenticated, displayName } = useHeaderAuth();
  const { t } = useTranslation();
  const { isOpen: isMobileMenuOpen, toggle: toggleMobileMenu } =
    useMobileMenu();

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

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <Nav>
        {navItems.map((item) => (
          <NavLinkWrapper key={item.href}>
            <NavHeaderLink
              href={item.href}
              variant="ghost"
              size="sm"
              isActive={pathname === item.href}
              data-testid={`nav-${item.href.replace('/', '') || 'home'}`}
            >
              {item.label}
            </NavHeaderLink>
            <NavLinkIndicator
              active={pathname === item.href}
              data-testid="nav-link-indicator"
            />
          </NavLinkWrapper>
        ))}
      </Nav>

      <Actions>
        <InstallPWAButton />
        <DesktopOnly>
          <LinkButton
            href={routes.support}
            variant="secondary"
            size="sm"
            gap="$2"
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
            onPress={toggleMobileMenu}
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

      <MobileMenu isOpen={isMobileMenuOpen} navItems={navItems} />
    </>
  );
}

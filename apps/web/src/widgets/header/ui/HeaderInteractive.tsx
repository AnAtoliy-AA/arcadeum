'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useRoutes } from '@/shared/config/useRoutes';
import { Button } from '@arcadeum/ui/components/Button/Button';
import { LinkButton } from '@arcadeum/ui/components/Button/LinkButton';
import { MenuIcon, CloseIcon } from '@arcadeum/ui/components/Icons/index';
import { MobileLoginIndicator } from '@arcadeum/ui/components/MobileLoginIndicator/MobileLoginIndicator';
import ProfileMenu from '@/widgets/header/ui/ProfileMenu';
import MobileMenu from '@/widgets/header/ui/MobileMenu';
import LanguageSwitcher from '@/widgets/header/ui/LanguageSwitcher';

import {
  DesktopOnly,
  HeaderMobileHidden,
  MobileMenuContainer,
  NavLinkWrapper,
  NavHeaderLink,
} from './styles';
import { useHeaderAuth } from './useHeaderAuth';
import { useMobileMenu } from './useMobileMenu';
import { useIsMounted } from '@/shared/hooks/useIsMounted';

export function HeaderInteractive() {
  const isMounted = useIsMounted();
  const pathname = usePathname();
  const {
    isAuthenticated: authStatus,
    displayName,
    hydrated,
  } = useHeaderAuth();
  const isAuthenticated = hydrated ? authStatus : false;
  const { t } = useTranslation();
  const routes = useRoutes();
  const { isOpen: isMobileMenuOpen, toggle: toggleMobileMenu } =
    useMobileMenu();

  const navItems = useMemo(
    () => [
      { href: routes.games, label: t('navigation.gamesTab') },
      { href: routes.leaderboards, label: t('navigation.leaderboardsTab') },
      { href: routes.shop, label: t('navigation.shopTab') },
    ],
    [t, routes],
  );

  const mobileNavItems = useMemo(
    () => [
      ...navItems,
      { href: routes.chats, label: t('navigation.chatsTab') },
      { href: routes.history, label: t('navigation.historyTab') },
      { href: routes.stats, label: t('navigation.statsTab') },
    ],
    [navItems, t, routes],
  );

  return (
    <>
      <nav className="nav-styled" aria-label="Main navigation">
        {isMounted &&
          navItems.map((item) => (
            <NavLinkWrapper key={item.href}>
              <NavHeaderLink
                href={item.href}
                variant="ghost"
                size="sm"
                isActive={pathname === item.href}
                data-testid={`nav-${item.href.split('/').filter(Boolean).pop() ?? 'home'}`}
                data-active={pathname === item.href ? 'true' : undefined}
              >
                {item.label}
              </NavHeaderLink>
            </NavLinkWrapper>
          ))}
      </nav>

      <div className="actions-styled">
        {isMounted && (
          <>
            <HeaderMobileHidden>
              <LanguageSwitcher
                data-testid="header-language-switcher"
                className="header-language-switcher"
              />
            </HeaderMobileHidden>

            {isAuthenticated && displayName && (
              <HeaderMobileHidden>
                <ProfileMenu />
              </HeaderMobileHidden>
            )}

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

            <HeaderMobileHidden>
              <MobileLoginIndicator
                href={isAuthenticated ? routes.settings : routes.auth}
                isAuthenticated={isAuthenticated}
                title={
                  isAuthenticated ? displayName || 'Logged in' : 'Not logged in'
                }
                data-testid="mobile-login-indicator"
              />
            </HeaderMobileHidden>

            <MobileMenuContainer className="mobile-menu-container">
              <Button
                variant="icon"
                size="md"
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
          </>
        )}
      </div>

      {isMobileMenuOpen && <MobileMenu navItems={mobileNavItems} />}
    </>
  );
}

'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useRoutes } from '@/shared/config/useRoutes';
import { Button } from '@arcadeum/ui/components/Button/Button';
import { LinkButton } from '@arcadeum/ui/components/Button/LinkButton';
import {
  SupportIcon,
  MenuIcon,
  CloseIcon,
} from '@arcadeum/ui/components/Icons/index';
import { MobileLoginIndicator } from '@arcadeum/ui/components/MobileLoginIndicator/MobileLoginIndicator';
import ProfileMenu from '@/widgets/header/ui/ProfileMenu';
import MobileMenu from '@/widgets/header/ui/MobileMenu';
import LanguageSwitcher from '@/widgets/header/ui/LanguageSwitcher';
import { InstallPWAButton } from '@/features/pwa/InstallPWA';

import {
  DesktopOnly,
  HeaderMobileHidden,
  MobileMenuContainer,
  NavLinkWrapper,
  NavHeaderLink,
  NavLinkIndicator,
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
      { href: routes.shop, label: t('navigation.shopTab') },
      { href: routes.chats, label: t('navigation.chatsTab') },
      { href: routes.history, label: t('navigation.historyTab') },
      { href: routes.stats, label: t('navigation.statsTab') },
      { href: routes.settings, label: t('navigation.settingsTab') },
    ],
    [t, routes],
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
      </nav>

      <div className="actions-styled">
        {isMounted && (
          <>
            <HeaderMobileHidden>
              <InstallPWAButton />
            </HeaderMobileHidden>

            <DesktopOnly>
              <LinkButton
                href={routes.support}
                variant="secondary"
                size="sm"
                gap="$3"
                aria-label={t('common.actions.support')}
              >
                <SupportIcon size={18} />
                {t('common.actions.support')}
              </LinkButton>
            </DesktopOnly>

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

      {isMobileMenuOpen && <MobileMenu navItems={navItems} />}
    </>
  );
}

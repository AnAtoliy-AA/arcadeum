'use client';

import React, { useCallback, useMemo } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
import { appConfig } from '@/shared/config/app-config';
import { routes } from '@/shared/config/routes';
import { InstallPWAButton } from '@/features/pwa';

export function Header() {
  const pathname = usePathname();
  const { snapshot, clearTokens } = useSessionTokens();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);

  const isAuthenticated = !!snapshot.accessToken;
  const displayName =
    snapshot.displayName || snapshot.username || snapshot.email;
  const role = snapshot.role || 'free';

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

  const closeProfileMenu = useCallback(() => {
    setIsProfileMenuOpen(false);
  }, []);

  const toggleProfileMenu = useCallback(() => {
    setIsProfileMenuOpen((prev) => !prev);
  }, []);

  const handleLogout = useCallback(async () => {
    await clearTokens();
    closeProfileMenu();
    window.location.href = '/';
  }, [clearTokens, closeProfileMenu]);

  // Close profile dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isProfileMenuOpen && !target.closest('[data-profile-menu]')) {
        closeProfileMenu();
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isProfileMenuOpen, closeProfileMenu]);

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
            <Image
              src="/logo.png"
              alt={appConfig.appName}
              width={32}
              height={32}
              priority
            />
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
            {isAuthenticated && displayName && (
              <ProfileMenuContainer data-profile-menu>
                <UserInfo onClick={toggleProfileMenu}>
                  <UserName data-testid="header-username">
                    {displayName}
                  </UserName>
                  {role !== 'free' && (
                    <RoleBadge $role={role}>
                      {t(`common.roles.${role}`)}
                    </RoleBadge>
                  )}
                  <ChevronIcon
                    $isOpen={isProfileMenuOpen}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </ChevronIcon>
                </UserInfo>

                <ProfileDropdown $isOpen={isProfileMenuOpen}>
                  <DropdownLink href="/settings" onClick={closeProfileMenu}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3" />
                    </svg>
                    {t('navigation.settingsTab')}
                  </DropdownLink>

                  <DropdownLink href={routes.stats} onClick={closeProfileMenu}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                    {t('navigation.statsTab')}
                  </DropdownLink>

                  <DropdownDivider />

                  <DropdownLink href={routes.terms} onClick={closeProfileMenu}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    {t('legal.nav.terms')}
                  </DropdownLink>

                  <DropdownLink
                    href={routes.privacy}
                    onClick={closeProfileMenu}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    {t('legal.nav.privacy')}
                  </DropdownLink>

                  <DropdownLink
                    href={routes.contact}
                    onClick={closeProfileMenu}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    {t('legal.nav.contact')}
                  </DropdownLink>

                  <DropdownDivider />

                  <DropdownItem onClick={handleLogout}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    {t('common.actions.logout')}
                  </DropdownItem>
                </ProfileDropdown>
              </ProfileMenuContainer>
            )}

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

      <MobileNav
        $isOpen={isMobileMenuOpen}
        data-mobile-menu
        data-testid="mobile-nav"
      >
        {navItems.map((item) => (
          <MobileNavLink
            key={item.href}
            href={item.href}
            $active={pathname === item.href}
            onClick={closeMobileMenu}
          >
            {item.label}
          </MobileNavLink>
        ))}

        {isAuthenticated && displayName && (
          <>
            <MobileUserInfo>
              <UserName>{displayName}</UserName>
              {role !== 'free' && (
                <RoleBadge $role={role} style={{ marginLeft: '0.5rem' }}>
                  {t(`common.roles.${role}`)}
                </RoleBadge>
              )}
            </MobileUserInfo>
            <DropdownItem
              onClick={() => {
                handleLogout();
                closeMobileMenu();
              }}
              style={{ marginTop: '0.5rem' }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {t('common.actions.logout')}
            </DropdownItem>
          </>
        )}

        {!isAuthenticated && (
          <AuthButton
            href="/auth"
            onClick={closeMobileMenu}
            style={{ marginTop: '0.5rem', textAlign: 'center' }}
          >
            {t('common.actions.login')}
          </AuthButton>
        )}

        <DropdownDivider style={{ marginTop: '1rem' }} />

        <MobileNavLink
          href={routes.terms}
          $active={pathname === routes.terms}
          onClick={closeMobileMenu}
        >
          {t('legal.nav.terms')}
        </MobileNavLink>
        <MobileNavLink
          href={routes.privacy}
          $active={pathname === routes.privacy}
          onClick={closeMobileMenu}
        >
          {t('legal.nav.privacy')}
        </MobileNavLink>
        <MobileNavLink
          href={routes.contact}
          $active={pathname === routes.contact}
          onClick={closeMobileMenu}
        >
          {t('legal.nav.contact')}
        </MobileNavLink>
      </MobileNav>
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
  ProfileMenuContainer,
  UserInfo,
  UserName,
  ChevronIcon,
  ProfileDropdown,
  DropdownItem,
  DropdownLink,
  DropdownDivider,
  AuthButton,
  MobileMenuButton,
  MobileNav,
  MobileNavLink,
  MobileUserInfo,
  RoleBadge,
  MobileLoginIndicator,
} from './styles';

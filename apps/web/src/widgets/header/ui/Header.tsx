"use client";

import React, { useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSessionTokens } from "@/entities/session/model/useSessionTokens";
import { useTranslation } from "@/shared/lib/useTranslation";
import { appConfig } from "@/shared/config/app-config";

export function Header() {
  const pathname = usePathname();
  const { snapshot, clearTokens } = useSessionTokens();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);

  const isAuthenticated = !!snapshot.accessToken;
  const displayName = snapshot.displayName || snapshot.username || snapshot.email;

  const navItems = useMemo(
    () => [
      { href: "/games", label: t("navigation.gamesTab") },
      { href: "/chats", label: t("navigation.chatsTab") },
      { href: "/history", label: t("navigation.historyTab") },
      { href: "/settings", label: t("navigation.settingsTab") },
    ],
    [t]
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
    window.location.href = "/";
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
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isProfileMenuOpen, closeProfileMenu]);

  // Close mobile menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        isMobileMenuOpen &&
        !target.closest("[data-mobile-menu]") &&
        !target.closest("[data-mobile-menu-button]")
      ) {
        closeMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isMobileMenuOpen, closeMobileMenu]);

  return (
    <>
      <HeaderContainer>
        <HeaderInner>
          <Logo href="/" onClick={closeMobileMenu}>
            {appConfig.appName}
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
            {isAuthenticated && displayName && (
              <ProfileMenuContainer data-profile-menu>
                <UserInfo onClick={toggleProfileMenu}>
                  <UserName>{displayName}</UserName>
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
                    {t("navigation.settingsTab")}
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
                    {t("common.actions.logout")}
                  </DropdownItem>
                </ProfileDropdown>
              </ProfileMenuContainer>
            )}

            {!isAuthenticated && (
              <AuthButton href="/auth">
                {t("common.actions.login")}
              </AuthButton>
            )}

            <MobileMenuButton
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              data-mobile-menu-button
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

      <MobileNav $isOpen={isMobileMenuOpen} data-mobile-menu>
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
              {t("common.actions.logout")}
            </DropdownItem>
          </>
        )}

        {!isAuthenticated && (
          <AuthButton
            href="/auth"
            onClick={closeMobileMenu}
            style={{ marginTop: '0.5rem', textAlign: 'center' }}
          >
            {t("common.actions.login")}
          </AuthButton>
        )}
      </MobileNav>
    </>
  );
}

import {
  HeaderContainer,
  HeaderInner,
  Logo,
  Nav,
  NavLink,
  Actions,
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
} from "./styles";

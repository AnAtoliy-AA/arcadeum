"use client";

import React, { useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import styled from "styled-components";
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

// Styles

const HeaderContainer = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${({ theme }) => theme.background.base};
  border-bottom: 1px solid ${({ theme }) => theme.surfaces.card.border};
  backdrop-filter: blur(8px);
  background: ${({ theme }) => `${theme.background.base}f2`};
`;

const HeaderInner = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  gap: 2rem;
`;

const Logo = styled(Link)`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 500;
  color: ${({ theme, $active }) =>
    $active ? theme.text.primary : theme.text.muted};
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    color: ${({ theme }) => theme.text.primary};
    background: ${({ theme }) => theme.surfaces.card.background};
  }

  ${({ $active, theme }) => $active && `
    background: ${theme.surfaces.card.background};
    border-bottom: 2px solid ${theme.buttons.primary.gradientStart};
  `}
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ProfileMenuContainer = styled.div`
  position: relative;

  @media (max-width: 640px) {
    display: none;
  }
`;

const UserInfo = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
    opacity: 0.9;
  }

  @media (max-width: 640px) {
    display: none;
  }
`;

const UserName = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text.primary};
`;

const ChevronIcon = styled.svg<{ $isOpen: boolean }>`
  width: 16px;
  height: 16px;
  color: ${({ theme }) => theme.text.muted};
  transition: transform 0.2s ease;
  transform: ${({ $isOpen }) => $isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const ProfileDropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 200px;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  opacity: ${({ $isOpen }) => $isOpen ? '1' : '0'};
  visibility: ${({ $isOpen }) => $isOpen ? 'visible' : 'hidden'};
  transform: ${({ $isOpen }) => $isOpen ? 'translateY(0)' : 'translateY(-8px)'};
  transition: all 0.2s ease;
  z-index: 1000;
  overflow: hidden;
`;

const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.text.primary};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
  text-align: left;

  &:hover {
    background: ${({ theme }) => theme.background.base};
  }

  svg {
    width: 18px;
    height: 18px;
    color: ${({ theme }) => theme.text.muted};
  }
`;

const DropdownLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: ${({ theme }) => theme.text.primary};
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.background.base};
  }

  svg {
    width: 18px;
    height: 18px;
    color: ${({ theme }) => theme.text.muted};
  }
`;

const DropdownDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.surfaces.card.border};
  margin: 0.25rem 0;
`;

const AuthButton = styled(Link)`
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${({ theme }) => theme.buttons.primary.text};
  background: ${({ theme }) => theme.buttons.primary.gradientStart};
  text-decoration: none;
  transition: transform 0.2s ease;
  border: none;
  cursor: pointer;

  &:hover {
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.text.primary};
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.surfaces.card.background};
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileNav = styled.div<{ $isOpen: boolean }>`
  display: none;
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.background.base};
  border-bottom: 1px solid ${({ theme }) => theme.surfaces.card.border};
  padding: 1rem 1.5rem;
  flex-direction: column;
  gap: 0.5rem;
  transform: ${({ $isOpen }) => $isOpen ? 'translateY(0)' : 'translateY(-100%)'};
  opacity: ${({ $isOpen }) => $isOpen ? '1' : '0'};
  visibility: ${({ $isOpen }) => $isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileNavLink = styled(Link)<{ $active: boolean }>`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme, $active }) =>
    $active ? theme.text.primary : theme.text.muted};
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.text.primary};
    background: ${({ theme }) => theme.surfaces.card.background};
  }

  ${({ $active, theme }) => $active && `
    background: ${theme.surfaces.card.background};
    border-left: 3px solid ${theme.buttons.primary.gradientStart};
  `}
`;

const MobileUserInfo = styled.div`
  padding: 0.75rem 1rem;
  border-top: 1px solid ${({ theme }) => theme.surfaces.card.border};
  margin-top: 0.5rem;
`;

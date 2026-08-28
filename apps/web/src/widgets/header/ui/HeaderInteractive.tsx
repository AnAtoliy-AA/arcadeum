'use client';

import { useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useRoutes } from '@/shared/config/useRoutes';
import { useMusicSetting } from '@/shared/hooks/useMusicSetting';
import { Button } from '@arcadeum/ui/components/Button/Button';
import { LinkButton } from '@arcadeum/ui/components/Button/LinkButton';
import {
  MenuIcon,
  CloseIcon,
  SupportIcon,
  GiftIcon,
} from '@arcadeum/ui/components/Icons/index';

const MusicIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const GearIcon = ({ size = 20 }: { size?: number }) => (
  <span className="gear-icon-wrapper">
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  </span>
);
import { MobileLoginIndicator } from '@arcadeum/ui/components/MobileLoginIndicator/MobileLoginIndicator';
import ProfileMenu from '@/widgets/header/ui/ProfileMenu';
import dynamic from 'next/dynamic';
import MobileMenu from '@/widgets/header/ui/MobileMenu';

const NotificationBell = dynamic(
  () =>
    import('@/features/notifications/NotificationBell').then(
      (m) => m.NotificationBell,
    ),
  { ssr: false },
);
import LanguageSwitcher from '@/widgets/header/ui/LanguageSwitcher';
import { LivePulseBadge, LiveActivityPopover } from '@/features/live-stats';

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

  const { musicEnabled, setMusicEnabled } = useMusicSetting();

  const toggleMusic = useCallback(() => {
    setMusicEnabled(!musicEnabled);
  }, [musicEnabled, setMusicEnabled]);

  const navItems = useMemo(
    () => [
      { href: routes.games, label: t('navigation.gamesTab') },
      { href: routes.rooms, label: t('navigation.roomsTab') },
      { href: routes.leaderboards, label: t('navigation.leaderboardsTab') },
      {
        href: '#',
        label: t('navigation.musicTab'),
        onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          toggleMusic();
        },
        icon: <MusicIcon size={16} />,
      },
      {
        href: routes.shop,
        label: t('navigation.shopTab'),
        icon: <GiftIcon size={16} />,
        accent: true,
      },
    ],
    [t, routes, toggleMusic],
  );

  const mobileNavItems = useMemo(
    () => [
      ...navItems.map((item) => ({
        ...item,
        href: item.onClick ? '#' : item.href,
        onClick: item.onClick
          ? (e: React.MouseEvent) => {
              e.preventDefault();
              item.onClick!(e);
            }
          : undefined,
      })),
      { href: routes.chats, label: t('navigation.chatsTab') },
      { href: routes.history, label: t('navigation.historyTab') },
      { href: routes.stats, label: t('navigation.statsTab') },
      { href: routes.settings, label: t('navigation.settingsTab') },
    ],
    [navItems, t, routes],
  );

  return (
    <>
      <nav className="nav-styled" aria-label="Main navigation">
        {isMounted &&
          navItems.map((item) => (
            <NavLinkWrapper key={item.label}>
              {item.onClick ? (
                <NavHeaderLink
                  href={item.href}
                  variant="ghost"
                  size="sm"
                  isActive={false}
                  accent={item.accent}
                  icon={item.icon}
                  onClick={item.onClick}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  {item.label}
                </NavHeaderLink>
              ) : (
                <NavHeaderLink
                  href={item.href}
                  variant="ghost"
                  size="sm"
                  isActive={pathname === item.href}
                  accent={item.accent}
                  icon={item.icon}
                  data-testid={`nav-${item.href.split('/').filter(Boolean).pop() ?? 'home'}`}
                  data-active={pathname === item.href ? 'true' : undefined}
                >
                  {item.label}
                </NavHeaderLink>
              )}
            </NavLinkWrapper>
          ))}
      </nav>

      <div className="actions-styled">
        {isMounted && (
          <>
            <div className="relative inline-flex items-center">
              <LivePulseBadge />
              <LiveActivityPopover />
            </div>

            <HeaderMobileHidden>
              <Link
                href={routes.support}
                aria-label={t('common.actions.support')}
                style={{ textDecoration: 'none', display: 'inline-flex' }}
                data-testid="header-support-button"
              >
                <Button
                  variant="icon"
                  size="md"
                  aria-label={t('common.actions.support')}
                  tabIndex={-1}
                  className="hover:-translate-y-[2px] hover:scale-[1.1] hover:bg-[rgba(255,255,255,0.15)] hover:border-[rgba(255,255,255,0.25)]"
                >
                  <SupportIcon size={20} />
                </Button>
              </Link>
            </HeaderMobileHidden>

            <HeaderMobileHidden>
              <LanguageSwitcher
                data-testid="header-language-switcher"
                className="header-language-switcher"
              />
            </HeaderMobileHidden>

            {isAuthenticated && (
              <HeaderMobileHidden>
                <NotificationBell />
              </HeaderMobileHidden>
            )}

            {isAuthenticated && displayName && (
              <HeaderMobileHidden>
                <ProfileMenu />
              </HeaderMobileHidden>
            )}

            {!isAuthenticated && (
              <DesktopOnly>
                <Link
                  href={routes.settings}
                  aria-label={t('navigation.settingsTab')}
                  style={{ textDecoration: 'none', display: 'inline-flex' }}
                  data-testid="desktop-settings-button"
                >
                  <Button
                    variant="icon"
                    size="md"
                    aria-label={t('navigation.settingsTab')}
                    tabIndex={-1}
                    className="hover:-translate-y-[2px] hover:scale-[1.1] hover:bg-[rgba(255,255,255,0.15)] hover:border-[rgba(255,255,255,0.25)]"
                  >
                    <GearIcon size={20} />
                  </Button>
                </Link>
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

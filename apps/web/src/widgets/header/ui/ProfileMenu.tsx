'use client';

import React, { useCallback } from 'react';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useCosmeticBadges } from '@/features/referrals/hooks/useCosmeticBadges';
import { CosmeticBadge } from '@/shared/ui';
import { routes } from '@/shared/config/routes';
import {
  ProfileMenuContainer,
  UserInfo,
  UserName,
  ChevronIcon,
  ProfileDropdown,
  DropdownItem,
  DropdownLink,
  DropdownDivider,
  RoleBadge,
} from './styles';

export function ProfileMenu() {
  const { snapshot, clearTokens } = useSessionTokens();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const displayName =
    snapshot.displayName || snapshot.username || snapshot.email;
  const role = snapshot.role || 'free';
  const { data: cosmeticBadges } = useCosmeticBadges();

  const closeMenu = useCallback(() => setIsOpen(false), []);
  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);

  const handleLogout = useCallback(async () => {
    await clearTokens();
    closeMenu();
    window.location.href = '/';
  }, [clearTokens, closeMenu]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('[data-profile-menu]')) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen, closeMenu]);

  if (!displayName) return null;

  return (
    <ProfileMenuContainer data-profile-menu>
      <UserInfo onClick={toggleMenu}>
        <UserName data-testid="header-username">{displayName}</UserName>
        {role !== 'free' && (
          <RoleBadge $role={role}>{t(`common.roles.${role}`)}</RoleBadge>
        )}
        {cosmeticBadges?.map((badgeId) => (
          <CosmeticBadge key={badgeId} badgeId={badgeId} />
        ))}
        <ChevronIcon $isOpen={isOpen} viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </ChevronIcon>
      </UserInfo>

      <ProfileDropdown $isOpen={isOpen}>
        <DropdownLink href="/settings" onClick={closeMenu}>
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

        <DropdownLink href={routes.stats} onClick={closeMenu}>
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

        <DropdownLink href={routes.referrals} onClick={closeMenu}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 12v10H4V12" />
            <path d="M2 7h20v5H2z" />
            <path d="M12 22V7" />
            <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
            <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
          </svg>
          {t('referrals.nav.inviteFriends')}
        </DropdownLink>

        <DropdownDivider />

        <DropdownLink href={routes.terms} onClick={closeMenu}>
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

        <DropdownLink href={routes.privacy} onClick={closeMenu}>
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

        <DropdownLink href={routes.contact} onClick={closeMenu}>
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
  );
}

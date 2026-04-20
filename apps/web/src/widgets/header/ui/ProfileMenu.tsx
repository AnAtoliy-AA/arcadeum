'use client';

import React, { useCallback, useEffect } from 'react';
import {
  Avatar,
  Button,
  Divider,
  SettingsIcon,
  BarChartIcon,
  GiftIcon,
  FileTextIcon,
  LockIcon,
  MailIcon,
  LogoutIcon,
  RoleBadge,
  ChevronIcon,
} from '@arcadeum/ui';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useCosmeticBadges } from '@/features/referrals/hooks/useCosmeticBadges';
import { CosmeticBadge } from '@/shared/ui';
import { routes } from '@/shared/config/routes';
import {
  ProfileMenuContainer,
  UserNameEllipsis,
  ProfileDropdownWrapper,
  DropdownLink,
} from './styles';

export default function ProfileMenu() {
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
    window.location.replace('/');
  }, [clearTokens]);

  useEffect(() => {
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
      <Button
        variant="chip"
        size="sm"
        gap="$2"
        onClick={toggleMenu}
        display={['none', 'none', 'flex']}
      >
        <Avatar name={displayName} size="sm" />
        <UserNameEllipsis data-testid="header-username">
          {displayName}
        </UserNameEllipsis>
        {role !== 'free' && (
          <RoleBadge role={role}>{t(`common.roles.${role}`)}</RoleBadge>
        )}
        {cosmeticBadges?.map((badgeId) => (
          <CosmeticBadge key={badgeId} badgeId={badgeId} />
        ))}
        <ChevronIcon isOpen={isOpen} />
      </Button>

      <ProfileDropdownWrapper isOpen={isOpen}>
        <DropdownLink href="/settings" onClick={closeMenu}>
          <SettingsIcon size={16} />
          {t('navigation.settingsTab')}
        </DropdownLink>

        <DropdownLink href={routes.stats} onClick={closeMenu}>
          <BarChartIcon size={16} />
          {t('navigation.statsTab')}
        </DropdownLink>

        <DropdownLink href={routes.referrals} onClick={closeMenu}>
          <GiftIcon size={16} />
          {t('referrals.nav.inviteFriends')}
        </DropdownLink>

        <Divider spacing="sm" />

        <DropdownLink href={routes.terms} onClick={closeMenu}>
          <FileTextIcon size={16} />
          {t('legal.nav.terms')}
        </DropdownLink>

        <DropdownLink href={routes.privacy} onClick={closeMenu}>
          <LockIcon size={16} />
          {t('legal.nav.privacy')}
        </DropdownLink>

        <DropdownLink href={routes.contact} onClick={closeMenu}>
          <MailIcon size={16} />
          {t('legal.nav.contact')}
        </DropdownLink>

        <Divider spacing="sm" />

        <Button
          variant="listItem"
          onClick={handleLogout}
          data-testid="desktop-logout-button"
          icon={<LogoutIcon size={16} />}
        >
          {t('common.actions.logout')}
        </Button>
      </ProfileDropdownWrapper>
    </ProfileMenuContainer>
  );
}

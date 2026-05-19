'use client';

import React, { useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Avatar } from '@arcadeum/ui/components/Avatar/Avatar';
import { Button } from '@arcadeum/ui/components/Button/Button';
import { Divider } from '@arcadeum/ui/components/Divider/Divider';
import { View } from 'tamagui';
import { RoleBadge } from '@arcadeum/ui/components/RoleBadge/RoleBadge';
import {
  SettingsIcon,
  BarChartIcon,
  GiftIcon,
  FileTextIcon,
  LockIcon,
  MailIcon,
  LogoutIcon,
  ChevronIcon,
  UserIcon,
  WalletIcon,
} from '@arcadeum/ui/components/Icons/index';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useCosmeticBadges } from '@/features/referrals/hooks/useCosmeticBadges';
import { useEquippedCosmetics } from '@/features/shop/hooks/useEquippedCosmetics';
import { nameColorRenderProps } from '@/features/shop/lib/nameColor';
import { CosmeticBadge } from '@arcadeum/ui/components/CosmeticBadge/CosmeticBadge';
import { useRoutes } from '@/shared/config/useRoutes';
import {
  ProfileMenuContainer,
  UserNameEllipsis,
  ProfileDropdownWrapper,
  DropdownLink,
  DropdownButton,
} from '@arcadeum/ui';

export default function ProfileMenu() {
  const { snapshot, clearTokens } = useSessionTokens();
  const { t } = useTranslation();
  const routes = useRoutes();
  const [isOpen, setIsOpen] = React.useState(false);

  const displayName =
    snapshot.displayName || snapshot.username || snapshot.email;
  const role = snapshot.role || 'free';
  const { data: cosmeticBadges } = useCosmeticBadges();
  const {
    avatarUrl: equippedAvatarUrl,
    badgeUrl: equippedBadgeUrl,
    nameColor: equippedNameColor,
  } = useEquippedCosmetics({
    equippedAvatarId: snapshot.equippedAvatarId,
    equippedBadgeId: snapshot.equippedBadgeId,
    equippedNameColorId: snapshot.equippedNameColorId,
  });
  const nameColorProps = nameColorRenderProps(equippedNameColor);

  const closeMenu = useCallback(() => setIsOpen(false), []);
  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);

  const handleLogout = useCallback(async () => {
    await clearTokens();
    window.location.replace(routes.home);
  }, [clearTokens, routes.home]);

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
    <ProfileMenuContainer data-profile-menu data-testid="profile-menu">
      <Button
        variant="chip"
        size="sm"
        gap="$3"
        onClick={toggleMenu}
        hoverStyle={{
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          scale: 1.01,
        }}
        pressStyle={{ scale: 0.98 }}
        style={{ transition: 'all 0.2s ease' }}
      >
        <Avatar
          name={displayName}
          src={equippedAvatarUrl ?? undefined}
          size="sm"
          borderWidth={
            role === 'admin' || role === 'vip' || role === 'premium'
              ? 1
              : undefined
          }
          borderColor={
            role === 'admin'
              ? 'var(--danger)'
              : role === 'vip' || role === 'premium'
                ? 'var(--roleVip)'
                : undefined
          }
          boxShadow={
            role === 'admin'
              ? '0 0 8px color-mix(in srgb, var(--danger) 50%, transparent)'
              : role === 'vip' || role === 'premium'
                ? '0 0 8px color-mix(in srgb, var(--roleVip) 50%, transparent)'
                : undefined
          }
        />
        <UserNameEllipsis
          data-testid="header-username"
          {...(nameColorProps.color ? { color: nameColorProps.color } : {})}
          {...(nameColorProps.style ? { style: nameColorProps.style } : {})}
        >
          {displayName}
        </UserNameEllipsis>
        {equippedBadgeUrl ? (
          <View width={20} height={20}>
            <Image
              src={equippedBadgeUrl}
              alt=""
              width={20}
              height={20}
              data-testid="header-equipped-badge"
              unoptimized
            />
          </View>
        ) : null}
        {role !== 'free' && (
          <RoleBadge role={role}>{t(`common.roles.${role}`)}</RoleBadge>
        )}
        {cosmeticBadges?.map((badgeId) => (
          <CosmeticBadge key={badgeId} badgeId={badgeId} />
        ))}
        <ChevronIcon isOpen={isOpen} />
      </Button>

      <ProfileDropdownWrapper isOpen={isOpen}>
        {role === 'admin' && (
          <>
            <DropdownLink
              href={routes.admin}
              onClick={closeMenu}
              data-testid="header-admin-link"
              icon={<UserIcon size={18} />}
            >
              {t('navigation.adminTab')}
            </DropdownLink>
            <Divider spacing="sm" />
          </>
        )}

        <DropdownLink
          href={routes.wallet}
          onClick={closeMenu}
          data-testid="header-wallet-link"
          icon={<WalletIcon size={18} />}
        >
          {t('navigation.walletTab')}
        </DropdownLink>

        <DropdownLink
          href={routes.settings}
          onClick={closeMenu}
          icon={<SettingsIcon size={18} />}
        >
          {t('navigation.settingsTab')}
        </DropdownLink>

        <DropdownLink
          href={routes.stats}
          onClick={closeMenu}
          icon={<BarChartIcon size={18} />}
        >
          {t('navigation.statsTab')}
        </DropdownLink>

        <DropdownLink
          href={routes.referrals}
          onClick={closeMenu}
          icon={<GiftIcon size={18} />}
        >
          {t('referrals.nav.inviteFriends')}
        </DropdownLink>

        <Divider spacing="sm" />

        <DropdownLink
          href={routes.terms}
          onClick={closeMenu}
          icon={<FileTextIcon size={18} />}
        >
          {t('legal.nav.terms')}
        </DropdownLink>

        <DropdownLink
          href={routes.privacy}
          onClick={closeMenu}
          icon={<LockIcon size={18} />}
        >
          {t('legal.nav.privacy')}
        </DropdownLink>

        <DropdownLink
          href={routes.contact}
          onClick={closeMenu}
          icon={<MailIcon size={18} />}
        >
          {t('legal.nav.contact')}
        </DropdownLink>

        <Divider spacing="sm" />
        <DropdownButton
          data-testid="desktop-logout-button"
          onClick={handleLogout}
          icon={<LogoutIcon size={18} />}
        >
          {t('common.actions.logout')}
        </DropdownButton>
      </ProfileDropdownWrapper>
    </ProfileMenuContainer>
  );
}

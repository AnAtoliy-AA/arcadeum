'use client';

import React, { useCallback, useEffect } from 'react';
import { XStack, YStack } from 'tamagui';
import { Button } from '@arcadeum/ui/components/Button/Button';
import { Divider } from '@arcadeum/ui/components/Divider/Divider';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar';
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
  SmartphoneIcon,
} from '@arcadeum/ui/components/Icons/index';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useCosmeticBadges } from '@/features/referrals/hooks/useCosmeticBadges';
import { useEquippedCosmetics } from '@/features/shop/hooks/useEquippedCosmetics';
import { nameColorRenderProps } from '@/features/shop/lib/nameColor';
import { CosmeticBadge } from '@arcadeum/ui/components/CosmeticBadge/CosmeticBadge';
import { useRoutes } from '@/shared/config/useRoutes';
import { usePWAOptional } from '@/features/pwa/context';
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
  const pwa = usePWAOptional();
  const [isOpen, setIsOpen] = React.useState(false);

  const displayName =
    snapshot.displayName || snapshot.username || snapshot.email;
  // Chip shows just the first token of the display name so it never truncates
  // awkwardly. The full name lives in the dropdown identity card on click.
  const chipName = displayName?.trim().split(/\s+/)[0] ?? displayName;
  const role = snapshot.role || 'free';
  const { data: cosmeticBadges } = useCosmeticBadges();
  const { nameColor: equippedNameColor } = useEquippedCosmetics({
    equippedAvatarId: snapshot.equippedAvatarId,
    equippedBadgeId: snapshot.equippedBadgeId,
    equippedNameColorId: snapshot.equippedNameColorId,
    equippedFrameId: snapshot.equippedFrameId,
    equippedAuraId: snapshot.equippedAuraId,
    equippedBannerId: snapshot.equippedBannerId,
  });
  const nameColorProps = nameColorRenderProps(equippedNameColor);

  const closeMenu = useCallback(() => setIsOpen(false), []);
  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);

  const handleLogout = useCallback(async () => {
    await clearTokens();
    window.location.replace(routes.home);
  }, [clearTokens, routes.home]);

  const handleInstallApp = useCallback(() => {
    pwa?.openModal();
    closeMenu();
  }, [pwa, closeMenu]);

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

  const showInstallApp = !!pwa?.canInstall;
  const showBadgesRow = !!cosmeticBadges?.length;

  return (
    <ProfileMenuContainer data-profile-menu data-testid="profile-menu">
      <Button
        variant="chip"
        size="md"
        gap="$3"
        // `chip` variant hard-codes height: 28 — override per-instance so the
        // header chip can host the md (48px) avatar with breathing room.
        // 56px sits comfortably below the 72px header.
        height={56}
        paddingVertical={4}
        paddingHorizontal="$3"
        // Equipped avatars render aura/frame overlays that extend slightly
        // outside the 48px avatar box; keep overflow visible so they aren't
        // clipped by the chip's rounded edges.
        overflow="visible"
        onClick={toggleMenu}
        hoverStyle={{
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          scale: 1.01,
        }}
        pressStyle={{ scale: 0.98 }}
        style={{ transition: 'all 0.2s ease' }}
      >
        <EquippedPlayerAvatar
          name={displayName}
          size="md"
          equippedAvatarId={snapshot.equippedAvatarId}
          equippedBadgeId={snapshot.equippedBadgeId}
          equippedNameColorId={snapshot.equippedNameColorId}
          equippedFrameId={snapshot.equippedFrameId}
          equippedAuraId={snapshot.equippedAuraId}
          equippedBannerId={snapshot.equippedBannerId}
          data-testid="header-equipped-avatar"
        />
        <UserNameEllipsis
          data-testid="header-username"
          {...(nameColorProps.color ? { color: nameColorProps.color } : {})}
          {...(nameColorProps.style ? { style: nameColorProps.style } : {})}
        >
          {chipName}
        </UserNameEllipsis>
        {role !== 'free' && (
          <RoleBadge role={role} variant="outlined">
            {t(`common.roles.${role}`)}
          </RoleBadge>
        )}
        <ChevronIcon isOpen={isOpen} />
      </Button>

      <ProfileDropdownWrapper isOpen={isOpen}>
        <XStack
          paddingHorizontal="$5"
          paddingBottom="$3"
          gap="$3"
          alignItems="center"
          data-testid="profile-identity-card"
        >
          <EquippedPlayerAvatar
            name={displayName}
            size="sm"
            equippedAvatarId={snapshot.equippedAvatarId}
            equippedBadgeId={snapshot.equippedBadgeId}
            equippedNameColorId={snapshot.equippedNameColorId}
            equippedFrameId={snapshot.equippedFrameId}
            equippedAuraId={snapshot.equippedAuraId}
            equippedBannerId={snapshot.equippedBannerId}
          />
          <YStack flex={1} minWidth={120} gap="$1">
            <UserNameEllipsis
              {...(nameColorProps.color ? { color: nameColorProps.color } : {})}
              {...(nameColorProps.style ? { style: nameColorProps.style } : {})}
            >
              {displayName}
            </UserNameEllipsis>
            {(role !== 'free' || showBadgesRow) && (
              <XStack gap="$1" flexWrap="wrap" alignItems="center">
                {role !== 'free' && (
                  <RoleBadge role={role}>{t(`common.roles.${role}`)}</RoleBadge>
                )}
                {cosmeticBadges?.map((badgeId) => (
                  <CosmeticBadge key={badgeId} badgeId={badgeId} />
                ))}
              </XStack>
            )}
          </YStack>
        </XStack>
        <Divider spacing="sm" />

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
          data-testid="header-settings-link"
          icon={<SettingsIcon size={18} />}
        >
          {t('navigation.settingsTab')}
        </DropdownLink>

        <DropdownLink
          href={routes.chats}
          onClick={closeMenu}
          data-testid="header-chats-link"
          icon={<MailIcon size={18} />}
        >
          {t('navigation.chatsTab')}
        </DropdownLink>

        <DropdownLink
          href={routes.history}
          onClick={closeMenu}
          data-testid="header-history-link"
          icon={<FileTextIcon size={18} />}
        >
          {t('navigation.historyTab')}
        </DropdownLink>

        <DropdownLink
          href={routes.stats}
          onClick={closeMenu}
          data-testid="header-stats-link"
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

        {showInstallApp && (
          <>
            <DropdownButton
              data-testid="header-install-pwa-button"
              onClick={handleInstallApp}
              icon={<SmartphoneIcon size={18} />}
            >
              {t('pwa.install.button')}
            </DropdownButton>

            <Divider spacing="sm" />
          </>
        )}

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

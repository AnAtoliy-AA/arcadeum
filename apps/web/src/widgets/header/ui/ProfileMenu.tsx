'use client';

import React, { useCallback, useEffect } from 'react';
import Link from 'next/link';
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
  SupportIcon,
  DiscordIcon,
} from '@arcadeum/ui/components/Icons/index';
import { appConfig } from '@/shared/config/app-config';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { logoutSession } from '@/entities/session/api/authApi';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { useCosmeticBadges } from '@/features/referrals/hooks/useCosmeticBadges';
import { useEquippedCosmetics } from '@/features/shop/hooks/useEquippedCosmetics';
import { nameColorRenderProps } from '@/features/shop/lib/nameColor';
import { CosmeticBadge } from '@arcadeum/ui/components/CosmeticBadge/CosmeticBadge';
import { useRoutes } from '@/shared/config/useRoutes';
import { useMusicSetting } from '@/shared/hooks/useMusicSetting';
import { usePWAOptional } from '@/features/pwa/context';
import { usePendingFriendRequestCount } from '@/shared/hooks/usePendingFriendRequestCount';
import LanguagePills from './LanguagePills';
import {
  ProfileMenuContainer,
  UserNameEllipsis,
  ProfileDropdownWrapper,
  DropdownLink,
  DropdownButton,
  TrophyIcon,
} from '@arcadeum/ui';

const MusicIcon = ({ size = 18 }: { size?: number }) => (
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

export default function ProfileMenu() {
  const { snapshot, clearTokens } = useSessionTokens();
  const { t } = useTranslation();
  const routes = useRoutes();
  const pwa = usePWAOptional();
  const { musicEnabled, setMusicEnabled } = useMusicSetting();
  const [isOpen, setIsOpen] = React.useState(false);
  const pendingCount = usePendingFriendRequestCount();

  const toggleMusic = useCallback(() => {
    setMusicEnabled(!musicEnabled);
  }, [musicEnabled, setMusicEnabled]);

  const isAnonymous = !snapshot.accessToken;
  const anonSuffix = snapshot.userId?.startsWith('anon_')
    ? snapshot.userId.slice(5, 9)
    : snapshot.userId
      ? snapshot.userId.slice(0, 4)
      : '';
  const guestName = anonSuffix ? `Guest #${anonSuffix}` : 'Guest';
  const displayName =
    snapshot.displayName || snapshot.username || snapshot.email || guestName;
  const chipName = displayName.trim().split(/\s+/)[0] ?? displayName;
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
    await logoutSession().catch(() => {});
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
        size="sm"
        shape="round"
        className="h-9 pl-1 pr-3 gap-2 border-[var(--glassBorder)] bg-[var(--glassBg)] hover:bg-[var(--glassBgHover)] hover:border-[var(--glassBorderHover)] text-[var(--color)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:border-[var(--glassBorder)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] shadow-sm"
        onClick={toggleMenu}
      >
        <EquippedPlayerAvatar
          name={displayName}
          size="icon"
          equippedAvatarId={snapshot.equippedAvatarId}
          equippedBadgeId={snapshot.equippedBadgeId}
          equippedNameColorId={snapshot.equippedNameColorId}
          equippedFrameId={snapshot.equippedFrameId}
          equippedAuraId={snapshot.equippedAuraId}
          equippedBannerId={snapshot.equippedBannerId}
          equippedGameSkinId={snapshot.equippedGameSkinId}
          fallbackAvatarUrl={
            isAnonymous ? '/shop/avatars/default-01.png' : undefined
          }
          data-testid="header-equipped-avatar"
        />
        <UserNameEllipsis
          data-testid="header-username"
          {...(nameColorProps.color ? { color: nameColorProps.color } : {})}
          {...(nameColorProps.style ? { style: nameColorProps.style } : {})}
        >
          {chipName}
        </UserNameEllipsis>
        <ChevronIcon isOpen={isOpen} />
      </Button>

      <ProfileDropdownWrapper isOpen={isOpen}>
        <Link
          href={
            !isAnonymous &&
            snapshot.userId &&
            typeof routes.profile === 'function'
              ? routes.profile(snapshot.userId)
              : routes.auth || '/auth'
          }
          onClick={closeMenu}
          className="flex items-center gap-3 px-5 pb-3 pt-1 rounded-lg transition-colors hover:bg-[var(--backgroundHover)] cursor-pointer group link-no-decoration"
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
            equippedGameSkinId={snapshot.equippedGameSkinId}
            fallbackAvatarUrl={
              isAnonymous ? '/shop/avatars/default-01.png' : undefined
            }
          />
          <div className="flex min-w-[120px] flex-1 flex-col gap-1">
            <UserNameEllipsis
              {...(nameColorProps.color ? { color: nameColorProps.color } : {})}
              {...(nameColorProps.style ? { style: nameColorProps.style } : {})}
            >
              {displayName}
            </UserNameEllipsis>
            {isAnonymous ? (
              <span className="text-[11px] text-[var(--textSecondary)]">
                {t('common.actions.login')}
              </span>
            ) : (
              (role !== 'free' || showBadgesRow) && (
                <div className="flex flex-wrap items-center gap-1">
                  {role !== 'free' && (
                    <RoleBadge role={role}>
                      {t(`common.roles.${role}`)}
                    </RoleBadge>
                  )}
                  {cosmeticBadges?.map((badgeId) => (
                    <CosmeticBadge key={badgeId} badgeId={badgeId} />
                  ))}
                </div>
              )
            )}
          </div>
        </Link>
        <Divider spacing="sm" />

        {isAnonymous ? (
          <>
            <DropdownLink
              href="/auth"
              onClick={closeMenu}
              data-testid="profile-login-link"
              icon={<UserIcon size={18} />}
            >
              {t('common.actions.login')}
            </DropdownLink>

            <DropdownLink
              href={routes.leaderboards || '/leaderboards'}
              onClick={closeMenu}
              data-testid="profile-leaderboards-link"
              icon={<TrophyIcon size={18} />}
            >
              {t('navigation.leaderboardsTab')}
            </DropdownLink>

            <DropdownLink
              href={routes.settings || '/settings'}
              onClick={closeMenu}
              data-testid="header-settings-link"
              icon={<SettingsIcon size={18} />}
            >
              {t('navigation.settingsTab')}
            </DropdownLink>
          </>
        ) : (
          <>
            {role === 'admin' && (
              <>
                <DropdownLink
                  href={routes.admin || '/admin'}
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
              href={routes.rewards || '/rewards'}
              onClick={closeMenu}
              data-testid="header-rewards-link"
              icon={<GiftIcon size={18} />}
            >
              <span className="flex items-center justify-between w-full">
                <span>{t('navigation.rewardsTab')}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  FREE GEMS
                </span>
              </span>
            </DropdownLink>

            <DropdownLink
              href={routes.wallet || '/wallet'}
              onClick={closeMenu}
              data-testid="header-wallet-link"
              icon={<WalletIcon size={18} />}
            >
              {t('navigation.walletTab')}
            </DropdownLink>

            <DropdownLink
              href={routes.friends || '/friends'}
              onClick={closeMenu}
              data-testid="header-friends-link"
              icon={<UserIcon size={18} />}
            >
              {t('navigation.friendsTab')}
              {pendingCount > 0 && (
                <span className="ml-auto inline-flex items-center justify-center rounded-full bg-[var(--danger)] px-1.5 py-0.5 text-[10px] font-bold text-white min-w-[18px]">
                  {pendingCount}
                </span>
              )}
            </DropdownLink>

            <DropdownLink
              href={routes.battlePass || '/battle-pass'}
              onClick={closeMenu}
              data-testid="header-battle-pass-link"
              icon={<GiftIcon size={18} />}
            >
              {t('battlePass.navLabel')}
            </DropdownLink>

            <DropdownLink
              href={routes.settings || '/settings'}
              onClick={closeMenu}
              data-testid="header-settings-link"
              icon={<SettingsIcon size={18} />}
            >
              {t('navigation.settingsTab')}
            </DropdownLink>

            <DropdownLink
              href={routes.chats || '/chats'}
              onClick={closeMenu}
              data-testid="header-chats-link"
              icon={<MailIcon size={18} />}
            >
              {t('navigation.chatsTab')}
            </DropdownLink>

            <DropdownLink
              href={routes.history || '/history'}
              onClick={closeMenu}
              data-testid="header-history-link"
              icon={<FileTextIcon size={18} />}
            >
              {t('navigation.historyTab')}
            </DropdownLink>

            <DropdownLink
              href={routes.stats || '/stats'}
              onClick={closeMenu}
              data-testid="header-stats-link"
              icon={<BarChartIcon size={18} />}
            >
              {t('navigation.statsTab')}
            </DropdownLink>

            <DropdownLink
              href={routes.leaderboards || '/leaderboards'}
              onClick={closeMenu}
              data-testid="profile-leaderboards-link"
              icon={<TrophyIcon size={18} />}
            >
              {t('navigation.leaderboardsTab')}
            </DropdownLink>

            <DropdownLink
              href={routes.referrals || '/referrals'}
              onClick={closeMenu}
              icon={<GiftIcon size={18} />}
            >
              {t('referrals.nav.inviteFriends')}
            </DropdownLink>
          </>
        )}

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
          href={routes.terms || '/terms'}
          onClick={closeMenu}
          icon={<FileTextIcon size={18} />}
        >
          {t('legal.nav.terms')}
        </DropdownLink>

        <DropdownLink
          href={routes.privacy || '/privacy'}
          onClick={closeMenu}
          icon={<LockIcon size={18} />}
        >
          {t('legal.nav.privacy')}
        </DropdownLink>

        <DropdownLink
          href={routes.support || '/support'}
          onClick={closeMenu}
          data-testid="header-support-link"
          icon={<SupportIcon size={18} />}
        >
          {t('common.actions.support')}
        </DropdownLink>

        <DropdownLink
          href={appConfig.social.discord ?? 'https://discord.gg/arcadeum'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={closeMenu}
          data-testid="profile-discord-link"
          icon={<DiscordIcon size={18} />}
        >
          {t('navigation.discordCommunity')}
        </DropdownLink>

        <DropdownButton
          data-testid="header-music-toggle"
          onClick={toggleMusic}
          icon={<MusicIcon size={18} />}
        >
          <span className="flex items-center justify-between w-full">
            <span>{t('navigation.musicTab')}</span>
            <span className="text-xs text-slate-400 font-semibold uppercase">
              {musicEnabled ? 'ON' : 'OFF'}
            </span>
          </span>
        </DropdownButton>

        <Divider spacing="sm" />

        <div className="px-5 py-2">
          <LanguagePills data-testid="profile-language-picker" />
        </div>

        {!isAnonymous && (
          <>
            <Divider spacing="sm" />
            <DropdownButton
              data-testid="desktop-logout-button"
              onClick={handleLogout}
              icon={<LogoutIcon size={18} />}
            >
              {t('common.actions.logout')}
            </DropdownButton>
          </>
        )}
      </ProfileDropdownWrapper>
    </ProfileMenuContainer>
  );
}

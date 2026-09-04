'use client';

import { useCallback, useMemo, type ComponentType } from 'react';
import { usePathname } from 'next/navigation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { logoutSession } from '@/entities/session/api/authApi';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useCosmeticBadges } from '@/features/referrals/hooks/useCosmeticBadges';
import { CosmeticBadge } from '@arcadeum/ui/components/CosmeticBadge/CosmeticBadge';
import { useRoutes } from '@/shared/config/useRoutes';
import { appConfig } from '@/shared/config/app-config';
import {
  MobileBottomBar,
  MobileNav,
  MobileSection,
  MobileSectionLabel,
  MobileUserCard,
  MobileVersionText,
  NavMobileLink,
} from './styles';
import { UserNameEllipsis } from '@arcadeum/ui';
import { Button } from '@arcadeum/ui/components/Button/Button';
import { LinkButton } from '@arcadeum/ui/components/Button/LinkButton';
import { Divider } from '@arcadeum/ui/components/Divider/Divider';
import { RoleBadge } from '@arcadeum/ui/components/RoleBadge/RoleBadge';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar';
import {
  BarChartIcon,
  CardsIcon,
  GiftIcon,
  FileTextIcon,
  LoginIcon,
  LogoutIcon,
  MailIcon,
  SettingsIcon,
  SmartphoneIcon,
  SupportIcon,
  TrophyIcon,
  UserIcon,
  WalletIcon,
  PlayIcon,
} from '@arcadeum/ui/components/Icons/index';
import { useIsMounted } from '@/shared/hooks/useIsMounted';
import { useHeaderAuth } from './useHeaderAuth';
import LanguagePills from './LanguagePills';
import { usePWAOptional } from '@/features/pwa/context';

interface MobileMenuProps {
  navItems: Array<{
    href: string;
    label: string;
    onClick?: (e: React.MouseEvent) => void;
    icon?: React.ReactNode;
  }>;
  pendingFriendCount?: number;
}

type IconComponent = ComponentType<{ size?: number }>;

const NAV_ICON_BY_SLUG: Record<string, IconComponent> = {
  games: CardsIcon,
  rooms: PlayIcon,
  leaderboards: TrophyIcon,
  friends: UserIcon,
  shop: GiftIcon,
  token: WalletIcon,
  chats: MailIcon,
  history: FileTextIcon,
  stats: BarChartIcon,
  settings: SettingsIcon,
};

function iconForHref(href: string): IconComponent | undefined {
  const last = href.split('/').filter(Boolean).pop();
  return last ? NAV_ICON_BY_SLUG[last] : undefined;
}

export default function MobileMenu({
  navItems,
  pendingFriendCount,
}: MobileMenuProps) {
  const pathname = usePathname();
  // clearTokens and snapshot.role are MobileMenu-specific — not in useHeaderAuth
  const { snapshot, clearTokens } = useSessionTokens();
  const { t } = useTranslation();
  const routes = useRoutes();
  const mounted = useIsMounted();
  const { isAuthenticated, displayName } = useHeaderAuth();
  const role = snapshot.role || 'free';
  const { data: cosmeticBadges } = useCosmeticBadges();
  const pwa = usePWAOptional();

  const handleLogout = useCallback(async () => {
    await logoutSession().catch(() => {});
    await clearTokens();
    window.location.replace(routes.home);
  }, [clearTokens, routes.home]);

  const accountItems = useMemo(() => {
    if (!isAuthenticated) return [];
    const items: Array<{
      href: string;
      label: string;
      Icon: IconComponent;
      testId: string;
    }> = [
      {
        href: routes.wallet,
        label: t('navigation.walletTab'),
        Icon: WalletIcon,
        testId: 'mobile-wallet-link',
      },
    ];
    if (role === 'admin') {
      items.push({
        href: routes.admin,
        label: t('navigation.adminTab'),
        Icon: UserIcon,
        testId: 'mobile-admin-link',
      });
    }
    return items;
  }, [isAuthenticated, role, t, routes]);

  if (!mounted) return null;

  return (
    <MobileNav data-mobile-menu data-testid="mobile-nav">
      {isAuthenticated && displayName ? (
        <MobileUserCard data-testid="mobile-user-card">
          <EquippedPlayerAvatar
            name={displayName}
            size="md"
            equippedAvatarId={snapshot.equippedAvatarId}
            equippedBadgeId={snapshot.equippedBadgeId}
            equippedNameColorId={snapshot.equippedNameColorId}
            equippedFrameId={snapshot.equippedFrameId}
            equippedAuraId={snapshot.equippedAuraId}
            equippedBannerId={snapshot.equippedBannerId}
            equippedGameSkinId={snapshot.equippedGameSkinId}
          />
          <div className="flex min-w-[120px] flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <UserNameEllipsis>{displayName}</UserNameEllipsis>
              {role !== 'free' && (
                <RoleBadge role={role}>{t(`common.roles.${role}`)}</RoleBadge>
              )}
            </div>
            {cosmeticBadges?.length ? (
              <div className="flex flex-wrap gap-1">
                {cosmeticBadges.map((badgeId) => (
                  <CosmeticBadge key={badgeId} badgeId={badgeId} />
                ))}
              </div>
            ) : null}
          </div>
        </MobileUserCard>
      ) : (
        <LinkButton
          href={routes.auth}
          variant="primary"
          size="md"
          fullWidth
          icon={<LoginIcon size={18} />}
          className="gap-2"
          data-testid="mobile-login-button"
        >
          {t('common.actions.login')}
        </LinkButton>
      )}

      <MobileSection>
        <MobileSectionLabel>
          {t('navigation.menuLabel') || 'MENU'}
        </MobileSectionLabel>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = iconForHref(item.href);
          return (
            <NavMobileLink
              key={item.label}
              href={item.href}
              data-testid={`mobile-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              variant="ghost"
              size="md"
              isActive={isActive}
              fullWidth
              icon={
                Icon ? (
                  <Icon size={18} />
                ) : item.icon ? (
                  <>{item.icon}</>
                ) : undefined
              }
              onClick={item.onClick}
            >
              {item.label}
              {pendingFriendCount &&
                pendingFriendCount > 0 &&
                item.href.endsWith('/friends') && (
                  <span className="ml-auto inline-flex items-center justify-center rounded-full bg-[var(--danger)] px-1.5 py-0.5 text-[10px] font-bold text-white min-w-[18px]">
                    {pendingFriendCount}
                  </span>
                )}
            </NavMobileLink>
          );
        })}
      </MobileSection>

      {accountItems.length > 0 && (
        <MobileSection>
          <MobileSectionLabel>
            {t('navigation.accountLabel') || 'ACCOUNT'}
          </MobileSectionLabel>
          {accountItems.map(({ href, label, Icon, testId }) => (
            <NavMobileLink
              key={href}
              href={href}
              data-testid={testId}
              variant="ghost"
              size="md"
              isActive={pathname === href}
              fullWidth
              icon={<Icon size={18} />}
            >
              {label}
            </NavMobileLink>
          ))}
        </MobileSection>
      )}

      <MobileSection>
        <MobileSectionLabel>
          {t('navigation.helpLabel') || 'HELP'}
        </MobileSectionLabel>
        <NavMobileLink
          href={routes.support}
          variant="ghost"
          size="md"
          isActive={pathname === routes.support}
          fullWidth
          icon={<SupportIcon size={18} />}
        >
          {t('common.actions.support')}
        </NavMobileLink>
      </MobileSection>

      {isAuthenticated && (
        <div className="mt-3">
          <Divider spacing="sm" />
          <Button
            variant="danger"
            ghost
            size="md"
            className="justify-start gap-3"
            data-testid="mobile-logout-button"
            onClick={handleLogout}
            icon={<LogoutIcon size={18} />}
          >
            {t('common.actions.logout')}
          </Button>
        </div>
      )}

      {pwa?.canInstall && (
        <div className="mt-3">
          <Button
            variant="secondary"
            size="md"
            fullWidth
            className="justify-start gap-3"
            data-testid="mobile-install-pwa-button"
            onClick={pwa.openModal}
            icon={<SmartphoneIcon size={18} />}
          >
            {t('pwa.install.button')}
          </Button>
        </div>
      )}

      <div className="mt-3 flex flex-col gap-3 px-2">
        <LanguagePills data-testid="mobile-language-switcher" />
      </div>

      <MobileBottomBar>
        <MobileVersionText>v{appConfig.appVersion}</MobileVersionText>
      </MobileBottomBar>
    </MobileNav>
  );
}

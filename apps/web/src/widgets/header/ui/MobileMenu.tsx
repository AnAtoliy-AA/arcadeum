'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useCosmeticBadges } from '@/features/referrals/hooks/useCosmeticBadges';
import { CosmeticBadge } from '@/shared/ui';
import { routes } from '@/shared/config/routes';
import { appConfig } from '@/shared/config/app-config';
import {
  MobileNav,
  MobileUserInfo,
  UserNameEllipsis,
  MobileVersionText,
  NavMobileLink,
} from './styles';
import {
  Button,
  YStack,
  LogoutIcon,
  SupportIcon,
  RoleBadge,
  LinkButton,
  Divider,
} from '@arcadeum/ui';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: Array<{ href: string; label: string }>;
}

const noop = () => () => {};

export function MobileMenu({ isOpen, onClose, navItems }: MobileMenuProps) {
  const pathname = usePathname();
  const { snapshot, clearTokens } = useSessionTokens();
  const { t } = useTranslation();
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

  const isAuthenticated = !!snapshot.accessToken;
  const displayName =
    snapshot.displayName || snapshot.username || snapshot.email;
  const role = snapshot.role || 'free';
  const { data: cosmeticBadges } = useCosmeticBadges();

  const handleLogout = useCallback(async () => {
    await clearTokens();
    window.location.replace('/');
  }, [clearTokens]);

  if (!mounted || !isOpen) return null;

  const content = (
    <MobileNav data-mobile-menu data-testid="mobile-nav">
      {navItems.map((item) => (
        <NavMobileLink
          key={item.href}
          href={item.href}
          variant="ghost"
          size="sm"
          isActive={pathname === item.href}
          onClick={onClose}
          fullWidth
          data-testid={`mobile-nav-${item.href.replace('/', '') || 'home'}`}
        >
          {item.label}
        </NavMobileLink>
      ))}

      {isAuthenticated && displayName && (
        <>
          <MobileUserInfo>
            <UserNameEllipsis>{displayName}</UserNameEllipsis>
            {role !== 'free' && (
              <RoleBadge role={role}>{t(`common.roles.${role}`)}</RoleBadge>
            )}
            {cosmeticBadges?.map((badgeId) => (
              <CosmeticBadge key={badgeId} badgeId={badgeId} />
            ))}
          </MobileUserInfo>
          <Button
            variant="listItem"
            mt="$2"
            data-testid="mobile-logout-button"
            onClick={handleLogout}
            icon={<LogoutIcon size={18} />}
          >
            {t('common.actions.logout')}
          </Button>
        </>
      )}

      {!isAuthenticated && (
        <YStack marginTop="$2" alignItems="center">
          <LinkButton
            href="/auth"
            variant="ghost"
            size="sm"
            onPress={onClose}
            data-testid="mobile-login-button"
          >
            {t('common.actions.login')}
          </LinkButton>
        </YStack>
      )}

      <YStack marginTop="$4">
        <Divider spacing="sm" />
      </YStack>

      <LinkButton
        href={routes.support}
        variant="ghost"
        size="sm"
        isActive={pathname === routes.support}
        onClick={onClose}
        fullWidth
      >
        <SupportIcon size={18} />
        {t('common.actions.support')}
      </LinkButton>

      <MobileVersionText>v{appConfig.appVersion}</MobileVersionText>
    </MobileNav>
  );

  return createPortal(content, document.body);
}

'use client';

import { useCallback } from 'react';
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
  XStack,
  LogoutIcon,
  SupportIcon,
  RoleBadge,
  LinkButton,
  Divider,
} from '@arcadeum/ui';
import { useIsMounted } from './useIsMounted';
import { useHeaderAuth } from './useHeaderAuth';

interface MobileMenuProps {
  isOpen: boolean;
  navItems: Array<{ href: string; label: string }>;
}

export function MobileMenu({ isOpen, navItems }: MobileMenuProps) {
  const pathname = usePathname();
  // clearTokens and snapshot.role are MobileMenu-specific — not in useHeaderAuth
  const { snapshot, clearTokens } = useSessionTokens();
  const { t } = useTranslation();
  const mounted = useIsMounted();
  const { isAuthenticated, displayName } = useHeaderAuth();
  const role = snapshot.role || 'free';
  const { data: cosmeticBadges } = useCosmeticBadges();

  const handleLogout = useCallback(async () => {
    await clearTokens();
    window.location.replace('/');
  }, [clearTokens]);

  if (!mounted || !isOpen) return null;

  const content = (
    <MobileNav data-mobile-menu data-testid="mobile-nav">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <XStack
            key={item.href}
            width="100%"
            borderRadius="$4"
            backgroundColor={
              isActive ? 'rgba(87, 195, 255, 0.1)' : 'transparent'
            }
          >
            <NavMobileLink
              href={item.href}
              data-testid={`mobile-nav-${item.href.replace('/', '') || 'home'}`}
              variant="ghost"
              size="sm"
              isActive={isActive}
              fullWidth
            >
              {item.label}
            </NavMobileLink>
          </XStack>
        );
      })}

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
        gap="$2"
        isActive={pathname === routes.support}
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

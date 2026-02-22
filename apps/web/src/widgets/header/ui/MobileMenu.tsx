'use client';

import React, { useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useCosmeticBadges } from '@/features/referrals/hooks/useCosmeticBadges';
import { CosmeticBadge } from '@/shared/ui';
import { routes } from '@/shared/config/routes';
import { appConfig } from '@/shared/config/app-config';
import {
  MobileNav,
  MobileNavLink,
  MobileUserInfo,
  UserName,
  RoleBadge,
  DropdownItem,
  AuthButton,
  DropdownDivider,
  MobileVersionText,
} from './styles';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: Array<{ href: string; label: string }>;
}

export function MobileMenu({ isOpen, onClose, navItems }: MobileMenuProps) {
  const pathname = usePathname();
  const { snapshot, clearTokens } = useSessionTokens();
  const { t } = useTranslation();

  const isAuthenticated = !!snapshot.accessToken;
  const displayName =
    snapshot.displayName || snapshot.username || snapshot.email;
  const role = snapshot.role || 'free';
  const { data: cosmeticBadges } = useCosmeticBadges();

  const handleLogout = useCallback(async () => {
    await clearTokens();
    onClose();
    window.location.href = '/';
  }, [clearTokens, onClose]);

  return (
    <MobileNav $isOpen={isOpen} data-mobile-menu data-testid="mobile-nav">
      {navItems.map((item) => (
        <MobileNavLink
          key={item.href}
          href={item.href}
          $active={pathname === item.href}
          onClick={onClose}
        >
          {item.label}
        </MobileNavLink>
      ))}

      {isAuthenticated && displayName && (
        <>
          <MobileUserInfo>
            <UserName>{displayName}</UserName>
            {role !== 'free' && (
              <RoleBadge $role={role} style={{ marginLeft: '0.5rem' }}>
                {t(`common.roles.${role}`)}
              </RoleBadge>
            )}
            {cosmeticBadges?.map((badgeId) => (
              <CosmeticBadge key={badgeId} badgeId={badgeId} />
            ))}
          </MobileUserInfo>
          <DropdownItem
            onClick={() => {
              handleLogout();
              onClose();
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
            {t('common.actions.logout')}
          </DropdownItem>
        </>
      )}

      {!isAuthenticated && (
        <AuthButton
          href="/auth"
          onClick={onClose}
          style={{ marginTop: '0.5rem', textAlign: 'center' }}
        >
          {t('common.actions.login')}
        </AuthButton>
      )}

      <DropdownDivider style={{ marginTop: '1rem' }} />

      <MobileNavLink
        href={routes.terms}
        $active={pathname === routes.terms}
        onClick={onClose}
      >
        {t('legal.nav.terms')}
      </MobileNavLink>
      <MobileNavLink
        href={routes.privacy}
        $active={pathname === routes.privacy}
        onClick={onClose}
      >
        {t('legal.nav.privacy')}
      </MobileNavLink>
      <MobileNavLink
        href={routes.contact}
        $active={pathname === routes.contact}
        onClick={onClose}
      >
        {t('legal.nav.contact')}
      </MobileNavLink>
      <MobileNavLink
        href={routes.support}
        $active={pathname === routes.support}
        onClick={onClose}
        style={{ color: '#ec4899' }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: 18, height: 18 }}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {t('common.actions.support')}
        </span>
      </MobileNavLink>

      <MobileVersionText>v{appConfig.appVersion}</MobileVersionText>
    </MobileNav>
  );
}

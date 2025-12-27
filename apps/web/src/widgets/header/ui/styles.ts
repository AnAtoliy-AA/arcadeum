import styled from 'styled-components';
import Link from 'next/link';
import { LinkButton, Button, Divider } from '@/shared/ui';

export const HeaderContainer = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${({ theme }) => theme.background.base};
  border-bottom: 1px solid ${({ theme }) => theme.surfaces.card.border};
  backdrop-filter: blur(8px);
  background: ${({ theme }) => `${theme.background.base}f2`};
`;

export const HeaderInner = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  gap: 2rem;
`;

export const Logo = styled(Link)`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`;

export const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;

  @media (max-width: 900px) {
    display: none;
  }
`;

export const NavLink = styled(Link)<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 500;
  color: ${({ theme, $active }) =>
    $active ? theme.text.primary : theme.text.muted};
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    color: ${({ theme }) => theme.text.primary};
    background: ${({ theme }) => theme.surfaces.card.background};
  }

  ${({ $active, theme }) =>
    $active &&
    `
    background: ${theme.surfaces.card.background};
    border-bottom: 2px solid ${theme.buttons.primary.gradientStart};
  `}
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const DesktopOnly = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 900px) {
    display: none;
  }
`;

export const ProfileMenuContainer = styled.div`
  position: relative;

  @media (max-width: 640px) {
    display: none;
  }
`;

export const UserInfo = styled(Button).attrs({
  variant: 'secondary',
  size: 'sm',
})`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 640px) {
    display: none;
  }
`;

export const UserName = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text.primary};
`;

export const ChevronIcon = styled.svg<{ $isOpen: boolean }>`
  width: 16px;
  height: 16px;
  color: ${({ theme }) => theme.text.muted};
  transition: transform 0.2s ease;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
`;

export const ProfileDropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 200px;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  opacity: ${({ $isOpen }) => ($isOpen ? '1' : '0')};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transform: ${({ $isOpen }) =>
    $isOpen ? 'translateY(0)' : 'translateY(-8px)'};
  transition: all 0.2s ease;
  z-index: 1000;
  overflow: hidden;
`;

export const DropdownItem = styled(Button).attrs({ variant: 'ghost' })`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0;
  font-size: 0.875rem;
  justify-content: flex-start;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.background.base};
  }

  svg {
    width: 18px;
    height: 18px;
    color: ${({ theme }) => theme.text.muted};
  }
`;

export const DropdownLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: ${({ theme }) => theme.text.primary};
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.background.base};
  }

  svg {
    width: 18px;
    height: 18px;
    color: ${({ theme }) => theme.text.muted};
  }
`;

export const DropdownDivider = styled(Divider).attrs({ spacing: 'sm' })``;

export const AuthButton = styled(LinkButton).attrs({
  variant: 'primary',
  size: 'sm',
})`
  @media (max-width: 480px) {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
`;

export const MobileMenuButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'sm',
})`
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;

  @media (max-width: 900px) {
    display: flex;
  }
`;

export const MobileNav = styled.div<{ $isOpen: boolean }>`
  display: none;
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  z-index: 99;
  background: ${({ theme }) => theme.background.base};
  border-bottom: 1px solid ${({ theme }) => theme.surfaces.card.border};
  padding: 1rem 1.5rem;
  flex-direction: column;
  gap: 0.5rem;
  transform: ${({ $isOpen }) =>
    $isOpen ? 'translateY(0)' : 'translateY(-100%)'};
  opacity: ${({ $isOpen }) => ($isOpen ? '1' : '0')};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transition: all 0.3s ease;

  @media (max-width: 900px) {
    display: flex;
  }
`;

export const MobileNavLink = styled(Link)<{ $active: boolean }>`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme, $active }) =>
    $active ? theme.text.primary : theme.text.muted};
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.text.primary};
    background: ${({ theme }) => theme.surfaces.card.background};
  }

  ${({ $active, theme }) =>
    $active &&
    `
    background: ${theme.surfaces.card.background};
    border-left: 3px solid ${theme.buttons.primary.gradientStart};
  `}
`;

export const MobileUserInfo = styled.div`
  padding: 0.75rem 1rem;
  border-top: 1px solid ${({ theme }) => theme.surfaces.card.border};
  margin-top: 0.5rem;
`;

/** Role colors mapping */
const roleColors: Record<string, { bg: string; text: string; glow?: string }> =
  {
    free: { bg: 'rgba(148, 163, 184, 0.2)', text: '#94a3b8' },
    premium: {
      bg: 'linear-gradient(135deg, rgba(251, 191, 36, 0.25), rgba(245, 158, 11, 0.25))',
      text: '#fbbf24',
      glow: '0 0 8px rgba(251, 191, 36, 0.4)',
    },
    vip: {
      bg: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(219, 39, 119, 0.3))',
      text: '#e879f9',
      glow: '0 0 12px rgba(168, 85, 247, 0.5)',
    },
    supporter: {
      bg: 'linear-gradient(135deg, rgba(236, 72, 153, 0.25), rgba(244, 114, 182, 0.25))',
      text: '#f472b6',
      glow: '0 0 8px rgba(236, 72, 153, 0.4)',
    },
    moderator: {
      bg: 'rgba(34, 197, 94, 0.2)',
      text: '#22c55e',
    },
    tester: {
      bg: 'rgba(59, 130, 246, 0.2)',
      text: '#3b82f6',
    },
    developer: {
      bg: 'rgba(99, 102, 241, 0.2)',
      text: '#818cf8',
    },
    admin: {
      bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(251, 146, 60, 0.3))',
      text: '#ef4444',
      glow: '0 0 10px rgba(239, 68, 68, 0.5)',
    },
  };

export const RoleBadge = styled.span<{ $role: string }>`
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 4px;
  background: ${({ $role }) => roleColors[$role]?.bg || roleColors.free.bg};
  color: ${({ $role }) => roleColors[$role]?.text || roleColors.free.text};
  box-shadow: ${({ $role }) => roleColors[$role]?.glow || 'none'};
  white-space: nowrap;
`;

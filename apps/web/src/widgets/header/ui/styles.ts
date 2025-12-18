import styled from "styled-components";
import Link from "next/link";

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

  @media (max-width: 768px) {
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

  ${({ $active, theme }) => $active && `
    background: ${theme.surfaces.card.background};
    border-bottom: 2px solid ${theme.buttons.primary.gradientStart};
  `}
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const ProfileMenuContainer = styled.div`
  position: relative;

  @media (max-width: 640px) {
    display: none;
  }
`;

export const UserInfo = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
    opacity: 0.9;
  }

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
  transform: ${({ $isOpen }) => $isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
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
  opacity: ${({ $isOpen }) => $isOpen ? '1' : '0'};
  visibility: ${({ $isOpen }) => $isOpen ? 'visible' : 'hidden'};
  transform: ${({ $isOpen }) => $isOpen ? 'translateY(0)' : 'translateY(-8px)'};
  transition: all 0.2s ease;
  z-index: 1000;
  overflow: hidden;
`;

export const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.text.primary};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
  text-align: left;

  &:hover {
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

export const DropdownDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.surfaces.card.border};
  margin: 0.25rem 0;
`;

export const AuthButton = styled(Link)`
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${({ theme }) => theme.buttons.primary.text};
  background: ${({ theme }) => theme.buttons.primary.gradientStart};
  text-decoration: none;
  transition: transform 0.2s ease;
  border: none;
  cursor: pointer;

  &:hover {
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
`;

export const MobileMenuButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.text.primary};
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.surfaces.card.background};
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

export const MobileNav = styled.div<{ $isOpen: boolean }>`
  display: none;
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.background.base};
  border-bottom: 1px solid ${({ theme }) => theme.surfaces.card.border};
  padding: 1rem 1.5rem;
  flex-direction: column;
  gap: 0.5rem;
  transform: ${({ $isOpen }) => $isOpen ? 'translateY(0)' : 'translateY(-100%)'};
  opacity: ${({ $isOpen }) => $isOpen ? '1' : '0'};
  visibility: ${({ $isOpen }) => $isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;

  @media (max-width: 768px) {
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

  ${({ $active, theme }) => $active && `
    background: ${theme.surfaces.card.background};
    border-left: 3px solid ${theme.buttons.primary.gradientStart};
  `}
`;

export const MobileUserInfo = styled.div`
  padding: 0.75rem 1rem;
  border-top: 1px solid ${({ theme }) => theme.surfaces.card.border};
  margin-top: 0.5rem;
`;

import Link from 'next/link';
import styled, { css } from 'styled-components';
import { Button } from '@/shared/ui';

export const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const OptionList = styled.div`
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
`;

export const OptionButton = styled(Button).attrs<{ $active: boolean }>(
  ({ $active }) => ({
    variant: $active ? 'primary' : 'secondary',
    size: 'lg',
    active: $active,
  }),
)<{ $active: boolean }>`
  justify-content: flex-start;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 1.25rem;
  height: auto;
  min-height: 100px;
  text-align: left;
  border-radius: 16px;
  transition: all 0.2s ease;

  ${({ $active, theme }) =>
    !$active &&
    css`
      background: ${theme.interactive.option.background};
      border-color: ${theme.interactive.option.border};

      &:hover {
        background: ${theme.interactive.option.activeBackground};
        border-color: ${theme.interactive.option.hoverBorder};
      }
    `}
`;

export const OptionLabel = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: inherit;
`;

export const OptionDescription = styled.span`
  font-size: 0.9rem;
  opacity: 0.8;
  line-height: 1.5;
  font-weight: 400;
`;

export const PillGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

export const PillButton = styled(Button).attrs<{ $active: boolean }>(
  ({ $active }) => ({
    variant: $active ? 'primary' : 'chip',
    size: 'md',
    active: $active,
  }),
)<{ $active: boolean }>`
  min-width: 80px;
  justify-content: center;
`;

export const DownloadGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

export const DownloadLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.interactive.download.border};
  background: ${({ theme }) => theme.interactive.download.background};
  color: ${({ theme }) => theme.text.primary};
  font-weight: 600;
  transition: all 0.2s ease;
  text-decoration: none;

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.interactive.download.hoverBorder};
    background: ${({ theme }) => theme.interactive.download.hoverBackground};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const DownloadIcon = styled.span`
  font-size: 1.25rem;
`;

export const AccountStatus = styled.p`
  margin: 0;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.text.secondary};
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  padding: 1.5rem;
  border-radius: 16px;
  text-align: center;
`;

export const AccountActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const baseActionStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.6rem;
  border-radius: 999px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  flex: 1;
  min-width: 140px;

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const ActionButton = styled(Link)`
  ${baseActionStyles}
  background: ${({ theme }) => theme.buttons.primary.gradientStart};
  color: ${({ theme }) => theme.buttons.primary.text};
  box-shadow: ${({ theme }) => theme.buttons.primary.shadow};

  /* Handle gradient if background is not explicitly just a color */
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.buttons.primary.gradientStart},
    ${({ theme }) => theme.buttons.primary.gradientEnd}
  );

  &:hover {
    box-shadow: ${({ theme }) => theme.buttons.primary.hoverShadow};
    // background: hover handling for gradient is done via opacity or specialized tokens usually, but just keep gradient or slight shift
    opacity: 0.9;
  }
`;

export const SecondaryButton = styled(Link)`
  ${baseActionStyles}
  border: 1px solid ${({ theme }) => theme.buttons.secondary.border};
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};

  &:hover {
    border-color: ${({ theme }) => theme.buttons.secondary.hoverBorder};
    background: ${({ theme }) => theme.buttons.secondary.hoverBackground};
  }
`;

export const ToggleRow = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  background: ${({ theme }) => theme.interactive.option.background};
  border: 1px solid ${({ theme }) => theme.interactive.option.border};
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.interactive.option.hoverBorder};
    background: ${({ theme }) => theme.interactive.option.activeBackground};
  }
`;

export const ToggleLabel = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

export const ToggleInput = styled.input.attrs({ type: 'checkbox' })`
  appearance: none;
  width: 3.25rem;
  height: 1.75rem;
  background: ${({ theme }) => theme.interactive.pill.inactiveBackground};
  border-radius: 999px;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid ${({ theme }) => theme.interactive.pill.border};

  &:checked {
    background: ${({ theme }) => theme.text.accent};
    border-color: ${({ theme }) => theme.text.accent};
  }

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: calc(1.75rem - 8px);
    height: calc(1.75rem - 8px);
    background: white;
    border-radius: 50%;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  &:checked::after {
    transform: translateX(1.5rem);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 2px;
  }
`;

export const BlockedUserRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  border-radius: 16px;
  gap: 1rem;
`;

export const BlockedUserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
  flex: 1;
`;

export const UnblockButton = styled(Button).attrs({
  variant: 'secondary',
  size: 'sm',
})`
  border-radius: 999px;
  white-space: nowrap;

  &:hover {
    border-color: #ef4444;
    color: #ef4444;
    background: #ef444410;
  }
`;

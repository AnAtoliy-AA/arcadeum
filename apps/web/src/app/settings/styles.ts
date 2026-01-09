import Link from 'next/link';
import styled, { css } from 'styled-components';
import { Card as SharedCard } from '@/shared/ui';

export const Page = styled.main`
  min-height: 100vh;
  padding: clamp(2.5rem, 6vw, 5rem) clamp(1.5rem, 6vw, 4rem);
  display: flex;
  justify-content: center;
  background-color: ${({ theme }) => theme.background.base};
  color: ${({ theme }) => theme.text.primary};
`;

export const Wrapper = styled.div`
  width: min(960px, 100%);
  display: flex;
  flex-direction: column;
  gap: clamp(2rem, 4vw, 3rem);
`;

export const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: ${({ theme }) => theme.surfaces.hero.background};
  border: 1px solid ${({ theme }) => theme.surfaces.hero.border};
  border-radius: 24px;
  padding: clamp(2rem, 5vw, 3.5rem);
  box-shadow: ${({ theme }) => theme.surfaces.hero.shadow};
  backdrop-filter: blur(18px);
`;

export const Title = styled.h1`
  margin: 0;
  font-size: clamp(2.2rem, 5vw, 2.8rem);
  font-weight: 700;
  color: ${({ theme }) => theme.text.secondary};
`;

export const Description = styled.p`
  margin: 0;
  font-size: 1rem;
  line-height: 1.7;
  color: ${({ theme }) => theme.text.muted};
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: ${({ theme }) => theme.surfaces.panel.background};
  border: 1px solid ${({ theme }) => theme.surfaces.panel.border};
  border-radius: 24px;
  padding: clamp(1.75rem, 4vw, 2.5rem);
  box-shadow: ${({ theme }) => theme.surfaces.panel.shadow};
  backdrop-filter: blur(14px);
`;

export const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.35rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

export const SectionDescription = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.text.muted};
`;

export const OptionList = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const activeOptionStyles = css`
  border-color: ${({ theme }) => theme.interactive.option.activeBorder};
  background: ${({ theme }) => theme.interactive.option.activeBackground};
  box-shadow: ${({ theme }) => theme.interactive.option.activeShadow};
`;

export const OptionButton = styled.button<{ $active: boolean }>`
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1.1rem 1.25rem;
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.interactive.option.border};
  background: ${({ theme }) => theme.interactive.option.background};
  color: ${({ theme }) => theme.text.primary};
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 3px;
  }

  ${(props) => (props.$active ? activeOptionStyles : null)}

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-2px);
      border-color: ${({ theme }) => theme.interactive.option.hoverBorder};
    }
  }
`;

export const OptionLabel = styled.span`
  font-size: 1.05rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

export const OptionDescription = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text.muted};
`;

export const PillGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

export const PillButton = styled.button<{ $active: boolean }>`
  padding: 0.6rem 1.2rem;
  border-radius: 999px;
  border: 1px solid
    ${({ $active, theme }) =>
      $active
        ? theme.interactive.pill.activeBorder
        : theme.interactive.pill.border};
  background: ${({ $active, theme }) =>
    $active
      ? theme.interactive.pill.activeBackground
      : theme.interactive.pill.inactiveBackground};
  color: ${({ theme }) => theme.text.primary};
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;

  ${(props) =>
    props.$active
      ? css`
          box-shadow: ${props.theme.interactive.pill.activeShadow};
        `
      : null}

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 3px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-1px);
      border-color: ${({ theme }) => theme.interactive.pill.hoverBorder};
    }
  }
`;

export const DownloadGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

export const DownloadLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.interactive.download.border};
  background: ${({ theme }) => theme.interactive.download.background};
  color: ${({ theme }) => theme.text.primary};
  font-weight: 600;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 3px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-2px);
      border-color: ${({ theme }) => theme.interactive.download.hoverBorder};
      background: ${({ theme }) => theme.interactive.download.hoverBackground};
    }
  }
`;

export const DownloadIcon = styled.span`
  font-size: 0.9rem;
  line-height: 1;
  color: ${({ theme }) => theme.text.accent};
`;

export const AccountCard = styled(SharedCard)`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: ${({ theme }) => theme.account.cardBackground};
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.account.border};
  padding: 1.5rem;
`;

export const AccountStatus = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.text.muted};
`;

export const AccountActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const baseActionStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.6rem;
  border-radius: 999px;
  font-weight: 600;
  text-decoration: none;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 3px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-2px);
    }
  }
`;

export const ActionButton = styled(Link)`
  ${baseActionStyles}
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.buttons.primary.gradientStart},
    ${({ theme }) => theme.buttons.primary.gradientEnd}
  );
  color: ${({ theme }) => theme.buttons.primary.text};
  border: 1px solid transparent;
  box-shadow: ${({ theme }) => theme.buttons.primary.shadow};

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      box-shadow: ${({ theme }) => theme.buttons.primary.hoverShadow};
    }
  }
`;

export const SecondaryButton = styled(Link)`
  ${baseActionStyles}
  border: 1px solid ${({ theme }) => theme.buttons.secondary.border};
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      border-color: ${({ theme }) => theme.buttons.secondary.hoverBorder};
      background: ${({ theme }) => theme.buttons.secondary.hoverBackground};
    }
  }
`;

export const ToggleRow = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: ${({ theme }) => theme.interactive.option.background};
  border: 1px solid ${({ theme }) => theme.interactive.option.border};
  border-radius: 18px;
  cursor: pointer;
  user-select: none;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-2px);
      border-color: ${({ theme }) => theme.interactive.option.hoverBorder};
    }
  }
`;

export const ToggleLabelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const ToggleLabel = styled.span`
  font-size: 1.05rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

export const ToggleDescription = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text.muted};
`;

export const ToggleInput = styled.input.attrs({ type: 'checkbox' })`
  appearance: none;
  width: 3rem;
  height: 1.6rem;
  flex-shrink: 0;
  background: ${({ theme }) => theme.interactive.pill.inactiveBackground};
  border-radius: 999px;
  position: relative;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.interactive.pill.border};
  margin: 0;

  &:checked {
    background: ${({ theme }) => theme.interactive.pill.activeBackground};
    border-color: ${({ theme }) => theme.interactive.pill.activeBorder};
  }

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: calc(1.6rem - 6px);
    height: calc(1.6rem - 6px);
    background: ${({ theme }) => theme.text.primary};
    border-radius: 50%;
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  &:checked::after {
    transform: translateX(1.4rem);
    background: white;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 2px;
  }
`;

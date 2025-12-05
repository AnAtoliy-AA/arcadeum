import Link from "next/link";
import styled, { css } from "styled-components";

// Layout Components

export const Page = styled.main`
  min-height: 100vh;
  padding: clamp(2.5rem, 6vw, 5rem) clamp(1.5rem, 6vw, 4rem);
  display: flex;
  justify-content: center;
  background:
    radial-gradient(circle at top left, ${({ theme }) => theme.background.radialStart}, transparent 55%),
    radial-gradient(circle at bottom right, ${({ theme }) => theme.background.radialEnd}, transparent 55%),
    ${({ theme }) => theme.background.base};
  color: ${({ theme }) => theme.text.primary};
  font-family: var(--font-geist-sans);
`;

export const Wrapper = styled.div`
  width: min(960px, 100%);
  display: flex;
  flex-direction: column;
  gap: clamp(2rem, 4vw, 3rem);
`;

// Hero Components

export const HeroCard = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: ${({ theme }) => theme.surfaces.hero.background};
  border: 1px solid ${({ theme }) => theme.surfaces.hero.border};
  border-radius: 24px;
  padding: clamp(2.25rem, 5vw, 3.5rem);
  box-shadow: ${({ theme }) => theme.surfaces.hero.shadow};
  backdrop-filter: blur(18px);
`;

export const Badge = styled.span`
  align-self: flex-start;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text.accent};
  background: ${({ theme }) => theme.buttons.secondary.background};
  border: 1px solid ${({ theme }) => theme.buttons.secondary.border};
`;

export const Title = styled.h1`
  margin: 0;
  font-size: clamp(2.1rem, 5vw, 2.8rem);
  font-weight: 700;
  color: ${({ theme }) => theme.text.secondary};
`;

export const Description = styled.p`
  margin: 0;
  font-size: 1rem;
  line-height: 1.7;
  color: ${({ theme }) => theme.text.muted};
`;

export const Status = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.surfaces.panel.border};
  background: ${({ theme }) => theme.surfaces.panel.background};
  box-shadow: ${({ theme }) => theme.surfaces.panel.shadow};
`;

export const StatusHeadline = styled.span`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

export const StatusDescription = styled.span`
  font-size: 0.95rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.text.muted};
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  justify-content: flex-start;
`;

export const ActionLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem 1.75rem;
  border-radius: 999px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease,
    border-color 0.2s ease;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 3px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
  }
`;

export const PrimaryAction = styled(ActionLink)`
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.buttons.primary.gradientStart},
    ${({ theme }) => theme.buttons.primary.gradientEnd}
  );
  color: ${({ theme }) => theme.buttons.primary.text};
  box-shadow: ${({ theme }) => theme.buttons.primary.shadow};

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${({ theme }) => theme.buttons.primary.hoverShadow};
    }
  }
`;

export const SecondaryAction = styled(ActionLink)`
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: 1px solid ${({ theme }) => theme.buttons.secondary.border};
  box-shadow: none;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-2px);
      border-color: ${({ theme }) => theme.buttons.secondary.hoverBorder};
      background: ${({ theme }) => theme.buttons.secondary.hoverBackground};
    }
  }
`;

export const HomeLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.accent};
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 3px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      text-decoration: underline;
    }
  }
`;

export const HomeLinkIcon = styled.span`
  font-size: 0.95rem;
`;

export const ShortcutsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

export const ShortcutLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.accent};
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 3px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      text-decoration: underline;
    }
  }
`;

export const ShortcutIcon = styled.span`
  font-size: 0.9rem;
`;

// Panel Components

export const PanelsSection = styled.section`
  display: grid;
  gap: clamp(1.5rem, 3vw, 2.5rem);
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

export const PanelCard = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding: clamp(1.75rem, 4vw, 2.5rem);
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.surfaces.panel.border};
  background: ${({ theme }) => theme.surfaces.panel.background};
  box-shadow: ${({ theme }) => theme.surfaces.panel.shadow};
`;

export const PanelHeader = styled.header`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

export const PanelBadge = styled.span`
  align-self: flex-start;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text.accent};
  background: ${({ theme }) => theme.buttons.secondary.background};
  border: 1px solid ${({ theme }) => theme.buttons.secondary.border};
`;

export const PanelTitle = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

export const PanelSubtitle = styled.p`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.text.muted};
`;

// Form Components

export const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

export const FieldLabel = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.surfaces.panel.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.primary};
  font-size: 0.95rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::placeholder {
    color: ${({ theme }) => theme.text.muted};
    opacity: 0.75;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 3px;
  }
`;

// Button Components

export const buttonBase = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.6rem;
  border-radius: 999px;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease,
    border-color 0.2s ease;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 3px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
    transform: none;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled) {
      transform: translateY(-2px);
    }
  }
`;

export const PrimaryButton = styled.button`
  ${buttonBase}
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.buttons.primary.gradientStart},
    ${({ theme }) => theme.buttons.primary.gradientEnd}
  );
  color: ${({ theme }) => theme.buttons.primary.text};
  box-shadow: ${({ theme }) => theme.buttons.primary.shadow};

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled) {
      box-shadow: ${({ theme }) => theme.buttons.primary.hoverShadow};
    }
  }
`;

export const SecondaryButton = styled.button`
  ${buttonBase}
  background: ${({ theme }) => theme.buttons.secondary.background};
  border-color: ${({ theme }) => theme.buttons.secondary.border};
  color: ${({ theme }) => theme.buttons.secondary.text};

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled) {
      border-color: ${({ theme }) => theme.buttons.secondary.hoverBorder};
      background: ${({ theme }) => theme.buttons.secondary.hoverBackground};
    }
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

// Text Components

export const HelperText = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text.muted};
`;

export const ErrorText = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: rgba(244, 63, 94, 0.9);
`;

export const StatusText = styled.p`
  margin: 0;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.text.notice};
`;

// Session Components

export const SessionCallout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1rem 1.2rem;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.surfaces.panel.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  box-shadow: ${({ theme }) => theme.surfaces.panel.shadow};
`;

export const CalloutHeading = styled.span`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

export const CalloutDetail = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text.muted};
`;

export const TokenList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const TokenRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const TokenLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

export const TokenValue = styled.code`
  font-family: var(--font-geist-mono);
  font-size: 0.78rem;
  padding: 0.4rem 0.6rem;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.surfaces.panel.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.accent};
  word-break: break-all;
`;

export const SessionDetailList = styled.dl`
  margin: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.45rem;
`;

export const SessionDetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: baseline;
`;

export const SessionDetailTerm = styled.dt`
  margin: 0;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.text.muted};
`;

export const SessionDetailValue = styled.dd`
  margin: 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text.secondary};
  font-family: var(--font-geist-mono);
  word-break: break-all;
`;

export const EmptyState = styled.p`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.text.muted};
`;

// Download Section Components

export const DownloadSectionWrapper = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: ${({ theme }) => theme.surfaces.panel.background};
  border: 1px solid ${({ theme }) => theme.surfaces.panel.border};
  border-radius: 24px;
  padding: clamp(1.75rem, 4vw, 2.5rem);
  box-shadow: ${({ theme }) => theme.surfaces.panel.shadow};
  backdrop-filter: blur(14px);
`;

export const DownloadTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

export const DownloadDescription = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.text.muted};
`;

export const DownloadButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

export const DownloadButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.6rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.interactive.download.border};
  background: ${({ theme }) => theme.interactive.download.background};
  color: ${({ theme }) => theme.text.primary};
  text-decoration: none;
  transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;

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

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
  }
`;

export const DownloadIcon = styled.span`
  font-size: 0.9rem;
  line-height: 1;
  color: ${({ theme }) => theme.text.accent};
`;

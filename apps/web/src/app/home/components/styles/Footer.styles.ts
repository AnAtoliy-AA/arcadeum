'use client';

import styled from 'styled-components';

export const FooterSection = styled.footer`
  padding: 4rem 2rem 2rem;
  background: ${({ theme }) => theme.surfaces.panel.background};
  border-top: 1px solid ${({ theme }) => theme.surfaces.card.border};
  position: relative;
  z-index: 10;
`;

export const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 3rem;
  align-items: center;
`;

export const SocialContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

export const SocialTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text.muted};
  margin: 0;
`;

export const SocialLinks = styled.div`
  display: flex;
  gap: 1.5rem;
`;

export const SocialIcon = styled.a`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.text.primary};
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      ${({ theme }) => theme.buttons.primary.gradientStart},
      ${({ theme }) => theme.buttons.primary.gradientEnd}
    );
    opacity: 0;
    transition: opacity 0.2s;
  }

  span,
  svg {
    position: relative;
    z-index: 1;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: transparent;
    color: white;
    box-shadow: 0 4px 12px
      ${({ theme }) => theme.buttons.primary.gradientStart}40;

    &::before {
      opacity: 1;
    }

    svg {
      fill: currentColor;
    }
  }
`;

export const Copyright = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text.muted};
  text-align: center;
`;

export const LegalLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

export const LegalLink = styled.a`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text.muted};
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: ${({ theme }) => theme.text.primary};
  }
`;

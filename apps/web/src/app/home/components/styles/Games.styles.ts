'use client';

import { LinkButton } from '@/shared/ui';
import styled from 'styled-components';
import { fadeInUp } from './Animations.styles';
import { SectionContainer } from './Common.styles';

export const GamesSection = styled(SectionContainer)`
  display: flex;
  flex-direction: column;
  gap: 4rem;
  background: ${({ theme }) => theme.surfaces.card.background}20;
`;

export const GameGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

// Base Components
export const GameCard = styled.div<{ $gradient?: string }>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  border-radius: 24px;
  padding: 2rem;
  text-align: left;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  height: 100%;
  animation: ${fadeInUp} 0.6s ease-out both;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${({ $gradient }) => $gradient ?? 'transparent'};
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 0;
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.3);
    border-color: transparent;

    &::before {
      opacity: 0.05;
    }
  }
`;

export const MainGameCard = styled(GameCard)`
  flex-direction: row;
  align-items: center;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  background: ${({ theme }) => theme.surfaces.card.background}90;
  backdrop-filter: blur(20px);
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-4px) scale(1.01);
    box-shadow:
      0 20px 40px rgba(0, 0, 0, 0.4),
      0 0 20px ${({ theme }) => theme.buttons.primary.gradientStart}30;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }
`;

export const MainGameInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

export const VariantsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 1200px;
  justify-content: center;
`;

export const SectionHeaderSmall = styled.h4`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.text.secondary};
  font-weight: 600;
  margin: 2rem 0 1rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

export const PacksContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  max-width: 800px;
  margin: 0 auto;
`;

export const PackBadge = styled.div`
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  border-radius: 12px;
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: transform 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-2px);
    background: ${({ theme }) => theme.surfaces.card.background};
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart}50;
  }
`;

export const PackName = styled.span`
  color: ${({ theme }) => theme.text.primary};
  font-weight: 600;
  font-size: 0.9rem;
`;

export const PackCount = styled.span`
  color: ${({ theme }) => theme.text.muted};
  font-size: 0.8rem;
  background: ${({ theme }) => theme.surfaces.card.border};
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
`;

export const GameCardContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  z-index: 1;
`;

export const GameIcon = styled.div`
  font-size: 3rem;
  line-height: 1;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  transform-origin: left center;
  transition: transform 0.3s ease;

  ${GameCard}:hover & {
    transform: scale(1.1);
  }
`;

export const GameTitle = styled.h3`
  margin: 0;
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #ff4d4d 0%, #f9cb28 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  letter-spacing: -0.02em;
`;

export const GameDescription = styled.p`
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.text.secondary};
  max-width: 650px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

export const SubSectionTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text.primary};
  margin: 1.5rem 0 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  display: flex;
  align-items: center;

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 1em;
    margin-right: 0.75rem;
    background: linear-gradient(
      180deg,
      ${({ theme }) => theme.buttons.primary.gradientStart},
      ${({ theme }) => theme.buttons.primary.gradientEnd}
    );
    border-radius: 4px;
    box-shadow: 0 0 10px ${({ theme }) => theme.buttons.primary.gradientStart}40;
  }
`;

export const SimpleBadge = styled.span`
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0.35rem 0.85rem;
  background: ${({ theme }) => theme.surfaces.card.border}80;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  color: ${({ theme }) => theme.text.primary};
  display: inline-block;
`;

export const GameTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
`;

export const GameTag = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.surfaces.card.border};
  color: ${({ theme }) => theme.text.secondary};
  border: 1px solid transparent;
`;

export const PlayButton = styled(LinkButton)`
  align-self: flex-start;
  position: relative;
  z-index: 1;

  ${GameCard}:hover & {
    transform: translateX(4px);
    box-shadow: 0 4px 12px
      ${({ theme }) => theme.buttons.primary.gradientStart}40;
  }
`;

export const ComingSoonOverlay = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 2;

  span {
    display: inline-block;
    padding: 0.35rem 0.75rem;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.text.primary};
    background: ${({ theme }) => theme.surfaces.card.background};
    border: 1px solid ${({ theme }) => theme.surfaces.card.border};
    border-radius: 999px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

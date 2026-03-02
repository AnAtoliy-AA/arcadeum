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

export const SliderSection = styled(SectionContainer)`
  display: flex;
  flex-direction: column;
  gap: 3rem;
  max-width: 1400px;
  padding: 4rem 0;
  position: relative;
`;

export const SliderContainer = styled.div`
  position: relative;
  width: 100%;
  padding: 0 1.5rem;
`;

export const SliderTrack = styled.div<{ $isDragging?: boolean }>`
  display: flex;
  gap: 2rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  padding: 1.5rem 0.5rem 3rem;
  margin: 0 -0.5rem;
  -webkit-overflow-scrolling: touch;
  cursor: ${({ $isDragging }) => ($isDragging ? 'grabbing' : 'grab')};
  user-select: ${({ $isDragging }) => ($isDragging ? 'none' : 'auto')};
  justify-content: center;

  @media (max-width: 1024px) {
    justify-content: flex-start;
  }

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

export const SliderItem = styled.div`
  flex: 0 0 360px;
  scroll-snap-align: center;
  height: 320px;

  @media (max-width: 768px) {
    flex: 0 0 320px;
  }

  @media (max-width: 480px) {
    flex: 0 0 calc(100vw - 3rem);
  }
`;

export const SliderControls = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1rem;
`;

export const SliderButton = styled.button`
  background: ${({ theme }) => theme.surfaces.card.background}80;
  backdrop-filter: blur(10px);
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  color: ${({ theme }) => theme.text.primary};
  width: 54px;
  height: 54px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.buttons.primary.gradientStart};
    border-color: transparent;
    transform: scale(1.1);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  svg {
    width: 24px;
    height: 24px;
  }
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
  padding: 1.25rem;
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
  background: ${({ theme }) => theme.surfaces.card.background}90;
  backdrop-filter: blur(20px);
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow:
      0 20px 40px rgba(0, 0, 0, 0.4),
      0 0 20px ${({ theme }) => theme.buttons.primary.gradientStart}30;
  }
`;

export const MainGameInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: relative;
  z-index: 2;
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

export const GameTitle = styled.h3<{ $gradient?: string }>`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  background: ${({ $gradient }) =>
    $gradient ?? 'linear-gradient(135deg, #ff4d4d 0%, #f9cb28 100%)'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  letter-spacing: -0.02em;
  flex: 1;
`;

export const HelpIcon = styled.button`
  background: ${({ theme }) => theme.surfaces.card.border};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  color: ${({ theme }) => theme.text.secondary};
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  position: relative;
  z-index: 3;

  &:hover {
    background: ${({ theme }) => theme.buttons.primary.gradientStart};
    color: white;
    border-color: transparent;
    transform: scale(1.1);
  }
`;

export const GameDescription = styled.p`
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.text.secondary};
  max-width: 650px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
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

export const GameHeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
`;

export const StyledGameIcon = styled(GameIcon)`
  margin-bottom: 0;
  font-size: 2.5rem;
`;

export const StyledGameTags = styled(GameTags)`
  margin-top: 0;
  margin-bottom: 1rem;
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

export const CardFooter = styled.div`
  display: flex;
  margin-top: auto;
  padding-top: 1rem;
`;

export const StyledPlayButton = styled(PlayButton)`
  width: 100%;
`;

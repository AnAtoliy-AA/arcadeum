'use client';

import styled from 'styled-components';
import { LinkButton } from '@/shared/ui';
import { fadeInUp, shimmer, float } from './Animations.styles';

export const HeroSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 90vh;
  padding: 4rem 1.5rem;
  text-align: center;
  position: relative;
  overflow: hidden;

  @media (min-width: 1024px) {
    flex-direction: row;
    text-align: left;
    justify-content: space-between;
    gap: 4rem;
    padding: 4rem 3rem;
  }
`;

export const HeroBackground = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
  background: linear-gradient(
      to bottom,
      transparent 0%,
      ${({ theme }) => theme.background.base} 100%
    ),
    radial-gradient(
      circle at 50% 50%,
      ${({ theme }) => theme.buttons.primary.gradientStart}10 0%,
      transparent 50%
    );
`;

export const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  max-width: 650px;

  @media (min-width: 1024px) {
    align-items: flex-start;
  }
`;

export const HeroVisual = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
  height: 400px;
  display: none;
  perspective: 1000px;
  z-index: 1;

  @media (min-width: 1024px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export const CardStack = styled.div`
  position: relative;
  width: 240px;
  height: 340px;
  animation: ${float} 6s ease-in-out infinite;
`;

export const HeroCard = styled.div<{ $index: number; $color: string }>`
  position: absolute;
  inset: 0;
  border-radius: 18px;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 4px solid white;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 0 1px ${({ theme }) => theme.surfaces.card.border};
  transform-origin: center center;
  transform: rotate(${({ $index }) => $index * 10 - 10}deg)
    translate(
      ${({ $index }) => $index * 20 - 20}px,
      ${({ $index }) => $index * -10}px
    );
  transition: all 0.5s ease;
  z-index: ${({ $index }) => $index};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.25rem;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      ${({ $color }) => $color}15,
      transparent
    );
    z-index: 0;
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    color: ${({ theme }) => theme.text.primary};
    z-index: 1;
    opacity: 0.9;
  }

  .card-center {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 5rem;
    z-index: 1;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  }

  .card-bottom {
    text-align: center;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.text.secondary};
    z-index: 1;
    padding-top: 1rem;
    border-top: 1px solid ${({ theme }) => theme.surfaces.card.border};
  }

  &:hover {
    transform: rotate(${({ $index }) => $index * 15 - 15}deg)
      translate(
        ${({ $index }) => $index * 40 - 40}px,
        ${({ $index }) => $index * -20 - 20}px
      )
      scale(1.1);
    z-index: 10;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
  }
`;

export const Kicker = styled.span`
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text.onAccent};
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.buttons.primary.gradientStart},
    ${({ theme }) => theme.buttons.primary.gradientEnd},
    ${({ theme }) => theme.buttons.primary.gradientStart}
  );
  background-size: 200% auto;
  padding: 0.5rem 1.25rem;
  border-radius: 999px;
  box-shadow: 0 0 20px ${({ theme }) => theme.buttons.primary.gradientStart}40;
  animation:
    ${fadeInUp} 0.6s ease-out 0.15s both,
    ${shimmer} 3s linear infinite;
  margin-bottom: 0.5rem;
  display: inline-block;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

export const HeroTitle = styled.h1`
  margin: 0;
  font-size: clamp(3.5rem, 8vw, 6rem);
  font-weight: 800;
  line-height: 1.1;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.text.primary} 0%,
    ${({ theme }) => theme.buttons.primary.gradientStart} 50%,
    ${({ theme }) => theme.buttons.primary.gradientEnd} 100%
  );
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation:
    ${fadeInUp} 0.6s ease-out 0.1s both,
    ${shimmer} 8s linear infinite;
`;

export const Tagline = styled.p`
  margin: 0;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  animation: ${fadeInUp} 0.6s ease-out 0.2s both;
`;

export const HeroDescription = styled.p`
  margin: 0;
  max-width: 500px;
  font-size: 1.15rem;
  line-height: 1.7;
  color: ${({ theme }) => theme.text.muted};
  animation: ${fadeInUp} 0.6s ease-out 0.3s both;
`;

export const HeroActions = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  animation: ${fadeInUp} 0.6s ease-out 0.4s both;

  @media (min-width: 1024px) {
    justify-content: flex-start;
  }
`;

export const PrimaryAction = styled(LinkButton).attrs({
  variant: 'primary',
  size: 'lg',
})`
  border-radius: 999px;
  padding: 1rem 2.5rem;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

export const SecondaryAction = styled(LinkButton).attrs({
  variant: 'secondary',
  size: 'lg',
})`
  border-radius: 999px;
  padding: 1rem 2.5rem;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

'use client';

import styled from 'styled-components';
import { fadeIn } from './Animations.styles';

export const PresentationContainer = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);

  &:fullscreen {
    border-radius: 0;
    border: none;
    width: 100vw;
    height: 100vh;
  }
`;

export const SlideContent = styled.div<{ $isActive: boolean }>`
  flex: 1;
  display: ${({ $isActive }) => ($isActive ? 'block' : 'none')};
  width: 100%;
  height: 100%;
  padding: 0;
  animation: ${fadeIn} 0.5s ease-out;
  position: relative;
`;

export const SlideImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block; // Removes potential font-size gaps
`;

export const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(
    0,
    0,
    0,
    0.5
  ); // Slightly darker for better contrast over images
  backdrop-filter: blur(10px);
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 10;
  transition: opacity 0.3s ease;

  // Auto-hide controls when checking visual experience?
  // For now keep them visible or show on hover could be better UX,
  // but let's stick to persistent for usability first.

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
  }
`;

export const ControlButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: ${({ theme }) => theme.text.primary};
  cursor: pointer;
  padding: 0.6rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
    color: ${({ theme }) => theme.text.accent};
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    transform: none;
  }
`;

export const Pagination = styled.div`
  display: flex;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 20px;
`;

export const PageDot = styled.button<{ $isActive: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  padding: 0;
  cursor: pointer;
  background: ${({ theme, $isActive }) =>
    $isActive ? theme.text.accent : theme.text.muted};
  opacity: ${({ $isActive }) => ($isActive ? 1 : 0.5)};
  transition: all 0.3s ease;
  transform: ${({ $isActive }) => ($isActive ? 'scale(1.2)' : 'scale(1)')};

  &:hover {
    opacity: 1;
    background: ${({ theme }) => theme.text.accent};
  }
`;

export const FullscreenButton = styled(ControlButton)`
  margin-left: 1rem;
`;

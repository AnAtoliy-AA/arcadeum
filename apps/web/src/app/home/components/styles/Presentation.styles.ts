'use client';
import styled, { keyframes } from 'styled-components';

import { SectionContainer } from './Common.styles';

export const PresentationSection = styled(SectionContainer)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

export const VideoContainer = styled.div`
  width: 100%;
  max-width: 1000px;
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: #000;

  &::before {
    content: '';
    display: block;
    padding-bottom: 56.25%; // 16:9 aspect ratio
  }

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
`;

export const VideoPlaceholder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;

  &:hover button {
    background: #ff0000;
    transform: scale(1.1);
  }
`;

export const ThumbnailImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.7;
  transition: opacity 0.3s ease;

  ${VideoPlaceholder}:hover & {
    opacity: 0.5;
  }
`;

export const PlaceholderOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  .placeholder-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(
        45deg,
        rgba(255, 77, 77, 0.1) 0%,
        rgba(249, 203, 40, 0.1) 50%,
        rgba(77, 77, 255, 0.1) 100%
      ),
      url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC42IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI24pIiBvcGFjaXR5PSIwLjA1Ii8+PC9zdmc+');
    background-size: cover;
    opacity: 0.6;
    transition: transform 0.8s cubic-bezier(0.2, 0, 0, 1);
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at center,
      transparent 0%,
      rgba(0, 0, 0, 0.4) 100%
    );
    z-index: 1;
  }

  ${VideoPlaceholder}:hover .placeholder-bg {
    transform: scale(1.05);
    opacity: 0.8;
  }
`;

export const PlayButton = styled.button`
  position: absolute;
  width: 80px;
  height: 80px;
  background: rgba(255, 0, 0, 0.9);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 0 30px rgba(255, 0, 0, 0.3);
  z-index: 2;

  svg {
    width: 32px;
    height: 32px;
    fill: #white;
    margin-left: 4px;
    filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.2));
  }

  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.2);
    animation: ${pulse} 2s infinite;
  }
`;

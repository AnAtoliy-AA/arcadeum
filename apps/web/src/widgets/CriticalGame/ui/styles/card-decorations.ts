import styled, { css } from 'styled-components';

export const CardName = styled.div<{ $variant?: string }>`
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  color: white;

  /* Top Overlay Position */
  position: absolute;
  top: 0.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  min-width: 60%;
  max-width: 90%;
  padding: 0.2rem 0.5rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  z-index: 20;

  ${({ $variant }) =>
    $variant === 'cyberpunk' &&
    css`
      font-family: 'Courier New', monospace;
      letter-spacing: 1px;
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid #c026d3;
      border-radius: 4px;
      color: #e879f9;
      text-shadow: 0 0 5px rgba(192, 38, 211, 0.6);
      clip-path: polygon(
        10px 0,
        100% 0,
        100% calc(100% - 10px),
        calc(100% - 10px) 100%,
        0 100%,
        0 10px
      );
      padding: 0.3rem 0.6rem;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 8px;
        height: 8px;
        border-top: 2px solid #06b6d4;
        border-left: 2px solid #06b6d4;
      }

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        right: 0;
        width: 8px;
        height: 8px;
        border-bottom: 2px solid #06b6d4;
        border-right: 2px solid #06b6d4;
      }
    `}

  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 1.4rem;

  @media (max-width: 768px) {
    font-size: 0.6rem;
    min-height: 1.2rem;
    padding: 0.15rem 0.4rem;
    top: 0.35rem;
  }
`;

export const CardDescription = styled.div<{ $variant?: string }>`
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
  line-height: 1.2;
  text-align: center;
  color: rgba(255, 255, 255, 0.9);

  /* Cyberpunk Font */
  ${({ $variant }) =>
    $variant === 'cyberpunk' &&
    css`
      font-family: 'Courier New', monospace;
      font-size: 0.6rem;
      letter-spacing: 0.5px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 1);
    `}

  /* Bottom Overlay Position */
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.5rem 0.35rem 0.35rem;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.6) 80%,
    transparent 100%
  );
  border-bottom-left-radius: 14px; /* Slightly less than card radius */
  border-bottom-right-radius: 14px;
  z-index: 15;

  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 1);
  min-height: 2.5rem;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 0.55rem;
    -webkit-line-clamp: 2;
    min-height: 2rem;
    padding: 0.4rem 0.25rem 0.3rem;
  }
`;

export const CardCountBadge = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.85));
  color: white;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 900;
  border: 2px solid rgba(255, 255, 255, 0.4);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.6),
    inset 0 1px 2px rgba(255, 255, 255, 0.2);
  z-index: 10;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);

  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
    font-size: 0.75rem;
    top: 0.35rem;
    right: 0.35rem;
  }
`;

export const CardInner = styled.div`
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 0.25rem;
  width: 100%;
  height: 100%;
  padding: 0.5rem 0.35rem;
  border-radius: 12px;
`;

export const CardFrame = styled.div`
  position: absolute;
  inset: 4px;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  pointer-events: none;
  z-index: 2;

  &::before,
  &::after {
    content: '◆';
    position: absolute;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.6rem;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  }

  &::before {
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
  }

  &::after {
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
  }

  @media (max-width: 768px) {
    inset: 3px;
    border-width: 1.5px;
    &::before,
    &::after {
      font-size: 0.5rem;
    }
  }
`;

export const CardCorner = styled.div<{ $position: 'tl' | 'tr' | 'bl' | 'br' }>`
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  pointer-events: none;
  z-index: 2;

  ${({ $position }) => {
    switch ($position) {
      case 'tl':
        return `top: 6px; left: 6px; border-right: none; border-bottom: none; border-top-left-radius: 4px;`;
      case 'tr':
        return `top: 6px; right: 6px; border-left: none; border-bottom: none; border-top-right-radius: 4px;`;
      case 'bl':
        return `bottom: 6px; left: 6px; border-right: none; border-top: none; border-bottom-left-radius: 4px;`;
      case 'br':
        return `bottom: 6px; right: 6px; border-left: none; border-top: none; border-bottom-right-radius: 4px;`;
    }
  }}

  @media (max-width: 768px) {
    width: 12px;
    height: 12px;
    border-width: 1.5px;
    ${({ $position }) => {
      switch ($position) {
        case 'tl':
          return `top: 4px; left: 4px;`;
        case 'tr':
          return `top: 4px; right: 4px;`;
        case 'bl':
          return `bottom: 4px; left: 4px;`;
        case 'br':
          return `bottom: 4px; right: 4px;`;
      }
    }}
  }
`;

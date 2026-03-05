import styled from 'styled-components';
import { getVariantStyles } from './variants';

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

  ${({ $variant }) => getVariantStyles($variant).cards.getCardNameStyles?.()}

  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 1.4rem;

  /* Media query removed to keep consistent size */
`;

export const CardDescription = styled.div<{ $variant?: string }>`
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
  line-height: 1.2;
  text-align: center;
  color: rgba(255, 255, 255, 0.9);

  ${({ $variant }) =>
    getVariantStyles($variant).cards.getCardDescriptionStyles?.()}

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

  /* Media query removed to keep consistent size */
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

  /* Media query removed to keep consistent size */
`;

export const CardInner = styled.div<{ $variant?: string }>`
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
  overflow: hidden;

  ${({ $variant }) => getVariantStyles($variant).cards.getCardInnerStyles?.()}
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

  /* Media query removed to keep consistent size */
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
  }}/* Media query removed to keep consistent size */
`;

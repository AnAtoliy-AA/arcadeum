import styled, { css } from 'styled-components';
import { CriticalCard } from '@/shared/types/games';
import { CARD_SPRITE_MAP } from './card-sprites';

// Base Card component for reuse in selectors
export const Card = styled.div<{
  $cardType?: CriticalCard;
  $index?: number;
  $variant?: string;
}>`
  aspect-ratio: 2/3;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: white;
  font-weight: 700;
  font-size: 0.75rem;
  text-align: center;
  padding: 0.75rem 0.5rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.4),
    inset 0 0 20px rgba(255, 255, 255, 0.1);

  ${({ $cardType, $variant }) => {
    const spriteIndex = $cardType ? (CARD_SPRITE_MAP[$cardType] ?? 0) : 0;
    const x = (spriteIndex % 6) * 20;
    const y = Math.floor(spriteIndex / 6) * 20;

    let spriteUrl = '';
    if ($variant === 'cyberpunk')
      spriteUrl = '/images/cards/cyberpunk_sprites.png';
    else if ($variant === 'underwater')
      spriteUrl = '/images/cards/underwater_sprites.png';
    else if ($variant === 'crime')
      spriteUrl = '/images/cards/crime_sprites.png';
    else if ($variant === 'horror')
      spriteUrl = '/images/cards/horror_sprites.png';
    else if ($variant === 'adventure')
      spriteUrl = '/images/cards/adventure_sprites.png';

    if (spriteUrl) {
      return css`
        background: url(${spriteUrl});
        background-size: 600% 600%;
        background-position: ${x}% ${y}%;
      `;
    }

    // Default fallback styling (Gradient-based)
    let background = 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)';
    if ($cardType === 'critical_event')
      background = 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)';
    else if ($cardType === 'neutralizer')
      background = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
    else if ($cardType === 'strike')
      background = 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';
    else if ($cardType === 'evade')
      background = 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)';
    else if ($cardType === 'trade')
      background = 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)';
    else if ($cardType === 'reorder')
      background = 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)';
    else if ($cardType === 'insight')
      background = 'linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)';
    else if (
      $cardType === 'wildcard' ||
      $cardType?.includes('mark') ||
      $cardType?.includes('steal') ||
      $cardType === 'stash'
    ) {
      background = 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)';
    }

    return css`
      background: ${background};
    `;
  }};

  animation: ${({ $index }) =>
    `cardSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${($index || 0) * 0.08}s both`};

  @keyframes cardSlideIn {
    from {
      opacity: 0;
      transform: translateY(40px) rotateZ(-8deg) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) rotateZ(0deg) scale(1);
    }
  }

  &:hover {
    transform: translateY(-12px) rotateZ(3deg) scale(1.08);
    box-shadow:
      0 20px 48px rgba(0, 0, 0, 0.6),
      inset 0 0 30px rgba(255, 255, 255, 0.15);
    z-index: 10;
  }

  &:active {
    transform: translateY(-4px) scale(1.02);
    box-shadow:
      0 6px 16px rgba(0, 0, 0, 0.5),
      inset 0 0 20px rgba(255, 255, 255, 0.1);
    transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${({ $variant }) =>
      $variant
        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 60%)'
        : 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.5) 0%, transparent 50%), linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 60%)'};
    pointer-events: none;
    border-radius: 16px;
    z-index: 5;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 6px;
    border-radius: 12px;
    background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.03) 10px,
      rgba(255, 255, 255, 0.03) 20px
    );
    pointer-events: none;
    z-index: 6;
  }
`;

export const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 1rem;
  position: relative;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(95px, 1fr));
    gap: 0.75rem;
  }
`;

export const StashedCard = styled(Card)`
  cursor: pointer;
  border: 2px dashed rgba(255, 255, 255, 0.8);
  transform: scale(0.95);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);

  &:hover {
    transform: scale(1);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
  }
`;

export const StashIcon = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  font-size: 1.2rem;
  background: #1a1b26;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

export const DeckCard = styled.div<{ $variant?: string }>`
  width: 75px;
  height: 112px; // aspect ratio 2/3 roughly
  border-radius: 12px;
  background: ${({ $variant }) => {
    if ($variant === 'cyberpunk')
      return 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)';
    if ($variant === 'underwater')
      return 'linear-gradient(135deg, #083344 0%, #164e63 100%)';
    if ($variant === 'crime')
      return 'linear-gradient(135deg, #18181b 0%, #27272a 100%)';
    if ($variant === 'horror')
      return 'linear-gradient(135deg, #020617 0%, #0f172a 100%)';
    if ($variant === 'adventure')
      return 'linear-gradient(135deg, #451a03 0%, #78350f 100%)';
    return 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
  }};
  border: 2px solid
    ${({ $variant }) => {
      if ($variant === 'cyberpunk') return '#c026d3';
      if ($variant === 'underwater') return '#22d3ee';
      if ($variant === 'crime') return '#dc2626';
      if ($variant === 'horror') return '#10b981';
      if ($variant === 'adventure') return '#f59e0b';
      return 'rgba(99, 102, 241, 0.5)';
    }};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.2s;

  &::before {
    content: '';
    position: absolute;
    inset: 4px;
    border: 2px dashed rgba(255, 255, 255, 0.1);
    border-radius: 8px;
  }

  &::after {
    content: '🎴';
    font-size: 2rem;
    opacity: 0.5;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
    border-color: ${({ $variant }) =>
      $variant ? 'white' : 'rgba(99, 102, 241, 0.8)'};
  }

  @media (max-width: 768px) {
    width: 55px;
    height: 82px;
    &::after {
      font-size: 1.5rem;
    }
  }
`;

export const CardEmoji = styled.div`
  font-size: 2.5rem;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.5));
  transform: scale(1);
  transition: transform 0.3s ease;

  ${Card}:hover & {
    transform: scale(1.1) rotate(5deg);
  }

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

export const CardName = styled.div`
  font-size: 0.85rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-shadow:
    0 2px 4px rgba(0, 0, 0, 0.8),
    0 0 12px rgba(0, 0, 0, 0.6);
  background: white;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  min-height: 1.6rem;
  display: flex;
  align-items: center;
  text-align: center;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.5));

  @media (max-width: 768px) {
    font-size: 0.6rem;
    letter-spacing: 0.3px;
    min-height: 1.4rem;
  }
`;

export const CardDescription = styled.div`
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: none;
  letter-spacing: 0;
  line-height: 1.2;
  text-align: center;
  width: 100%;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
  color: white;
  margin-top: auto;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  padding: 0.25rem 0.35rem;
  min-height: 2rem;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 8px;

  @media (max-width: 768px) {
    font-size: 0.55rem;
    -webkit-line-clamp: 2;
    min-height: 1.5rem;
    padding: 0.15rem 0.25rem;
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

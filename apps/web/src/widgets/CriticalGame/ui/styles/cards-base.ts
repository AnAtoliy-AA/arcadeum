import styled, { css } from 'styled-components';
import { CriticalCard } from '@/shared/types/games';
import { CARD_SPRITE_MAP, SPRITE_GRID_SIZE } from './card-sprites';
import { GAME_VARIANT } from '../../lib/constants';

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

    // Calculate position based on grid size
    // We use (GRID - 1) for the percentage calculation because background-position works that way:
    // 0% is left edge, 100% is right edge.
    // If we have 7 items, they are at 0/6, 1/6, 2/6, ... 6/6 (which is 0%, ~16.6%, ... 100%)
    const col = spriteIndex % SPRITE_GRID_SIZE;
    const row = Math.floor(spriteIndex / SPRITE_GRID_SIZE);

    const x = col * (100 / (SPRITE_GRID_SIZE - 1));
    const y = row * (100 / (SPRITE_GRID_SIZE - 1));

    let spriteUrl = '';
    if ($variant === GAME_VARIANT.CYBERPUNK)
      spriteUrl = '/images/cards/cyberpunk_sprites.png';
    else if ($variant === GAME_VARIANT.UNDERWATER)
      spriteUrl = '/images/cards/underwater_sprites.png';
    else if ($variant === GAME_VARIANT.CRIME)
      spriteUrl = '/images/cards/crime_sprites.png';
    else if ($variant === GAME_VARIANT.HORROR)
      spriteUrl = '/images/cards/horror_sprites.png';
    else if ($variant === GAME_VARIANT.ADVENTURE)
      spriteUrl = '/images/cards/adventure_sprites.png';

    if (spriteUrl) {
      return css`
        background: url(${spriteUrl});
        background-size: ${SPRITE_GRID_SIZE * 100}% ${SPRITE_GRID_SIZE * 100}%;
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

  /* Holographic Shine for Underwater */
  ${({ $variant }) =>
    $variant === GAME_VARIANT.UNDERWATER &&
    css`
      &::before {
        background: linear-gradient(
          135deg,
          rgba(236, 72, 153, 0.4) 0%,
          rgba(34, 211, 238, 0.4) 50%,
          rgba(236, 72, 153, 0.4) 100%
        );
        background-size: 200% 200%;
        animation: holoShine 4s linear infinite;
        opacity: 0.5;
        z-index: 5;
      }

      @keyframes holoShine {
        0% {
          background-position: 0% 0%;
        }
        100% {
          background-position: 200% 200%;
        }
      }

      border: 1px solid rgba(34, 211, 238, 0.5);
      box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.5),
        0 0 15px rgba(34, 211, 238, 0.3),
        inset 0 0 20px rgba(34, 211, 238, 0.1);
    `}

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
  /* Center Overlay Position */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  padding: 0.2rem 0.5rem;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  border-radius: 4px;
  border: none;
  box-shadow: none; /* Reduce visual noise in center */
  text-shadow:
    0 2px 4px black,
    0 0 8px black; /* Strong shadow to separate from neon */
  z-index: 20;

  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

export const DeckCard = styled.div<{ $variant?: string }>`
  width: 75px;
  height: 112px; // aspect ratio 2/3 roughly
  border-radius: 12px;
  background: ${({ $variant }) => {
    if ($variant === GAME_VARIANT.CYBERPUNK)
      return "url('/images/cards/cyberpunk_card_back.png') center/cover no-repeat";

    if ($variant === GAME_VARIANT.UNDERWATER) {
      const spriteIndex = 0; // Card back
      const col = spriteIndex % SPRITE_GRID_SIZE;
      const row = Math.floor(spriteIndex / SPRITE_GRID_SIZE);
      const x = col * (100 / (SPRITE_GRID_SIZE - 1));
      const y = row * (100 / (SPRITE_GRID_SIZE - 1));
      const size = SPRITE_GRID_SIZE * 100;
      return `url('/images/cards/underwater_sprites.png') ${x}% ${y}% / ${size}% ${size}% no-repeat`;
    }

    if ($variant === GAME_VARIANT.CRIME)
      return 'linear-gradient(135deg, #18181b 0%, #27272a 100%)';
    if ($variant === GAME_VARIANT.HORROR)
      return 'linear-gradient(135deg, #020617 0%, #0f172a 100%)';
    if ($variant === GAME_VARIANT.ADVENTURE)
      return 'linear-gradient(135deg, #451a03 0%, #78350f 100%)';
    return 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
  }};
  border: 2px solid
    ${({ $variant }) => {
      if ($variant === GAME_VARIANT.CYBERPUNK) return '#c026d3';
      if ($variant === GAME_VARIANT.UNDERWATER) return '#22d3ee';
      if ($variant === GAME_VARIANT.CRIME) return '#dc2626';
      if ($variant === GAME_VARIANT.HORROR) return '#10b981';
      if ($variant === GAME_VARIANT.ADVENTURE) return '#f59e0b';
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
    display: ${({ $variant }) =>
      $variant === GAME_VARIANT.CYBERPUNK ? 'none' : 'block'};
  }

  &::after {
    content: '🎴';
    font-size: 2rem;
    opacity: 0.5;
    display: ${({ $variant }) =>
      $variant === GAME_VARIANT.CYBERPUNK ? 'none' : 'block'};
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
  display: none; /* Hidden as per new design */

  ${Card}:hover & {
    transform: scale(1.1) rotate(5deg);
  }

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

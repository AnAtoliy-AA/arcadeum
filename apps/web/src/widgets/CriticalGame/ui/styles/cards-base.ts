import styled from 'styled-components';

// Base Card component for reuse in selectors
export const Card = styled.div<{ $cardType?: string; $index?: number }>`
  aspect-ratio: 2/3;
  border-radius: 16px;
  background: ${({ $cardType }) => {
    if ($cardType === 'critical_event')
      return 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)';
    if ($cardType === 'neutralizer')
      return 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
    if ($cardType === 'strike')
      return 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';
    if ($cardType === 'evade')
      return 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)';
    if ($cardType === 'trade')
      return 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)';
    if ($cardType === 'reorder')
      return 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)';
    if ($cardType === 'insight')
      return 'linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)';
    // Theft Pack cards
    if ($cardType === 'wildcard')
      return 'linear-gradient(135deg, #F472B6 0%, #9333EA 100%)'; // Pink to purple
    if ($cardType === 'mark')
      return 'linear-gradient(135deg, #FBBF24 0%, #EA580C 100%)'; // Yellow to orange
    if ($cardType === 'steal_draw')
      return 'linear-gradient(135deg, #22D3EE 0%, #0891B2 100%)'; // Cyan
    if ($cardType === 'stash')
      return 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)'; // Indigo
    if ($cardType === 'stash')
      return 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)'; // Indigo
    // Deity Pack cards
    if ($cardType === 'omniscience')
      return 'linear-gradient(135deg, #FDE68A 0%, #D97706 100%)'; // Gold
    if ($cardType === 'miracle')
      return 'linear-gradient(135deg, #A5F3FC 0%, #0891B2 100%)'; // Cyan-Blue Light
    if ($cardType === 'smite')
      return 'linear-gradient(135deg, #DC2626 0%, #7F1D1D 100%)'; // Deep Red
    if ($cardType === 'rapture')
      return 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)'; // Amber/Divine
    return 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)';
  }};
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
    background: radial-gradient(
        circle at 30% 30%,
        rgba(255, 255, 255, 0.5) 0%,
        transparent 50%
      ),
      linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 60%);
    pointer-events: none;
    border-radius: 16px;
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

export const DeckCard = styled.div`
  width: 75px;
  height: 112px; // aspect ratio 2/3 roughly
  border-radius: 12px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 2px solid rgba(99, 102, 241, 0.5);
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
    border-color: rgba(99, 102, 241, 0.8);
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
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-shadow:
    0 2px 4px rgba(0, 0, 0, 0.5),
    0 0 8px rgba(0, 0, 0, 0.3);
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.95),
    rgba(255, 255, 255, 0.8)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  min-height: 1.6rem;
  display: flex;
  align-items: center;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 0.6rem;
    letter-spacing: 0.3px;
    min-height: 1.4rem;
  }
`;

export const CardDescription = styled.div`
  font-size: 0.5rem;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
  line-height: 1.15;
  opacity: 0.85;
  text-align: center;
  width: 100%;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  color: rgba(255, 255, 255, 0.9);
  margin-top: auto;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  padding: 0 0.15rem;
  min-height: 1.15rem;

  @media (max-width: 768px) {
    font-size: 0.45rem;
    -webkit-line-clamp: 2;
    min-height: 1rem;
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
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 0.25rem;
  width: 100%;
  height: 100%;
  padding: 0.5rem 0.35rem;
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

import styled from 'styled-components';

export const Page = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.background.base};
  padding-top: 80px; /* Header height */
`;

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

export const Card = styled.div`
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: ${({ theme }) => theme.surfaces.card.shadow};
`;

export const CardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  margin: 0;
`;

export const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.buttons.primary.gradientStart};
`;

export const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const BreakdownTable = styled.div`
  width: 100%;
  margin-top: 2rem;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  border-radius: 12px;
  overflow: hidden;
`;

export const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  padding: 1rem 1.5rem;
  background: rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid ${({ theme }) => theme.surfaces.card.border};
  font-weight: 600;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text.secondary};
`;

export const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.surfaces.card.border};
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }
`;

export const GameIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${({ theme }) => theme.buttons.primary.gradientStart}20;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.buttons.primary.gradientStart};
  margin-right: 1rem;
`;

export const GameInfo = styled.div`
  display: flex;
  align-items: center;
`;

export const GameName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

// Animated skeleton for loading states
export const Skeleton = styled.div<{ $width?: string; $height?: string }>`
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || '100%'};
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.surfaces.card.border} 0%,
    ${({ theme }) => theme.surfaces.card.background} 50%,
    ${({ theme }) => theme.surfaces.card.border} 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

export const SkeletonCircle = styled(Skeleton)`
  border-radius: 50%;
`;

export const SkeletonText = styled(Skeleton)`
  border-radius: 4px;
`;

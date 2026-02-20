import styled, { keyframes } from 'styled-components';

export const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1rem;

  @media (min-width: 768px) {
    padding: 2.5rem 2rem;
  }
`;

export const DashboardTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  margin: 0;
`;

export const DashboardSubtitle = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.text.muted};
  margin: -0.5rem 0 0.5rem;
  line-height: 1.5;
`;

export const CardTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  margin: 0 0 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const CodeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: ${({ theme }) => theme.interactive.option.background};
  border: 1px solid ${({ theme }) => theme.interactive.option.border};
  border-radius: 10px;
`;

export const CodeText = styled.span`
  font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 2px;
  color: ${({ theme }) => theme.text.accent};
  flex: 1;
`;

export const CopyButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.buttons.primary.gradientStart};
  background: transparent;
  color: ${({ theme }) => theme.buttons.primary.gradientStart};
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.buttons.primary.gradientStart};
    color: ${({ theme }) => theme.buttons.primary.text};
  }
`;

export const ShareLinkRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text.muted};
`;

export const ShareLink = styled.span`
  color: ${({ theme }) => theme.text.accent};
  word-break: break-all;
`;

export const ProgressSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.secondary};
`;

export const ProgressCount = styled.span`
  font-weight: 700;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.text.primary};
`;

export const ProgressTarget = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.text.muted};
`;

export const TierList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const glowAnimation = keyframes`
  0%, 100% {
    box-shadow: 0 0 8px rgba(87, 195, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 16px rgba(87, 195, 255, 0.5);
  }
`;

export const TierCard = styled.div<{ $unlocked: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid
    ${({ theme, $unlocked }) =>
      $unlocked
        ? theme.buttons.primary.gradientStart
        : theme.surfaces.card.border};
  background: ${({ theme, $unlocked }) =>
    $unlocked
      ? theme.interactive.option.activeBackground
      : theme.interactive.option.background};
  opacity: ${({ $unlocked }) => ($unlocked ? 1 : 0.6)};
  transition: all 0.3s;
  animation: ${({ $unlocked }) => ($unlocked ? glowAnimation : 'none')} 3s
    ease-in-out infinite;
`;

export const TierIcon = styled.div<{ $unlocked: boolean }>`
  font-size: 1.5rem;
  opacity: ${({ $unlocked }) => ($unlocked ? 1 : 0.4)};
  flex-shrink: 0;
`;

export const TierContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
`;

export const TierTitle = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.text.primary};
`;

export const TierDescription = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text.muted};
`;

export const TierBadge = styled.div<{ $unlocked: boolean }>`
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  align-self: flex-start;
  margin-top: 0.25rem;
  background: ${({ $unlocked }) =>
    $unlocked
      ? 'linear-gradient(135deg, #10b981, #059669)'
      : 'rgba(107, 114, 128, 0.3)'};
  color: ${({ $unlocked }) => ($unlocked ? 'white' : 'rgba(255,255,255,0.5)')};
`;

export const CopiedNotice = styled.span`
  color: ${({ theme }) => theme.copyNotice};
  font-size: 0.8rem;
  font-weight: 500;
`;

export const BadgesRowContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

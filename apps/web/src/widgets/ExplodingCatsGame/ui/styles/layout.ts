import styled from "styled-components";

// Layout Components
export const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2.5rem;
  border-radius: 32px;
  background:
    radial-gradient(ellipse at top, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at bottom, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
    linear-gradient(180deg, ${({ theme }) => theme.background.base} 0%, ${({ theme }) => theme.surfaces.card.background} 100%);
  border: 2px solid ${({ theme }) => theme.surfaces.card.border};
  min-height: 600px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, transparent 40%);
    animation: ambientGlow 8s ease-in-out infinite;
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      ${({ theme }) => theme.buttons.primary.gradientStart} 20%,
      ${({ theme }) => theme.buttons.primary.gradientEnd || theme.buttons.primary.gradientStart} 80%,
      transparent 100%
    );
    box-shadow: 0 0 20px ${({ theme }) => theme.buttons.primary.gradientStart}80;
    animation: shimmer 4s ease-in-out infinite;
  }

  @keyframes ambientGlow {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
    50% { transform: translate(10%, -10%) scale(1.1); opacity: 0.8; }
  }

  @keyframes shimmer {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }

  &:fullscreen, &:-moz-full-screen, &:-webkit-full-screen {
    max-width: 100vw;
    max-height: 100vh;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    border: none;
    padding: 1rem 1rem 2rem 1rem;
    gap: 1rem;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: ${({ theme }) => theme.buttons.primary.gradientStart}50 transparent;

    &::before { display: none; }

    @media (max-width: 768px) {
      padding: 0.5rem 0.5rem 3rem 0.5rem;
      gap: 0.5rem;
    }
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 20px;
    gap: 1.25rem;
    border-width: 1.5px;
  }
`;

export const GameBoard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 1;
  min-height: 0;
  animation: fadeIn 0.5s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export const TableArea = styled.div<{ $showChat: boolean }>`
  display: grid;
  grid-template-columns: ${({ $showChat }) =>
    $showChat ? "minmax(0, 2fr) minmax(280px, 1fr)" : "minmax(0, 1fr)"};
  grid-template-rows: ${({ $showChat }) => ($showChat ? "1fr auto" : "1fr auto")};
  grid-template-areas: ${({ $showChat }) =>
    $showChat ? `"table chat" "hand chat"` : `"table" "hand"`};
  gap: 1.5rem;
  width: 100%;
  align-items: stretch;
  min-height: 0;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    grid-template-rows: ${({ $showChat }) => ($showChat ? "auto auto 400px" : "auto auto")};
    grid-template-areas: ${({ $showChat }) =>
      $showChat ? `"table" "hand" "chat"` : `"table" "hand"`};
  }

  @media (max-width: 768px) { gap: 1rem; }
`;

export const HandSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  grid-area: hand;
  min-width: 0;
`;

export const HandContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

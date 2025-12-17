import styled from "styled-components";
import { ActionButton } from "./cards";

// Modal Components
export const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.2s ease-out;
`;

export const ModalContent = styled.div`
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 2px solid ${({ theme }) => theme.surfaces.card.border};
  border-radius: 24px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid ${({ theme }) => theme.surfaces.card.border};
`;

export const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
`;

export const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: ${({ theme }) => theme.surfaces.panel.background};
  color: ${({ theme }) => theme.text.primary};
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.buttons.primary.gradientStart};
    color: ${({ theme }) => theme.buttons.primary.text};
    transform: rotate(90deg);
  }
`;

export const ModalSection = styled.div`
  margin-bottom: 1.5rem;
`;

export const SectionLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.75rem;
`;

export const OptionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
`;

export const OptionButton = styled.button<{ $selected?: boolean }>`
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid ${({ $selected, theme }) =>
    $selected ? theme.buttons.primary.gradientStart : theme.surfaces.card.border};
  background: ${({ $selected, theme }) =>
    $selected
      ? `linear-gradient(135deg, ${theme.buttons.primary.gradientStart}20, transparent)`
      : theme.surfaces.panel.background};
  color: ${({ theme }) => theme.text.primary};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ModalActions = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 2rem;
`;

export const ModalButton = styled(ActionButton)`
  flex: 1;
`;

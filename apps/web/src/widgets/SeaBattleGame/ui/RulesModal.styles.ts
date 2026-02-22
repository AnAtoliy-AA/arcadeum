import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(10, 15, 25, 0.85);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 1.5rem;
  animation: ${fadeIn} 0.3s ease-out;
`;

export const ModalContainer = styled.div`
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 28px;
  max-width: 850px;
  width: 100%;
  max-height: 90%;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(56, 189, 248, 0.15);
  overflow: hidden;
  animation: ${fadeIn} 0.4s cubic-bezier(0.16, 1, 0.3, 1);
`;

export const ModalHeader = styled.div`
  padding: 2.5rem 3rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to bottom, rgba(56, 189, 248, 0.05), transparent);
  border-bottom: 1px solid rgba(56, 189, 248, 0.1);
`;

export const ModalTitle = styled.h2`
  margin: 0;
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(56, 189, 248, 0.2);
  color: #94a3b8;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.5rem;

  &:hover {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.4);
    color: #ef4444;
    transform: rotate(90deg);
  }
`;

export const ScrollArea = styled.div`
  padding: 1.5rem 3rem 3rem;
  overflow-y: auto;
  flex: 1;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(56, 189, 248, 0.2);
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(56, 189, 248, 0.4);
  }
`;

export const Section = styled.div`
  margin-bottom: 3rem;
  animation: ${slideIn} 0.5s ease-out both;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
`;

export const IconWrapper = styled.div<{ $gradient?: string }>`
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: ${(props) =>
    props.$gradient || 'linear-gradient(135deg, #38bdf8, #3b82f6)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  box-shadow: 0 4px 12px rgba(56, 189, 248, 0.25);
`;

export const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: 0.01em;
`;

export const RulesText = styled.p`
  margin: 0;
  font-size: 1.125rem;
  line-height: 1.7;
  color: #94a3b8;
  padding-left: 3.6rem; /* Align with title text (Icon size + gap) */
`;

export const FleetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
  padding-left: 3.6rem;
  margin-top: 1.5rem;
`;

export const ShipCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(56, 189, 248, 0.1);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(56, 189, 248, 0.3);
    transform: translateY(-4px);
    box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.3);
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(56, 189, 248, 0.05),
      transparent
    );
    transform: translateX(-100%);
    transition: transform 0.6s ease;
  }

  &:hover::after {
    transform: translateX(100%);
  }
`;

export const ShipHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ShipName = styled.span`
  font-weight: 700;
  color: #f8fafc;
  font-size: 1rem;
`;

export const ShipSize = styled.span`
  background: rgba(56, 189, 248, 0.1);
  color: #38bdf8;
  padding: 0.2rem 0.6rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
`;

export const ShipDescription = styled.span`
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.4;
`;

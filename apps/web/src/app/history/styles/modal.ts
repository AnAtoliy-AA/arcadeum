import styled from 'styled-components';
import { Button } from '@/shared/ui';

export const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
`;

export const ModalContent = styled.div`
  background: ${({ theme }) => theme.background.base};
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.surfaces.card.border};
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const BackButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'sm',
})`
  color: ${({ theme }) => theme.buttons.primary.gradientStart};
  padding: 0;
  text-align: left;
  justify-content: flex-start;

  &:hover:not(:disabled) {
    text-decoration: underline;
    background: transparent;
  }
`;

export const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
`;

export const ModalBody = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const ModalLoading = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
`;

export const ModalError = styled.div`
  padding: 3rem;
  text-align: center;
`;

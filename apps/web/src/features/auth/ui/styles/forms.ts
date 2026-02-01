import styled from 'styled-components';
import { Input as SharedInput } from '@/shared/ui';

export const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

export const FieldLabel = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

// Use shared Input component with auth-specific styling
export const Input = styled(SharedInput)`
  width: 100%;
  border-radius: 12px;
  font-size: 0.95rem;
`;

import styled from 'styled-components';
import { ReactNode } from 'react';

export interface FormGroupProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  required?: boolean;
  description?: string;
  children: ReactNode;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

const Required = styled.span`
  color: #dc2626;
  margin-left: 0.25rem;
`;

const Description = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text.muted};
`;

const ErrorText = styled.span`
  font-size: 0.8rem;
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export function FormGroup({
  label,
  htmlFor,
  error,
  required,
  description,
  children,
}: FormGroupProps) {
  return (
    <Container>
      {label && (
        <Label htmlFor={htmlFor}>
          {label}
          {required && <Required>*</Required>}
        </Label>
      )}
      {description && <Description>{description}</Description>}
      {children}
      {error && <ErrorText>⚠ {error}</ErrorText>}
    </Container>
  );
}

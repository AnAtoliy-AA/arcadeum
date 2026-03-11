import { YStack, Text, styled } from 'tamagui';
import { memo } from 'react';
import type { ReactNode } from 'react';

export type FormGroupProps = {
  label?: string;
  htmlFor?: string;
  error?: string;
  required?: boolean;
  description?: string;
  children: ReactNode;
};

const Container = styled(YStack, {
  name: 'FormGroup',
  gap: '$2',
  width: '100%',
});

const Label = styled(Text, {
  name: 'FormLabel',
  fontSize: '$3',
  fontWeight: '600',
  color: '$color',
});

const RequiredText = styled(Text, {
  color: '$error',
  marginLeft: '$1',
});

const Description = styled(Text, {
  fontSize: '$2',
  color: '$color',
  opacity: 0.6,
});

const ErrorText = styled(Text, {
  fontSize: '$2',
  color: '$error',
  marginTop: '$1',
});

export const FormGroup = memo(function FormGroup({
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
        <label htmlFor={htmlFor} style={{ display: 'block', cursor: 'pointer' }}>
          <Label>
            {label}
            {required && <RequiredText>*</RequiredText>}
          </Label>
        </label>
      )}
      {description && <Description>{description}</Description>}
      {children}
      {error && <ErrorText>⚠ {error}</ErrorText>}
    </Container>
  );
});

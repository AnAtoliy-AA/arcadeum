'use client';
import { YStack, Text, styled, H2, GetProps } from 'tamagui';
import { memo } from 'react';
import type { ReactNode, ReactElement } from 'react';

export type SectionProps = {
  title?: string;
  description?: string;
  variant?: 'legal';
  children: ReactNode;
  'data-testid'?: string;
};

const StyledSection = styled(YStack, {
  name: 'Section',
  gap: '$3',
  borderRadius: '$5',
  borderWidth: 1,
  borderColor: '$borderColor',
  padding: '$5',
  backgroundColor: '$glassBg',
  backdropFilter: 'blur(10px)',

  variants: {
    variant: {
      legal: {
        backgroundColor: '$glassBg',
        backdropFilter: 'blur(14px)',
        padding: '$6',
        borderRadius: '$6',
      },
    },
  } as const,
});

const SectionTitle = styled(H2, {
  name: 'SectionTitle',
  margin: 0,
  fontSize: '$5',
  fontWeight: '600',
  color: '$color',
});

const SectionDescription = styled(Text, {
  name: 'SectionDescription',
  margin: 0,
  fontSize: '$3',
  lineHeight: '$2',
  color: '$color',
  opacity: 0.7,
});

export const Section = StyledSection.styleable<
  Omit<SectionProps, 'children'> & GetProps<typeof StyledSection>
>(({ title, description, variant, ...props }, ref) => (
  <StyledSection {...props} variant={variant} ref={ref}>
    {title && <SectionTitle data-testid="section-title">{title}</SectionTitle>}
    {description && <SectionDescription>{description}</SectionDescription>}
    {props.children}
  </StyledSection>
));

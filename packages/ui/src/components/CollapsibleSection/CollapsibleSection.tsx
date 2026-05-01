'use client';

import { YStack, XStack, Text, Button, styled } from 'tamagui';
import { useState, useCallback, memo } from 'react';
import type { ReactNode } from 'react';

export type CollapsibleSectionProps = {
  title?: string;
  description?: string;
  defaultExpanded?: boolean;
  showLabel?: string;
  hideLabel?: string;
  headerContent?: ReactNode;
  children: ReactNode;
};

const StyledSection = styled(YStack, {
  name: 'CollapsibleSection',
  gap: '$2',
  padding: '$4',
  borderRadius: '$4',
  borderWidth: 1,
  borderColor: '$borderColor',
  backgroundColor: '$background',
});

export const CollapsibleSection = memo(function CollapsibleSection({
  title,
  description,
  defaultExpanded = true,
  showLabel = 'Show',
  hideLabel = 'Hide',
  headerContent,
  children,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggle = useCallback(() => setIsExpanded((prev) => !prev), []);

  return (
    <StyledSection>
      <XStack justifyContent="space-between" alignItems="center">
        <XStack alignItems="center" gap="$3">
          {title && (
            <Text fontSize="$4" fontWeight="600" color="$color">
              {title}
            </Text>
          )}
          {headerContent}
        </XStack>
        <Button size="$2" variant="outlined" onClick={toggle}>
          <XStack alignItems="center" gap="$1">
            <Text fontSize="$2">{isExpanded ? hideLabel : showLabel}</Text>
            <Text fontSize="$2" rotate={isExpanded ? '0deg' : '180deg'}>
              ▼
            </Text>
          </XStack>
        </Button>
      </XStack>
      {description && (
        <Text fontSize="$2" opacity={0.6} marginBottom="$2">
          {description}
        </Text>
      )}
      {isExpanded && children}
    </StyledSection>
  );
});

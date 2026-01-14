'use client';

import { useState, ReactNode, HTMLAttributes } from 'react';

import {
  StyledSection,
  SectionTitle,
  SectionDescription,
  SectionHeader,
  HeaderLeft,
  ToggleButton,
  CollapsibleContent,
} from './styles';

export interface CollapsibleSectionProps
  extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Whether the section is expanded by default */
  defaultExpanded?: boolean;
  /** Label for the show button (defaults to "Show") */
  showLabel?: string;
  /** Label for the hide button (defaults to "Hide") */
  hideLabel?: string;
  /** Extra content to render in the header (e.g., a "Select All" checkbox) */
  headerContent?: ReactNode;
  /** Section content */
  children: ReactNode;
}

export function CollapsibleSection({
  title,
  description,
  defaultExpanded = true,
  showLabel = 'Show',
  hideLabel = 'Hide',
  headerContent,
  children,
  ...props
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <StyledSection {...props}>
      <SectionHeader>
        <HeaderLeft>
          {title && <SectionTitle>{title}</SectionTitle>}
          {headerContent}
        </HeaderLeft>
        <ToggleButton
          type="button"
          $expanded={isExpanded}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? hideLabel : showLabel}
          <span>▼</span>
        </ToggleButton>
      </SectionHeader>
      {description && <SectionDescription>{description}</SectionDescription>}
      <CollapsibleContent $visible={isExpanded}>{children}</CollapsibleContent>
    </StyledSection>
  );
}

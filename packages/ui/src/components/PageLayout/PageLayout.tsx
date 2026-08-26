'use client';

import React from 'react';

/**
 * PageLayout is a Client Component that provides the base
 * structure and glassmorphism background for all pages.
 *
 * Renders a <div> (not <main>): every page already sits inside the
 * layout's <main id="main-content"> landmark, so nesting another <main>
 * would create a duplicated landmark and duplicate the skip-target id.
 */

export interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  'data-testid'?: string;
}

export const PageLayout = ({
  children,
  className = '',
  id,
  'data-testid': dataTestId,
}: PageLayoutProps) => {
  return (
    <div
      id={id}
      data-testid={dataTestId}
      className={`page-layout-glass-bg page-layout-base ${className}`}
    >
      {children}
    </div>
  );
};

PageLayout.displayName = 'PageLayout';

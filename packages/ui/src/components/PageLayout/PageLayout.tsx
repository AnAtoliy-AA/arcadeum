'use client';

import React from 'react';

/**
 * PageLayout is a Client Component that provides the base
 * structure and glassmorphism background for all pages.
 *
 * By using a standard <main> element with static CSS classes, it keeps
 * hydration stable and avoids attribute mismatches during SSR.
 */

export interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  'data-testid'?: string;
}

export const PageLayout = ({ children, className = '', ...props }: PageLayoutProps) => {
  return (
    <main
      {...props}
      id="main-content"
      className={`page-layout-glass-bg page-layout-base ${className}`}
    >
      {children}
    </main>
  );
};

PageLayout.displayName = 'PageLayout';

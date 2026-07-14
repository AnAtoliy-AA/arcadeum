'use client';

import React from 'react';

/**
 * PageLayout is a high-performance Client Component that provides the base 
 * structure and glassmorphism background for all pages.
 * 
 * By using a standard <main> element and static CSS classes instead of a Tamagui 
 * styled component here, we avoid the hydration overhead and attribute mismatches 
 * that occur with the Tamagui 'Main' component during SSR.
 * 
 * This approach restores maximum performance while ensuring perfect hydration stability.
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

'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import { appConfig } from '@/shared/config/app-config';
import { Logo } from './styles';

interface HeaderLayoutProps {
  children: ReactNode;
}

export function HeaderLayout({ children }: HeaderLayoutProps) {
  return (
    <header className="header-outer" role="banner">
      <div className="header-inner" data-testid="header-inner">
        <Logo href="/">
          <Image src="/logo.png" alt="" width={32} height={32} priority />
          <span className="logo-text" data-testid="logo-text">
            {appConfig.appName || 'Arcadeum'}
          </span>
        </Logo>
        {children}
      </div>
      <div className="header-border-line" />
    </header>
  );
}

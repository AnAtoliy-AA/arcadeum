'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import { appConfig } from '@/shared/config/app-config';
import {
  HeaderInner,
  HeaderBorderLine,
  Logo,
  LogoText,
  HeaderOuter,
} from './styles';

interface HeaderLayoutProps {
  children: ReactNode;
}

export function HeaderLayout({ children }: HeaderLayoutProps) {
  return (
    <HeaderOuter>
      <HeaderInner data-testid="header-inner">
        <Logo href="/">
          <Image src="/logo.png" alt="" width={32} height={32} priority />
          <LogoText data-testid="logo-text">{appConfig.appName}</LogoText>
        </Logo>
        {children}
      </HeaderInner>
      <HeaderBorderLine />
    </HeaderOuter>
  );
}

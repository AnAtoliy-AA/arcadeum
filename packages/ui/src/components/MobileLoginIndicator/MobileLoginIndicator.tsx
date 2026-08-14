import React from 'react';
import Link from 'next/link';
import { UserIcon, LoginIcon } from '../Icons/index';

export interface MobileLoginIndicatorProps {
  href: string;
  isAuthenticated: boolean;
  title?: string;
  'data-testid'?: string;
}

export function MobileLoginIndicator({
  href,
  isAuthenticated,
  title,
  'data-testid': testId,
}: MobileLoginIndicatorProps) {
  return (
    <Link
      href={href}
      prefetch={false}
      style={{ textDecoration: 'none' }}
      title={title}
      aria-label={title || (isAuthenticated ? 'User profile' : 'Login')}
      data-testid={testId}
    >
      <span
        className="hidden h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border-[1.5px] transition-opacity hover:opacity-90 md:flex"
        style={
          isAuthenticated
            ? {
                background:
                  'linear-gradient(135deg, var(--primaryGradientStart), var(--primaryGradientEnd))',
                borderColor: 'transparent',
                color: 'var(--white)',
              }
            : {
                backgroundColor: 'var(--glassBg)',
                borderColor: 'var(--glassBorder)',
                color: 'var(--neutral)',
              }
        }
      >
        {isAuthenticated ? <UserIcon size={18} /> : <LoginIcon size={18} />}
      </span>
    </Link>
  );
}

import React from 'react';
import Link from 'next/link';
import { styled, XStack } from 'tamagui';
import { UserIcon, LoginIcon } from '../Icons/index';

const IndicatorCircle = styled(XStack, {
  alignItems: 'center',
  justifyContent: 'center',
  width: 34,
  height: 34,
  borderRadius: 999,
  borderWidth: 1.5,
  cursor: 'pointer',
  display: 'none',
  $md: { display: 'flex' },
  hoverStyle: { opacity: 0.9 },

  variants: {
    isAuthenticated: {
      true: {
        background: 'linear-gradient(135deg, var(--primaryGradientStart), var(--primaryGradientEnd))',
        borderColor: 'transparent',
        color: '$white',
      },
      false: {
        backgroundColor: '$glassBg',
        borderColor: '$glassBorder',
        color: '$neutral',
      },
    },
  } as const,
});

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
      data-testid={testId}
    >
      <IndicatorCircle isAuthenticated={isAuthenticated}>
        {isAuthenticated ? <UserIcon size={18} /> : <LoginIcon size={18} />}
      </IndicatorCircle>
    </Link>
  );
}

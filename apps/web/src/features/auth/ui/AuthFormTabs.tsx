'use client';

import type { CSSProperties } from 'react';
import { XStack, YStack } from 'tamagui';
import { Typography } from '@arcadeum/ui/components/Typography/Typography';

interface AuthFormTabsProps {
  isRegisterMode: boolean;
  signInLabel: string;
  registerLabel: string;
  onSelectSignIn: () => void;
  onSelectRegister: () => void;
}

export function AuthFormTabs({
  isRegisterMode,
  signInLabel,
  registerLabel,
  onSelectSignIn,
  onSelectRegister,
}: AuthFormTabsProps) {
  const indicatorStyle: CSSProperties = {
    position: 'absolute',
    bottom: -1,
    left: 0,
    width: '50%',
    height: 2,
    borderRadius: 2,
    background: 'linear-gradient(90deg, #38bdf8 0%, #a855f7 50%, #ec4899 100%)',
    transform: isRegisterMode ? 'translateX(100%)' : 'translateX(0%)',
    transition: 'transform 250ms ease',
    pointerEvents: 'none',
  };

  return (
    <YStack
      role="tablist"
      aria-label="Authentication mode"
      borderBottomWidth={1}
      borderColor="$glassBorder"
      position="relative"
    >
      <XStack>
        <TabButton
          isActive={!isRegisterMode}
          label={signInLabel}
          onClick={onSelectSignIn}
          testId="auth-tab-signin"
        />
        <TabButton
          isActive={isRegisterMode}
          label={registerLabel}
          onClick={onSelectRegister}
          testId="auth-tab-register"
        />
      </XStack>
      <div style={indicatorStyle} aria-hidden="true" />
    </YStack>
  );
}

function TabButton({
  isActive,
  label,
  onClick,
  testId,
}: {
  isActive: boolean;
  label: string;
  onClick: () => void;
  testId: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      data-testid={testId}
      style={{
        flex: 1,
        paddingTop: 10,
        paddingBottom: 14,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      <Typography
        variant="heading"
        uiSize="md"
        weight="600"
        color={isActive ? '$colorStrong' : '$colorMuted'}
      >
        {label}
      </Typography>
    </button>
  );
}

'use client';

import type { CSSProperties } from 'react';
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
    background:
      'linear-gradient(90deg, var(--accent, #38bdf8) 0%, #ff6af7 100%)',
    transform: isRegisterMode ? 'translateX(100%)' : 'translateX(0%)',
    transition: 'transform 250ms ease',
    pointerEvents: 'none',
  };

  return (
    <div
      className="flex flex-col items-stretch border-b border-[var(--glassBorder)] relative"
      role="tablist"
      aria-label="Authentication mode"
    >
      <div className="flex flex-row items-stretch">
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
      </div>
      <div style={indicatorStyle} aria-hidden="true" />
    </div>
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
        color={isActive ? '$colorStrong' : 'rgba(180,180,200,0.7)'}
      >
        {label}
      </Typography>
    </button>
  );
}

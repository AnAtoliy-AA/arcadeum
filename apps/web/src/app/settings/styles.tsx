import React from 'react';
import { YStack, XStack, Text, styled } from 'tamagui';
import { Button, ButtonProps } from '@arcadeum/ui';

export const settingsStyles = `
  .settings-toggle-input {
    appearance: none;
    width: 3.5rem;
    height: 2rem;
    background: var(--color-backgroundHover, #32353d);
    border-radius: 999px;
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    border: 2px solid var(--color-borderColor, rgba(50, 53, 61, 0.8));
    flex-shrink: 0;
  }

  .settings-toggle-input:checked {
    background: var(--color-primary, #7ad7ff);
    border-color: var(--color-primary, #7ad7ff);
    box-shadow: 0 0 12px var(--color-primary, rgba(122, 215, 255, 0.25));
  }

  .settings-toggle-input::after {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    width: calc(2rem - 12px);
    height: calc(2rem - 12px);
    background: white;
    border-radius: 50%;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .settings-toggle-input:checked::after {
    transform: translateX(1.5rem);
  }

  .settings-toggle-input:focus-visible {
    outline: 2px solid var(--color-borderColorFocus, #7ad7ff);
    outline-offset: 2px;
  }
`;

export const Container = styled(YStack, {
  maxWidth: 900,
  alignSelf: 'center',
  width: '100%',
  flexDirection: 'column',
  gap: '$8',
} as Record<string, unknown>);

export function OptionList({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gap: '1.25rem',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      }}
    >
      {children}
    </div>
  );
}

export const PillGroup = styled(XStack, {
  flexWrap: 'wrap',
  gap: '$4',
} as Record<string, unknown>);

import { Typography } from '@/shared/ui';

export const AccountStatus = styled(Typography, {
  name: 'AccountStatus',
  tag: 'p',
  margin: 0,
  uiSize: 'md',
  color: 'rgba(236,239,238,0.7)',
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$borderColor',
  padding: '$5',
  borderRadius: 12,
  textCenter: true,
  style: {
    backdropFilter: 'blur(12px)',
  },
} as Record<string, unknown>);

export const AccountActions = styled(XStack, {
  flexWrap: 'wrap',
  gap: '$5',
  marginTop: '$3',
} as Record<string, unknown>);

export const ToggleRow = styled(XStack, {
  name: 'ToggleRow',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 24,
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: 12,
  cursor: 'pointer',
  hoverStyle: {
    borderColor: '$primary',
    backgroundColor: '$backgroundHover',
  },
  style: {
    backdropFilter: 'blur(8px)',
    scrollMarginTop: 100,
  },
} as Record<string, unknown>);

export const ToggleLabel = styled(Text, {
  tag: 'span',
  fontSize: '$4',
  fontWeight: '600',
  color: '$color',
  cursor: 'pointer',
} as Record<string, unknown>);

export function ToggleInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return <input type="checkbox" className="settings-toggle-input" {...props} />;
}

export const BlockedUserRow = styled(XStack, {
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$4',
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: 12,
  gap: '$4',
  style: { backdropFilter: 'blur(12px)' },
} as Record<string, unknown>);

export const BlockedUserInfo = styled(YStack, {
  gap: '$2',
  minWidth: 0,
  flex: 1,
} as Record<string, unknown>);

export const UnblockButton = (props: ButtonProps) => (
  <Button
    variant="secondary"
    size="sm"
    borderRadius={12}
    whiteSpace="nowrap"
    hoverStyle={{
      borderColor: '#ef4444',
      color: '#ef4444',
      backgroundColor: '#ef444410',
    }}
    {...props}
  />
);

export const OptionLabel = styled(Text, {
  name: 'OptionLabel',
  tag: 'span',
  fontSize: '$4',
  fontWeight: '600',
  color: '$color',
} as Record<string, unknown>);

export const OptionDescription = styled(Text, {
  name: 'OptionDescription',
  tag: 'p',
  margin: 0,
  fontSize: '$3',
  color: 'rgba(236,239,238,0.7)',
} as Record<string, unknown>);

export const VersionText = styled(Text, {
  tag: 'span',
  fontSize: '$3',
  color: 'rgba(236,239,238,0.7)',
  letterSpacing: '0.05em' as unknown as number,
  opacity: 0.8,
  style: {
    fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
  },
} as Record<string, unknown>);

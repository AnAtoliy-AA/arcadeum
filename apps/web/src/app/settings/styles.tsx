import React from 'react';
import { YStack, XStack, Text, styled } from 'tamagui';
import { Button, ButtonProps } from '@arcadeum/ui';

export const settingsStyles = `
  .settings-toggle-input {
    appearance: none;
    width: 3.5rem;
    height: 2rem;
    background: #32353d;
    border-radius: 999px;
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    border: 2px solid rgba(50, 53, 61, 0.8);
    flex-shrink: 0;
  }

  .settings-toggle-input:checked {
    background: var(--color-accent, #7ad7ff);
    border-color: var(--color-accent, #7ad7ff);
    box-shadow: 0 0 12px var(--color-accent40, rgba(122, 215, 255, 0.25));
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
    outline: 2px solid var(--color-border-focus, #7ad7ff);
    outline-offset: 2px;
  }

  .settings-toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    background: var(--color-background-hover, rgba(50, 53, 61, 0.3));
    border: 1px solid var(--color-border, rgba(50, 53, 61, 0.8));
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(8px);
  }

  .settings-toggle-row:hover {
    border-color: var(--color-border-focus, #7ad7ff);
    background: var(--color-background-hover, rgba(50, 53, 61, 0.5));
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .settings-download-link {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1.25rem 1.75rem;
    border-radius: 12px;
    border: 1px solid var(--color-border, rgba(50, 53, 61, 0.8));
    background: var(--color-background-hover, rgba(50, 53, 61, 0.3));
    color: var(--color, #ecefee);
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    text-decoration: none;
    backdrop-filter: blur(8px);
  }

  .settings-download-link:hover {
    transform: translateY(-2px);
    border-color: var(--color-border-focus, #7ad7ff);
    background: var(--color-background-hover, rgba(50, 53, 61, 0.5));
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  .settings-download-link:active {
    transform: translateY(0);
  }
`;

export const Container = styled(YStack, {
  maxWidth: 900,
  alignSelf: 'center',
  width: '100%',
  flexDirection: 'column',
  gap: '$8',
} as any);

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

export const OptionLabel = styled(Text, {
  tag: 'span',
  fontSize: '$4',
  fontWeight: '600',
  color: '$color',
} as any);

export const OptionDescription = styled(Text, {
  tag: 'span',
  fontSize: '$3',
  color: 'rgba(236,239,238,0.7)',
} as any);

export const PillGroup = styled(XStack, {
  flexWrap: 'wrap',
  gap: '$4',
} as any);

export function DownloadGrid({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
      }}
    >
      {children}
    </div>
  );
}

export function DownloadLink({
  children,
  href,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className="settings-download-link" href={href} {...props}>
      {children}
    </a>
  );
}

export function DownloadIcon({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: '1.25rem' }}>{children}</span>;
}

export const AccountStatus = styled(Text, {
  tag: 'p',
  margin: 0,
  fontSize: '$4',
  color: 'rgba(236,239,238,0.7)',
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$borderColor',
  padding: '$5',
  borderRadius: 12,
  textAlign: 'center',
  style: { backdropFilter: 'blur(12px)' },
} as any);

export const AccountActions = styled(XStack, {
  flexWrap: 'wrap',
  gap: '$5',
  marginTop: '$3',
} as any);

export function ToggleRow({
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className="settings-toggle-row" {...props}>
      {children}
    </label>
  );
}

export const ToggleLabel = styled(Text, {
  tag: 'span',
  fontSize: '$4',
  fontWeight: '600',
  color: '$color',
} as any);

export function ToggleInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
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
} as any);

export const BlockedUserInfo = styled(YStack, {
  gap: '$2',
  minWidth: 0,
  flex: 1,
} as any);

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

export const VersionText = styled(Text, {
  tag: 'span',
  fontSize: '$3',
  color: 'rgba(236,239,238,0.7)',
  letterSpacing: '0.05em' as any,
  opacity: 0.8,
  style: {
    fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
  },
} as any);

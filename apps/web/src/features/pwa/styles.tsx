import type { ReactNode } from 'react';

export const PWAFeaturesList = ({ children }: { children?: ReactNode }) => (
  <ul
    style={{
      padding: 0,
      margin: 0,
      marginTop: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}
  >
    {children}
  </ul>
);

export const PWAFeatureItem = ({ children }: { children?: ReactNode }) => (
  <li style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: 0.7 }}>
    {children}
  </li>
);

export const PWAFeatureIcon = ({ children }: { children?: ReactNode }) => (
  <span style={{ fontSize: 20 }}>{children}</span>
);

export const PWAManualInstructions = ({
  children,
}: {
  children?: ReactNode;
}) => (
  <div
    style={{
      marginTop: 20,
      padding: 16,
      backgroundColor: 'var(--background)',
      borderRadius: 12,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'var(--borderColor)',
    }}
  >
    {children}
  </div>
);

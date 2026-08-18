'use client';

export const PWAFeaturesList = ({
  children,
  ...rest
}: React.HTMLAttributes<HTMLUListElement>) => (
  <ul
    style={{
      padding: 0,
      margin: 0,
      marginTop: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}
    {...rest}
  >
    {children}
  </ul>
);

export const PWAFeatureItem = ({
  children,
  ...rest
}: React.HTMLAttributes<HTMLLIElement>) => (
  <li
    style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: 0.7 }}
    {...rest}
  >
    {children}
  </li>
);

export const PWAFeatureIcon = ({
  children,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span style={{ fontSize: 20 }} {...rest}>
    {children}
  </span>
);

export const PWAManualInstructions = ({
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
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
    {...rest}
  >
    {children}
  </div>
);

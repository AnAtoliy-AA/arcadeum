'use client';

import { Button } from '@arcadeum/ui';

interface OfflineViewProps {
  title: string;
  description: string;
  retryText: string;
  manageHref?: string;
  manageLabel?: string;
}

export function OfflineView({
  title,
  description,
  retryText,
  manageHref,
  manageLabel,
}: OfflineViewProps) {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-6"
      style={{ textAlign: 'center' }}
    >
      <span style={{ fontSize: 80, marginBottom: '1.25rem', opacity: 0.8 }}>
        📡
      </span>
      <h1
        style={{
          fontSize: '2rem',
          fontWeight: 700,
          margin: '0 0 1rem',
          color: 'inherit',
        }}
      >
        {title}
      </h1>
      <p
        style={{
          fontSize: '1.1rem',
          color: 'rgba(236,239,238,0.45)',
          margin: '0 0 2rem',
          maxWidth: 400,
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
      <div className="flex flex-col items-center gap-3">
        <Button onClick={handleRetry} size="lg">
          {retryText}
        </Button>
        {manageHref && manageLabel && (
          <a
            href={manageHref}
            className="text-sm text-[var(--primary)] underline-offset-4 hover:underline"
          >
            {manageLabel}
          </a>
        )}
      </div>
    </div>
  );
}

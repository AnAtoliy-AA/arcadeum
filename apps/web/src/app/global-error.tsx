'use client';

import { ErrorState } from '@/shared/ui';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const cookieStore = typeof document !== 'undefined' ? document.cookie : '';
  const theme = (cookieStore.match(/app-theme=(light|dark)/)?.[1] || 'dark') as
    | 'light'
    | 'dark';

  return (
    <html lang="en" className={`t_${theme}`} data-theme={theme}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} t_${theme}`}
        style={{
          margin: 0,
          backgroundColor: theme === 'dark' ? '#151718' : '#ffffff',
          color: theme === 'dark' ? '#ecefee' : '#151718',
        }}
      >
        <div
          className="main-outer"
          style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <ErrorState
            title="Critical Error"
            message="A critical error occurred preventing the application from loading."
            onRetry={() => reset()}
            retryLabel="Reload Application"
          />
        </div>
      </body>
    </html>
  );
}

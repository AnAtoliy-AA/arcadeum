'use client';

import { ErrorState } from '@/shared/ui';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppThemeProvider } from './theme/ThemeContext';
import { StyledComponentsRegistry } from './StyledComponentsRegistry';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <StyledComponentsRegistry>
          <AppThemeProvider>
            <div
              style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
              }}
            >
              <ErrorState
                title="Critical Error"
                message="A critical error occurred preventing the application from loading."
                onRetry={() => reset()}
                retryLabel="Reload Application"
              />
            </div>
          </AppThemeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}

'use client';

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

  const isDark = theme === 'dark';

  return (
    <html lang="en" className={`t_${theme}`} data-theme={theme}>
      <head>
        <style>{`
          :root {
            --ge-bg: ${isDark ? '#151718' : '#ffffff'};
            --ge-fg: ${isDark ? '#ecefee' : '#151718'};
            --ge-muted: ${isDark ? 'rgba(236,239,238,0.5)' : 'rgba(21,23,24,0.5)'};
            --ge-glass-bg: ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'};
            --ge-glass-border: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
            --ge-accent: ${isDark ? '#38bdf8' : '#2563eb'};
            --ge-icon-bg: ${isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)'};
          }
          .global-error-button:hover {
            opacity: 0.85;
          }
        `}</style>
      </head>
      <body
        className={`t_${theme}`}
        style={{
          margin: 0,
          fontFamily: 'system-ui, sans-serif',
          backgroundColor: 'var(--ge-bg)',
          color: 'var(--ge-fg)',
        }}
      >
        <div
          style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              padding: '2.5rem 3rem',
              maxWidth: '420px',
              textAlign: 'center',
              background: 'var(--ge-glass-bg)',
              border: '1px solid var(--ge-glass-border)',
              borderRadius: '1rem',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <div
              style={{
                width: '3rem',
                height: '3rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '0.75rem',
                background: 'var(--ge-icon-bg)',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: 'var(--ge-fg)',
                  letterSpacing: '-0.01em',
                }}
              >
                Something went wrong
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  color: 'var(--ge-muted)',
                }}
              >
                A critical error prevented the application from loading.
              </p>
            </div>
            <button
              onClick={() => reset()}
              className="global-error-button"
              style={{
                marginTop: '0.25rem',
                padding: '0.625rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#fff',
                backgroundColor: 'var(--ge-accent)',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                letterSpacing: '0.01em',
                transition: 'opacity 0.15s',
              }}
            >
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

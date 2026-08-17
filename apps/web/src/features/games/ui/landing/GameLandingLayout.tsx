import Link from 'next/link';
import { Container, PageLayout } from '@arcadeum/ui';
import type { GameLandingLayoutProps } from './types';

const GLOW_CLASSES: Record<
  NonNullable<GameLandingLayoutProps['accentGlow']>,
  string
> = {
  blue: 'from-blue-500/10 via-indigo-500/5 to-transparent',
  indigo: 'from-indigo-500/10 via-purple-500/5 to-transparent',
  purple: 'from-purple-500/10 via-violet-500/5 to-transparent',
  emerald: 'from-emerald-500/10 via-teal-500/5 to-transparent',
  amber: 'from-amber-500/10 via-yellow-500/5 to-transparent',
  rose: 'from-rose-500/10 via-red-500/5 to-transparent',
  cyan: 'from-cyan-500/10 via-sky-500/5 to-transparent',
  orange: 'from-orange-500/10 via-amber-500/5 to-transparent',
};

export function GameLandingLayout({
  breadcrumbs,
  children,
  accentGlow = 'blue',
}: GameLandingLayoutProps) {
  const glowClass = GLOW_CLASSES[accentGlow] ?? GLOW_CLASSES.blue;

  return (
    <PageLayout>
      <div className="box-border relative w-full overflow-hidden">
        <div
          className={`box-border pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-radial bg-gradient-to-b ${glowClass} blur-3xl opacity-60`}
          aria-hidden="true"
        />

        <Container size="lg">
          <div className="box-border relative flex flex-col gap-6 py-6 sm:py-8">
            {breadcrumbs && breadcrumbs.length > 0 ? (
              <nav
                aria-label="Breadcrumb"
                className="box-border flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[var(--foreground)] opacity-70"
              >
                <ol className="box-border m-0 p-0 list-none flex flex-wrap items-center gap-2">
                  {breadcrumbs.map((crumb, idx) => {
                    const isLast = idx === breadcrumbs.length - 1;
                    return (
                      <li
                        key={crumb.label}
                        className="box-border inline-flex items-center gap-2"
                      >
                        {crumb.href && !isLast ? (
                          <Link
                            href={crumb.href}
                            className="box-border hover:text-[var(--primary)] hover:underline transition-colors"
                          >
                            {crumb.label}
                          </Link>
                        ) : (
                          <span
                            className={
                              isLast
                                ? 'font-semibold text-[var(--foreground)] opacity-100'
                                : ''
                            }
                            aria-current={isLast ? 'page' : undefined}
                          >
                            {crumb.label}
                          </span>
                        )}
                        {!isLast ? (
                          <span aria-hidden="true" className="opacity-40">
                            /
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ol>
              </nav>
            ) : null}

            {children}
          </div>
        </Container>
      </div>
    </PageLayout>
  );
}

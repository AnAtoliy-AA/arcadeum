'use client';

import Link from 'next/link';
import {
  PageLayout,
  Container,
  GlassCard,
  PageTitle,
  Typography,
  Section,
  Button,
} from '@arcadeum/ui';
import { useLanguage } from '@/shared/i18n/context';
import { useRoutes } from '@/shared/config/useRoutes';
import type { developersEn } from '@/shared/i18n/messages/pages/developers/en';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends readonly (infer U)[]
      ? readonly DeepPartial<U>[]
      : T[P] extends object
        ? DeepPartial<T[P]>
        : T[P];
};

export type DevelopersMessages = DeepPartial<typeof developersEn>;

export interface DevelopersPageContentProps {
  t?: DevelopersMessages;
}

export default function DevelopersPageContent({
  t: initialT,
}: DevelopersPageContentProps) {
  const { messages } = useLanguage();
  const routes = useRoutes();

  const dev = messages.pages?.developers ?? initialT;
  const stats = dev?.stats;
  const features = dev?.features ?? [];
  const specs = dev?.specs;
  const cta = dev?.cta;

  return (
    <PageLayout>
      <Container size="xl">
        <div className="flex flex-col gap-10 py-6">
          <div className="relative overflow-hidden rounded-3xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-8 backdrop-blur-xl md:p-12">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[var(--primary)] opacity-15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[var(--success)] opacity-10 blur-3xl" />

            <div className="relative z-10 flex flex-col items-start gap-4 md:max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--glassBorder)] bg-[var(--glassBg)] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                ⚡ {dev?.subtitle ?? 'APIs & WebSocket Gateways'}
              </span>
              <PageTitle size="xl" gradient>
                {dev?.title ?? 'Arcadeum Developer Platform'}
              </PageTitle>
              <Typography variant="body" uiSize="lg" alpha="high">
                {dev?.description ??
                  'Build custom bots, integrate tournament systems, and synchronize game state in real time with our open APIs.'}
              </Typography>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <GlassCard className="flex flex-col gap-1 p-5 text-center">
              <span className="text-2xl font-black text-[var(--primary)]">
                {stats?.latency ?? '< 50ms'}
              </span>
              <span className="text-xs font-semibold text-[var(--colorMuted)]">
                {stats?.latencyLabel ?? 'WebSocket Latency'}
              </span>
            </GlassCard>

            <GlassCard className="flex flex-col gap-1 p-5 text-center">
              <span className="text-2xl font-black text-[var(--gold)]">
                {stats?.rateLimit ?? '120 req/min'}
              </span>
              <span className="text-xs font-semibold text-[var(--colorMuted)]">
                {stats?.rateLimitLabel ?? 'Free Tier API'}
              </span>
            </GlassCard>

            <GlassCard className="flex flex-col gap-1 p-5 text-center">
              <span className="text-2xl font-black text-[var(--success)]">
                {stats?.uptime ?? '99.99%'}
              </span>
              <span className="text-xs font-semibold text-[var(--colorMuted)]">
                {stats?.uptimeLabel ?? 'Uptime'}
              </span>
            </GlassCard>

            <GlassCard className="flex flex-col gap-1 p-5 text-center">
              <span className="text-2xl font-black text-[var(--color)]">
                {stats?.sdk ?? 'REST & WS'}
              </span>
              <span className="text-xs font-semibold text-[var(--colorMuted)]">
                {stats?.sdkLabel ?? 'API Gateways'}
              </span>
            </GlassCard>
          </div>

          <Section>
            <div className="flex flex-col gap-6">
              <Typography variant="heading" uiSize="xl" weight="800">
                Platform Architecture & Capabilities
              </Typography>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feat, idx) => (
                  <GlassCard
                    key={idx}
                    className="flex flex-col justify-between gap-4 p-6 transition-all duration-200 hover:-translate-y-1"
                  >
                    <div className="flex flex-col gap-3">
                      <span className="text-3xl">{feat?.icon}</span>
                      <Typography variant="heading" uiSize="md" weight="700">
                        {feat?.title}
                      </Typography>
                      <Typography variant="body" uiSize="sm" alpha="medium">
                        {feat?.description}
                      </Typography>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          </Section>

          {specs && (
            <Section>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <Typography variant="heading" uiSize="xl" weight="800">
                    {specs.title ?? 'Endpoints & Specifications'}
                  </Typography>
                  <Typography variant="body" uiSize="sm" alpha="medium">
                    {specs.subtitle ??
                      'Standards-compliant REST & WebSocket endpoints'}
                  </Typography>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <GlassCard className="flex flex-col gap-2 p-5">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--colorMuted)]">
                      REST API Gateway
                    </span>
                    <span className="font-mono text-sm font-bold text-[var(--primary)]">
                      {specs.restBase}
                    </span>
                    <span className="text-xs text-[var(--colorMuted)]">
                      HTTP/2 with JSON payloads & rate limits
                    </span>
                  </GlassCard>

                  <GlassCard className="flex flex-col gap-2 p-5">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--colorMuted)]">
                      WebSocket Gateway
                    </span>
                    <span className="font-mono text-sm font-bold text-[var(--success)]">
                      {specs.wsEndpoint}
                    </span>
                    <span className="text-xs text-[var(--colorMuted)]">
                      Socket.IO v4 with binary state compression
                    </span>
                  </GlassCard>

                  <GlassCard className="flex flex-col gap-2 p-5">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--colorMuted)]">
                      Sandbox Environment
                    </span>
                    <span className="font-mono text-sm font-bold text-[var(--gold)]">
                      {specs.sandboxBase}
                    </span>
                    <span className="text-xs text-[var(--colorMuted)]">
                      Mock users & test tokens enabled
                    </span>
                  </GlassCard>
                </div>
              </div>
            </Section>
          )}

          <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-8 text-center backdrop-blur-xl md:flex-row md:p-10 md:text-left">
            <div className="flex max-w-xl flex-col gap-2">
              <Typography variant="heading" uiSize="lg" weight="800">
                {cta?.title ?? 'Start Building on Arcadeum'}
              </Typography>
              <Typography variant="body" uiSize="sm" alpha="medium">
                {cta?.description ??
                  'Explore our open-source tools or join fellow developers in our Discord channel.'}
              </Typography>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="https://github.com/AnAtoliy-AA/arcadeum"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" size="md">
                  📦 {cta?.githubBtn ?? 'GitHub'}
                </Button>
              </a>
              <Link href={routes.community}>
                <Button variant="primary" size="md">
                  💬 {cta?.discordBtn ?? 'Discord'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </PageLayout>
  );
}

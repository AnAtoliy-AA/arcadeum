'use client';

import { useState } from 'react';
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
import { cx } from '@arcadeum/ui/utils/cx';
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

const CODE_SNIPPETS: Record<string, string> = {
  typescript: `import { ArcadeumClient } from '@arcadeum/sdk';

const client = new ArcadeumClient({
  apiKey: process.env.ARCADEUM_API_KEY,
});

// Join a live chess room and listen for state transitions
const room = await client.rooms.join('room_9a8f7c');

room.on('gameState', (state) => {
  console.log('Turn:', state.activePlayer, 'FEN:', state.fen);
});

// Dispatch authoritative player action
await room.sendAction({ type: 'MOVE', from: 'e2', to: 'e4' });`,

  python: `from arcadeum import ArcadeumBot, GameVariant

bot = ArcadeumBot(token="bot_sec_918237")

@bot.on_game_start
def handle_start(room_id, variant):
    print(f"Match started in {room_id} with {variant}")

@bot.on_turn
def make_decision(game_state):
    best_move = bot.minimax(game_state, depth=4)
    return bot.play_action(best_move)

bot.run_forever()`,

  curl: `# Fetch active live game rooms
curl -X GET "https://api.arcadeum.net/v1/rooms" \\
  -H "Authorization: Bearer <YOUR_API_KEY>" \\
  -H "Content-Type: application/json"

# Create a private game room
curl -X POST "https://api.arcadeum.net/v1/rooms" \\
  -H "Authorization: Bearer <YOUR_API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{"game": "chess_v1", "isPrivate": true, "timerSeconds": 300}'`,

  websocket: `// Socket.IO raw event integration
const socket = io('wss://socket.arcadeum.net', {
  auth: { token: 'jwt_player_token' },
  transports: ['websocket'],
});

socket.on('connect', () => {
  socket.emit('room:subscribe', { roomId: 'room_123' });
});

socket.on('game:action', (payload) => {
  console.log('Action received:', payload);
});`,
};

export default function DevelopersPageContent({
  t: initialT,
}: DevelopersPageContentProps) {
  const { messages } = useLanguage();
  const routes = useRoutes();
  const [activeTab, setActiveTab] = useState<
    'typescript' | 'python' | 'curl' | 'websocket'
  >('typescript');
  const [copied, setCopied] = useState(false);

  const dev = messages.pages?.developers ?? initialT;
  const stats = dev?.stats;
  const sdkHero = dev?.sdkHero;
  const features = dev?.features ?? [];
  const specs = dev?.specs;
  const cta = dev?.cta;

  const copySnippet = () => {
    const text = CODE_SNIPPETS[activeTab];
    if (text && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <PageLayout>
      <Container size="xl">
        <div className="flex flex-col gap-10 py-6">
          <div className="relative overflow-hidden rounded-3xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-8 backdrop-blur-xl md:p-12">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[var(--primary)] opacity-15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[var(--success)] opacity-10 blur-3xl" />

            <div className="relative z-10 flex flex-col items-start gap-4 md:max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--glassBorder)] bg-[var(--glassBg)] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                ⚡ {dev?.subtitle ?? 'SDKs, APIs & WebSocket Gateways'}
              </span>
              <PageTitle size="xl" gradient>
                {dev?.title ?? 'Arcadeum Developer Platform'}
              </PageTitle>
              <Typography variant="body" uiSize="lg" alpha="high">
                {dev?.description ??
                  'Build custom bots, integrate tournament systems, and synchronize game state in real time with our open-source toolkits.'}
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
                {stats?.sdk ?? 'v1.4'}
              </span>
              <span className="text-xs font-semibold text-[var(--colorMuted)]">
                {stats?.sdkLabel ?? 'SDK Release'}
              </span>
            </GlassCard>
          </div>

          <Section>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Typography variant="heading" uiSize="xl" weight="800">
                  {sdkHero?.title ?? 'Code in Your Language of Choice'}
                </Typography>
                <Typography variant="body" uiSize="md" alpha="medium">
                  {sdkHero?.subtitle ??
                    'Connect to game rooms in less than 10 lines of code.'}
                </Typography>
              </div>

              <div className="overflow-hidden rounded-2xl border border-[var(--glassBorder)] bg-[#0d1117] shadow-2xl">
                <div className="flex flex-wrap items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex items-center gap-2">
                    {(
                      ['typescript', 'python', 'curl', 'websocket'] as const
                    ).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={cx(
                          'cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all',
                          activeTab === tab
                            ? 'bg-[var(--primary)] text-white shadow-sm'
                            : 'text-[var(--colorMuted)] hover:text-white',
                        )}
                      >
                        {tab === 'typescript'
                          ? (sdkHero?.tabs?.typescript ?? 'TypeScript')
                          : tab === 'python'
                            ? (sdkHero?.tabs?.python ?? 'Python')
                            : tab === 'curl'
                              ? (sdkHero?.tabs?.curl ?? 'cURL / REST')
                              : (sdkHero?.tabs?.websocket ?? 'WebSocket')}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={copySnippet}
                    className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[var(--colorMuted)] transition-all hover:border-[var(--primary)] hover:text-white"
                  >
                    {copied
                      ? (sdkHero?.copied ?? '✓ Copied')
                      : (sdkHero?.copyCode ?? 'Copy Code')}
                  </button>
                </div>

                <div className="overflow-x-auto p-6 font-mono text-sm leading-relaxed text-gray-200">
                  <pre>{CODE_SNIPPETS[activeTab]}</pre>
                </div>
              </div>
            </div>
          </Section>

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

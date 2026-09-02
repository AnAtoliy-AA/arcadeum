FROM node:22-alpine3.20 AS base

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY scripts/ scripts/
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
RUN corepack enable && --mount=type=cache,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile --ignore-scripts

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY . .
RUN corepack enable && pnpm --filter @arcadeum/games-core build && pnpm --filter web build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_OPTIONS="--max-old-space-size=1024"

CMD ["node", "apps/web/server.js"]

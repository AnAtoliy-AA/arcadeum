FROM node:24-alpine AS builder

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY scripts/ scripts/
COPY apps/be/package.json apps/be/
COPY packages/games-core/ packages/games-core/

RUN --mount=type=cache,target=/root/.local/share/pnpm/store corepack enable && pnpm install --frozen-lockfile

COPY apps/be/ apps/be/

RUN pnpm --filter @arcadeum/games-core build && pnpm --filter be build
# Pruned, self-contained production tree: only the BE's runtime dependencies
# (incl. the workspace games-core package) — no devDeps, no other workspaces.
RUN corepack enable && pnpm --filter be deploy --prod --out /out

FROM node:24-alpine AS runner

WORKDIR /app

RUN apk add --no-cache dumb-init=1.2.5-r3 curl

# Stockfish 19 (latest stable, released 2026-09-05)
# Download Linux x86-64 universal binary during build
RUN curl -L -o /tmp/sf19.tar.gz \
      "https://github.com/official-stockfish/Stockfish/releases/download/sf_19/stockfish-linux-x86-64-universal.tar.gz" \
    && tar -xzf /tmp/sf19.tar.gz -C /tmp/ \
    && find /tmp -name "stockfish" -type f -executable -exec cp {} /usr/local/bin/stockfish \; \
    && chmod +x /usr/local/bin/stockfish \
    && rm -rf /tmp/sf19.tar.gz /tmp/stockfish \
    && stockfish <<< "uci" 2>/dev/null | head -1

ENV NODE_ENV=production
ENV NODE_OPTIONS="--dns-result-order=ipv4first --max-old-space-size=1536"

COPY --from=builder /out ./

EXPOSE 4000

USER node

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/src/main"]

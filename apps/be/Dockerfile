FROM node:24-alpine AS builder

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY scripts/ scripts/
COPY apps/be/package.json apps/be/
COPY packages/ packages/

RUN corepack enable && pnpm install --frozen-lockfile

COPY apps/be/ apps/be/

RUN pnpm --filter @arcadeum/games-core build && pnpm --filter be build
# Pruned, self-contained production tree: only the BE's runtime dependencies
# (incl. the workspace games-core package) — no devDeps, no other workspaces.
RUN corepack enable && pnpm --filter be deploy --prod --out /out

FROM node:24-alpine AS runner

WORKDIR /app

RUN apk add --no-cache dumb-init

ENV NODE_ENV=production

COPY --from=builder /out ./

EXPOSE 4000

USER node

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "--max-old-space-size=1536", "dist/src/main"]

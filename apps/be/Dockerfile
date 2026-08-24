FROM node:24-alpine AS builder

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY scripts/ scripts/
COPY apps/be/package.json apps/be/

RUN corepack enable && pnpm install --frozen-lockfile

COPY apps/be/ apps/be/
COPY packages/ packages/

RUN pnpm --filter @arcadeum/games-core build && pnpm --filter be build

FROM node:24-alpine AS runner

WORKDIR /app

RUN apk add --no-cache dumb-init

ENV NODE_ENV=production

COPY --from=builder /app/apps/be/dist ./dist
COPY --from=builder /app/apps/be/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/be/node_modules ./be-node_modules

EXPOSE 4000

USER node

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "--max-old-space-size=768", "dist/src/main"]

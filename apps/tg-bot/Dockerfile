FROM node:22-alpine AS builder

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/tg-bot/package.json apps/tg-bot/

RUN corepack enable && pnpm install --frozen-lockfile

COPY apps/tg-bot/ apps/tg-bot/
COPY packages/ packages/

RUN pnpm --filter tg-bot build

FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache dumb-init

ENV NODE_ENV=production

COPY --from=builder /app/apps/tg-bot/dist ./dist
COPY --from=builder /app/apps/tg-bot/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/tg-bot/node_modules ./tg-bot-node_modules

EXPOSE 4001

USER node

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/src/main"]

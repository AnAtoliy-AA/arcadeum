# OCI Migration Plan — Next.js Web App

## Current Setup

| Component          | Host                       | Latency     |
| ------------------ | -------------------------- | ----------- |
| Web (Next.js)      | Vercel                     | ~900ms TTFB |
| Backend (NestJS)   | OCI Primary (152.70.47.29) | ~43ms       |
| Database (MongoDB) | OCI Primary                | ~1ms        |

**Problem**: Every SSR render makes 1-5 sequential fetch calls from Vercel → OCI, adding 200-500ms cross-region latency per call.

## Target Setup

| Component          | Host                       | Expected Latency |
| ------------------ | -------------------------- | ---------------- |
| Web (Next.js)      | OCI Primary (152.70.47.29) | ~100-200ms TTFB  |
| Backend (NestJS)   | OCI Primary (same machine) | ~5ms             |
| Database (MongoDB) | OCI Primary (same machine) | ~1ms             |

**Subdomain**: `fast.arcadeum.games` (keeps Vercel as fallback on apex)

## Resource Requirements

| Resource  | Primary (current) | Next.js needs      | Available        |
| --------- | ----------------- | ------------------ | ---------------- |
| CPU       | 3 ARM cores       | 1-2 cores for SSR  | ✅ 2+ free       |
| RAM       | 19 GB             | ~500MB for Next.js | ✅ 18GB free     |
| Disk      | 20 GB free        | ~1GB               | ✅               |
| Bandwidth | Low               | ~10-50GB/month     | ✅ OCI free tier |

**Verdict**: Primary instance has plenty of room. No upgrade needed.

## Implementation Steps

### 1. Create Dockerfile for Next.js

```dockerfile
# apps/web/Dockerfile
FROM node:24-alpine AS builder
WORKDIR /app
COPY . .
RUN corepack enable && pnpm install --frozen-lockfile && pnpm build

FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./.next/static
COPY --from=builder /app/apps/web/public ./public
EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production
CMD ["node", "server.js"]
```

### 2. Update next.config.ts for standalone output

```ts
// apps/web/next.config.ts
const nextConfig = {
  output: 'standalone',
  // ... existing config
};
```

### 3. Nginx Config for arcadeum.games

```nginx
# /etc/nginx/sites-available/arcadeum.games
server {
    listen 443 ssl;
    server_name arcadeum.games www.arcadeum.games;

    ssl_certificate /etc/letsencrypt/live/arcadeum.games/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/arcadeum.games/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name arcadeum.games www.arcadeum.games;
    return 301 https://$server_name$request_uri;
}
```

### 4. Deploy Script

```bash
#!/bin/bash
# scripts/deploy-web-oci.sh
set -e

echo "🚀 Deploying Next.js to OCI..."

cd /opt/arcadeum
git pull origin main

echo "📦 Building Next.js..."
docker build -f apps/web/Dockerfile -t arcadeum-web .

echo "🔄 Restarting PM2..."
pm2 restart arcadeum-web || pm2 start ecosystem.config.js --only arcadeum-web

echo "✅ Web deployed successfully!"
```

### 5. PM2 Ecosystem Config

```js
// ecosystem.config.js (add to existing)
module.exports = {
  apps: [
    // ... existing apps (arcadeum-be, etc.)
    {
      name: 'arcadeum-web',
      script: 'apps/web/.next/standalone/server.js',
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
      },
      max_memory_restart: '500M',
    },
  ],
};
```

### 6. DNS Update

| Record                | Type  | Value          | TTL |
| --------------------- | ----- | -------------- | --- |
| `fast.arcadeum.games` | A     | 152.70.47.29   | 300 |
| `arcadeum.games`      | CNAME | vercel.app     | 300 |
| `www.arcadeum.games`  | CNAME | arcadeum.games | 300 |

Keep `api.arcadeum.games` → 152.70.47.29 (unchanged).

### 7. CI/CD Workflow

```yaml
# .github/workflows/deploy-web-oci.yml
name: Deploy Web to OCI

on:
  push:
    branches: [main]
    paths:
      - 'apps/web/**'
      - 'packages/ui/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to OCI
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.OCI_SSH_HOST }}
          username: ${{ secrets.OCI_SSH_USER }}
          key: ${{ secrets.OCI_SSH_PRIVATE_KEY }}
          script: |
            cd /opt/arcadeum
            git pull origin main
            docker build -f apps/web/Dockerfile -t arcadeum-web .
            pm2 restart arcadeum-web
```

### 8. SSL Certificate

```bash
# On OCI primary — fast.arcadeum.games
sudo certbot --nginx -d fast.arcadeum.games
```

## Static Assets Strategy

Since OCI is single-region, static assets (images, fonts, JS bundles) will be slower for distant users. Options:

1. **Cloudflare proxy** (recommended) — free CDN in front of OCI
2. **OCI CDN** — if available on your plan
3. **Accept it** — most users are likely in similar regions

## Rollback Plan

1. Revert DNS to Vercel
2. Keep OCI deployment as backup
3. Monitor for 24-48 hours before removing Vercel

## Expected Performance

| Metric           | Vercel (current) | OCI (proposed) | Improvement |
| ---------------- | ---------------- | -------------- | ----------- |
| TTFB             | ~900ms           | ~100-200ms     | **70-80%**  |
| SSR latency      | 200-500ms        | ~5ms           | **99%**     |
| Cold start       | 250ms-2s         | ~0ms (PM2)     | **100%**    |
| API calls (shop) | 5 sequential     | 5 parallel     | **80%**     |

## Horizontal Scaling

The Docker Compose setup now includes:

1. **Redis** — Shared state for rate limiting, caching, WebSocket broadcasts, and matchmaking queues
2. **Nginx** — Reverse proxy/load balancer across multiple BE instances
3. **Multiple BE instances** — 2+ backend containers behind nginx with `ip_hash` for sticky WebSocket sessions

### RPS Capacity (After Scaling)

| Metric               | Before               | After                                      |
| -------------------- | -------------------- | ------------------------------------------ |
| BE instances         | 1 (3 PM2 workers)    | 2+ containers (each with 3 PM2 workers)    |
| Rate limiting        | In-memory per worker | Redis-backed (shared across all instances) |
| WebSocket broadcasts | Single instance only | Cross-instance via Redis adapter           |
| Load balancing       | None                 | Nginx with ip_hash for sticky sessions     |
| Estimated RPS        | ~200-500             | ~1000-2000+                                |

### Scaling Commands

```bash
# Scale to 3 BE instances
docker compose up -d --scale be=3

# Scale to 4 BE instances
docker compose up -d --scale be=4

# Check running instances
docker compose ps
```

### Adding External Instances

To add BE instances on other machines:

1. Deploy the BE container on the new machine
2. Set `REDIS_URL` to point to the primary Redis instance
3. Add the new instance to `nginx.conf` upstream block:
   ```nginx
   upstream arcadeum_backend {
       ip_hash;
       server be:4000;
       server be-2:4000;
       server 152.70.47.29:4000;  # New instance
       keepalive 64;
   }
   ```
4. Reload nginx: `docker exec arcadeum-nginx nginx -s reload`

## Timeline

- [ ] Update next.config.ts (standalone output)
- [ ] Create Dockerfile
- [ ] Test locally with Docker
- [ ] Deploy to OCI
- [ ] Configure nginx for `fast.arcadeum.games`
- [ ] Add DNS A record: `fast.arcadeum.games` → 152.70.47.29
- [ ] Verify SSL on `fast.arcadeum.games`
- [ ] CI/CD auto-deploy from main ✅ (updated deploy-oci.yml)
- [ ] Disable Vercel auto-deploy ✅ (deploy-web.yml now manual only)
- [ ] Monitor for 24h
- [ ] Remove Vercel (optional)

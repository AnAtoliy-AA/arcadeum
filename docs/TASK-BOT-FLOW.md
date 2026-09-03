# Task Bot — Auto-Implementation Flow

## Overview

A NestJS-based autonomous coding bot that runs on OCI. Users send tasks via Telegram → bot creates GitHub issues → Redis queues dispatch to workers → workers implement with mimo/opencode → open PRs → auto-fix CI → notify via Telegram.

```
Telegram User
    │
    ├─ /task Chess Engine
    ├─ /implement #981
    ├─ /tasks
    └─ /status #981
    │
    ▼
Task Bot (NestJS, port 4002)  ──── OCI: /opt/arcadeum
    │
    ├─ Parses task, auto-assigns ARC number
    ├─ Creates GitHub issue (label: task, automated)
    ├─ Queues job to Redis Bull queue
    │
    ▼
Worker Process (concurrency: 3)
    │
    ├─ 1. Pops job from Redis queue
    ├─ 2. gh issue view → parse requirements
    ├─ 3. git checkout -b task-{N}-{slug} origin/develop
    ├─ 4. mimo run / opencode run "Implement issue #N ..."
    ├─ 5. git commit + push
    ├─ 6. gh pr create --base develop
    ├─ 7. Queue review job
    ├─ 8. Start CI polling (background, 30s interval, 15min timeout)
    │
    ▼
Review Worker
    │
    ├─ mimo run "Review PR #N ..."
    └─ Posts review comment via gh pr review
    │
    ▼
CI Pipeline (GitHub Actions)
    │
    ├─ ci.yml runs lint/typecheck/test
    ├─ If failed → auto-fix-ci.yml
    │   └─ POST to task bot /ci/fix endpoint
    │       ├─ Check max attempts (default 3, Redis-tracked)
    │       ├─ If under limit → queue fix job
    │       └─ If over limit → notify "manual intervention needed"
    ├─ CI Poller detects all checks passed → notify "CI Green ✅"
    │
    ▼
Notifications (Redis pub/sub → Telegram)
    │
    ├─ "PR Opened 🔗 ..."
    ├─ "CI Failed ❌ Auto-fixing... (attempt 1/3)"
    ├─ "CI Fixed ✅" / "CI Passed ✅"
    └─ "Task Completed ✅"
```

## Architecture

```
bots/task-bot/
├── src/
│   ├── main.ts                    # NestJS bootstrap (port 4002)
│   ├── worker.ts                  # Worker process bootstrap
│   ├── app.module.ts              # Root module
│   ├── task-bot/
│   │   ├── task-bot.service.ts    # Telegram command handlers
│   │   └── task-bot.module.ts
│   ├── telegram/
│   │   ├── telegram.service.ts    # grammY bot instance
│   │   └── telegram.module.ts
│   ├── github/
│   │   ├── github.service.ts      # gh CLI wrapper (issues, PRs, branches)
│   │   └── github.module.ts
│   ├── queue/
│   │   ├── implement-queue.service.ts  # Bull queue: implementation
│   │   ├── review-queue.service.ts     # Bull queue: review
│   │   └── queue.module.ts
│   ├── worker/
│   │   ├── implement.processor.ts  # Runs mimo/opencode to implement
│   │   ├── review.processor.ts     # Runs mimo/opencode to review
│   │   └── worker.module.ts
│   ├── ci/
│   │   ├── ci.controller.ts        # POST /ci/fix webhook
│   │   └── ci.module.ts
│   ├── roadmap/
│   │   ├── roadmap.service.ts      # ARC number management
│   │   └── roadmap.module.ts
│   ├── preferences/
│   │   ├── preferences.service.ts  # Per-user engine/scope prefs
│   │   └── preferences.module.ts
│   └── notification/
│       ├── notification.service.ts # Redis pub/sub notifications
│       └── notification.module.ts
├── package.json
└── tsconfig.json
```

## Telegram Commands

| Command                            | Description                                          |
| ---------------------------------- | ---------------------------------------------------- |
| `/task <title>`                    | Create a task (auto-assigns ARC, auto-detects scope) |
| `/task high <title>`               | Create a high-priority task                          |
| `/task <title> --engine=mimo`      | Specify AI engine                                    |
| `/task <title> --req "req1, req2"` | Add requirements                                     |
| `/implement #123`                  | Trigger implementation of existing issue             |
| `/implement #123 --engine=mimo`    | Implement with specific engine                       |
| `/tasks`                           | List open tasks with status                          |
| `/status #123`                     | Check issue + PR + CI status                         |
| `/queue`                           | View worker queue stats                              |
| `/prefs mimo`                      | Set default engine                                   |
| `/prefs scope: backend, web`       | Set default scope                                    |

## Task Parsing

Tasks are parsed from Telegram messages with flexible format:

```
# Simple
Chess Engine

# With flags
high Add emotes to games --engine=mimo --req "emote picker, animated bubbles"

# With explicit ARC
ARC-877: implement checkers game
- 8x8 board
- forced captures
- king promotion
```

**Scope detection** uses keyword matching:

- `backend`: api, server, database, auth, endpoint, service, gateway, socket
- `web`: page, ui, component, button, form, modal, dashboard, layout
- `mobile`: app, screen, ios, android, expo, react native
- `game`: game, engine, bot, ai, match, session, turn

**ARC assignment**: `RoadmapService.matchRoadmapItem()` matches title against `docs/ROADMAP.md` entries (50% word overlap threshold). Falls back to next available number starting from ARC-871.

## Implementation Pipeline

### 1. Issue Creation (`GitHubService.createIssue`)

- Formats title as `ARC-XXX: {title}`
- Builds structured body with: ARC ticket, priority, engine, requirements, scope, acceptance criteria
- Labels: `task`, `automated`, optionally `priority`
- Deduplicates by title matching

### 2. Queue Job (`ImplementQueueService`)

- Bull queue with 2 retry attempts, exponential backoff
- Job data: `{ issueNum, engine, chatId, userId }`
- `WORKER_CONCURRENCY` env var is read and logged but does not configure Bull concurrency (defaults to 1 per worker instance)

### 3. Implementation (`ImplementProcessor` → `GitHubService.implementLocally`)

```
git fetch origin
git checkout -b task-{N}-{slug} origin/develop

# Run AI engine
mimo run "Implement GitHub issue #N: {title}
  Requirements: ...
  Follow CLAUDE.md conventions.
  Run pnpm lint and pnpm typecheck.
  Commit with conventional commits."

git add -A
git commit -m "feat({scope}): {description}"
git push origin {branch}

gh pr create --title "{title}" --body "Closes #{N}" --base develop
gh issue comment {N} --body "Implementation complete ({engine}). PR: {url}"
```

### 4. Auto-Review (`ReviewProcessor`)

After PR creation, automatically queues a review job:

```
mimo run "Review GitHub PR #N for issue #M.
  Check: code quality, security, performance, types, i18n.
  Post review as GitHub PR review comment."
```

### 5. CI Auto-Fix (`CIController` at `POST /ci/fix`)

Triggered by `auto-fix-ci.yml` when CI fails on bot PRs:

```
1. Receive webhook: { prNumber, branchName, failedChecks }
2. gh pr checks → identify failures
3. opencode run "Fix CI failures for PR #N" (hardcoded, not mimo)
4. git commit + push
5. CI re-runs automatically
```

## OCI Deployment

### Server

```
Host: YOUR_SERVER_IP
SSH: ssh -i ~/.ssh/oci_arcadeum ubuntu@YOUR_SERVER_IP
Dir: /opt/arcadeum
```

### Services (pm2)

```bash
pm2 list
# arcadeum-be        — NestJS backend (port 4000)
# arcadeum-tg-bot    — Telegram bot (port 4001)
# task-bot           — Task bot API (port 4002) — Telegram commands, CI webhooks
# task-worker        — Bull queue workers — mimo/opencode implementations, reviews
```

### Environment Variables (`/opt/arcadeum/bots/task-bot/.env`)

```bash
# Telegram
TELEGRAM_BOT_TOKEN=...
TELEGRAM_ALLOWED_USERS=...
TELEGRAM_CHAT_ID=...

# GitHub
GITHUB_TOKEN=ghp_...
REPO_PATH=/opt/arcadeum

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Task Bot
TASK_BOT_PORT=4002
WORKER_CONCURRENCY=3
CI_WEBHOOK_SECRET=...
CI_FIX_MAX_ATTEMPTS=3

# AI Engines
MIMO_API_KEY=...
OPENCODE_API_KEY=...
```

### Deploy Script

```bash
# scripts/deploy-tg-bot.sh
cd /opt/arcadeum
git fetch origin main
git reset --hard origin/main
pnpm install --frozen-lockfile
pnpm --filter be build
pnpm --filter tg-bot build
cd bots/task-bot && pnpm build && cd /opt/arcadeum
pm2 restart arcadeum-be arcadeum-tg-bot task-bot task-worker
```

## GitHub Workflows

### `implement-task.yml` (Manual Trigger)

Alternative to OCI workers — runs on GitHub Actions:

```bash
gh workflow run implement-task.yml -f issue_number=981 -f engine=mimo
```

### `auto-fix-ci.yml` (Auto-trigger)

When CI fails on any PR:

1. Finds the PR for the failed branch
2. POSTs to task bot `/ci/fix` endpoint
3. Task bot auto-fixes and pushes

### `close-issue-on-merge.yml`

When PR merges → auto-closes linked issue.

## Labels

| Label             | Added by            | Meaning                                              |
| ----------------- | ------------------- | ---------------------------------------------------- |
| `task, automated` | Task bot (TG)       | Created by TG bot, eligible for implementation       |
| `in-progress`     | GitHub Actions only | Currently being implemented (not used by OCI worker) |
| `in-review`       | Task bot worker     | PR created, ready for review                         |
| `priority`        | Task bot (TG)       | High/urgent priority                                 |
| `ARC-XXX`         | Task bot (TG)       | Links to roadmap ticket                              |

## CI Fix Max Attempts

The CI auto-fix loop is bounded by `CI_FIX_MAX_ATTEMPTS` (default: 3). Tracked per PR in Redis with 1-hour TTL.

- Each CI failure webhook increments the counter
- When max reached, the bot stops auto-fixing and notifies "manual intervention needed"
- Counter resets when CI passes (via `/ci/reset` endpoint or Redis TTL)
- Configurable via `CI_FIX_MAX_ATTEMPTS` env var

## CI Polling

After PR creation, the worker starts a background CI poller:

- Checks `gh pr checks` every 30 seconds
- Notifies "CI Passed ✅" when all checks pass
- Stops polling on failure (webhook handles auto-fix) or after 15 minutes timeout
- Non-blocking — doesn't hold the worker process

## Monitoring

### Telegram

- `/tasks` — list all open tasks with status indicators
- `/status #N` — detailed issue + PR + CI status
- `/queue` — worker queue stats (waiting/active/completed/failed)
- Notifications pushed automatically on: PR opened, CI failed/fixed, task completed/failed

### Logs (OCI)

```bash
ssh oci_arcadeum@YOUR_SERVER_IP

# Task bot logs
pm2 logs arcadeum-task-bot

# Worker logs
pm2 logs arcadeum-worker

# Redis queue inspection
redis-cli LLEN bull:implementation:waiting
redis-cli LLEN bull:implementation:active
```

### GitHub

```bash
# Open automated tasks
gh issue list --label "task,automated" --state open

# Bot PRs (GitHub Actions)
gh pr list --author "github-actions[bot]" --state open

# Bot PRs (OCI worker — uses configured git user)
gh pr list --state open --search "Closes #"

# Failed CI
gh pr checks --repo arcadeum/arcadeum | grep failure
```

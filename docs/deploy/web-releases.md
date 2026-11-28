# Web deploys on the OCI VMs: release directories

Prod (`/opt/arcadeum`, pm2 `arcadeum-web`, port 3000) and staging
(`/opt/arcadeum-dev`, pm2 `arcadeum-web-dev`, port 3001) both deploy the
Next.js standalone app through [`scripts/deploy-web-release.sh`](../../scripts/deploy-web-release.sh),
called from `.github/workflows/deploy-oci.yml`, `.github/workflows/deploy-oci-dev.yml`
and `scripts/deploy-prod.sh`.

## Why

The web process used to run `server.js` straight out of the build tree
(`apps/web/.next/standalone/apps/web`). At runtime Next.js writes ISR /
route-cache files into `.next/server/route-cache` inside that tree, while
`next build` starts by deleting `.next`. The two raced and the build failed:

```
Error: ENOTEMPTY: directory not empty, rmdir '/opt/arcadeum/apps/web/.next/standalone/apps/web/.next/server/route-cache/APP_PAGE/...'
```

Even when the build won the race, every deploy deleted files from under the
running server until pm2 restarted it.

## Layout

```
/opt/arcadeum-releases/web/            (staging: /opt/arcadeum-dev-releases/web/)
  releases/<utc-timestamp>-<sha>/      immutable copy of .next/standalone + static + public
  current -> releases/<id>             switched atomically (rename of a symlink)
  start.sh                             pm2 entrypoint, regenerated every deploy
  runtime.env                          OPTIONAL, owner-managed extra runtime env
```

Each deploy: build in the checkout -> copy to `releases/<id>` -> switch
`current` -> `pm2 restart` -> health check `http://127.0.0.1:<port>/`.

- **Build fails:** nothing is switched or restarted; the current release keeps serving.
- **Health check fails:** `current` is switched back to the previous release, pm2 restarted, and the job fails.
- **Retention:** the newest 3 releases (plus `current` and its rollback target) are kept; older ones are deleted. Each release is a full standalone copy, so budget roughly 3x its size on disk.
- **Runtime ISR cache** now lives inside the running release, so builds never touch it and a new release starts with a clean cache.
- **Downtime:** only the pm2 restart (a few seconds, same as before). The build no longer affects the running app.

## Migration (automatic, one time)

On the first deploy with this script, if pm2 still runs the legacy layout, the
script snapshots the live `apps/web/.next/standalone` (minus runtime caches)
into `releases/<ts>-legacy`, recreates the pm2 process on `start.sh`
(`pm2 delete` + `pm2 start`), health-checks it and only then builds. If the
snapshot does not come up, the legacy pm2 process is restored and the deploy
fails.

`pm2 delete` + `pm2 start` drops env that was attached to the old pm2 process
by hand. The standalone release already contains `apps/web/.env` and
`.env.production` (Next copies them), and staging still sources
`apps/web/.env.dev`. If prod's `arcadeum-web` relies on extra env that only
exists in pm2, put it in `/opt/arcadeum-releases/web/runtime.env` before the
first deploy (see step 2 below).

## Owner manual steps

### Unblock today's prod deploy (before this PR is merged)

Run on the prod VM. This stops the web for the length of one build, because
the legacy layout cannot build while the server runs:

```bash
cd /opt/arcadeum
pm2 stop arcadeum-web                       # stop the writer of .next/standalone
rm -rf apps/web/.next                       # clear the half-deleted build tree
cd apps/web && pnpm build                   # same build the workflow runs
cp -r .next/static .next/standalone/apps/web/.next/static
cp -r public .next/standalone/apps/web/public
pm2 restart arcadeum-web && pm2 save
```

Alternatively stop `arcadeum-web`, `rm -rf apps/web/.next`, then re-run the
"Deploy to OCI (Prod)" workflow with component `web` (the site is down until
that job finishes). Do not leave `arcadeum-web` stopped if the build fails: the
old build is gone at that point, so rebuild or roll back the commit first.

### One-time checks before the first deploy with this PR

1. Make sure `rsync` is installed (`command -v rsync`, else `sudo apt-get install -y rsync`);
   the script falls back to `cp -a`, but rsync tolerates files that vanish while copying.
2. Check which env the current web process has beyond the `.env*` files:
   `pm2 env $(pm2 id arcadeum-web | tr -dc '0-9')` (do not paste the output anywhere).
   Copy anything the app needs at runtime into `/opt/arcadeum-releases/web/runtime.env`
   (create the directory with `sudo mkdir -p /opt/arcadeum-releases/web && sudo chown -R ubuntu:ubuntu /opt/arcadeum-releases`).
3. After the first successful deploy, confirm `pm2 describe arcadeum-web` shows
   `script path /opt/arcadeum-releases/web/start.sh`, then `pm2 save`
   (the script already calls it). Same for `arcadeum-web-dev` on staging.

### Manual rollback

```bash
cd /opt/arcadeum-releases/web
ls releases/                                     # pick an id
ln -sfn releases/<id> .current-new && mv -Tf .current-new current
pm2 restart arcadeum-web
```

If the unblock step is skipped and the legacy tree is already half-deleted by
the failed build, the migration snapshot may be incomplete. It is replaced by
the freshly built release a few minutes later in the same job; if `server.js`
itself is gone, the script stops `arcadeum-web` and starts it on the new
release once the build finishes.

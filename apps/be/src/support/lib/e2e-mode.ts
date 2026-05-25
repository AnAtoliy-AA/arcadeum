// True when the BE is started as part of an e2e test run. The flag is set
// by apps/web/playwright.config.ts on the spawned BE webServer, and is the
// switch that tells the support module to skip side effects: no real
// Discord webhook POST, no real SMTP delivery, no per-IP rate limiting.
//
// IMPORTANT: this only kicks in for BE processes that were started with
// E2E=true in their environment. If your local `pnpm --filter be dev` is
// reused by Playwright (reuseExistingServer: true), that dev process
// won't have E2E=true and will deliver/throttle for real. Restart it
// with `E2E=true pnpm --filter be dev` if you want the bypass on a
// reused server.
export function isE2EMode(): boolean {
  return process.env.E2E === 'true';
}

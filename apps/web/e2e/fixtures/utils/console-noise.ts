/**
 * Console messages that are expected noise in e2e runs (intentional crashes,
 * mocked endpoints, aborted navigations, engine-specific warnings). The
 * fixture in `test-base.ts` logs every other error/warning so real problems
 * stay visible.
 */
export function isExpectedConsoleNoise(
  pageUrl: string,
  type: string,
  text: string,
): boolean {
  // Skip expected test crash errors or hydration noise
  if (
    text.includes('This is a test crash!') ||
    text.includes('handled by the <ErrorBoundaryHandler>') ||
    text.includes('The above error occurred in the <TestCrashContent>') ||
    text.includes('hydrated but some attributes of the server rendered HTML') ||
    text.includes('was preloaded using link preload but not used') ||
    text.includes('webpack-hmr') ||
    // The /test-crash page throws on purpose to exercise the error
    // boundary; Firefox reports it as a bare "Error".
    pageUrl.includes('/test-crash') ||
    // Firefox-only: the trailer embed's `allow` attribute lists features
    // Firefox does not implement.
    text.includes('Feature Policy: Skipping unsupported feature') ||
    // Firefox-only: missing optional audio assets (same 404s the network
    // handler below already ignores for /music/).
    (text.includes('Load of media resource') && text.includes('/music/')) ||
    // Firefox-only: specs inject mock session cookies in a cross-site
    // context, which Firefox rejects with a console error.
    /Cookie .*(?:access|refresh)_token.* has been rejected because it is in a cross-site context/.test(
      text,
    ) ||
    (/font|geist|preload/i.test(text) &&
      /(download failed|rejected|decode|preloaded with link preload was not used)/i.test(
        text,
      )) ||
    (/Loading failed for the <script>/i.test(text) &&
      /_next\/static\/chunks\//.test(text)) ||
    // Firefox flags forced reflow inside Playwright's own page.evaluate
    // calls (the script source is reported as "debugger eval code"). Not
    // an app bug — it's the test harness measuring layout state.
    /Layout was forced before the page was fully loaded/i.test(text)
  ) {
    return true;
  }

  // Ignore intentional 500 errors in payment notes page tests
  if (type === 'error' && text.includes('500') && pageUrl.includes('/notes')) {
    return true;
  }

  // Ignore intentional 4xx noise from flows that mock-fulfill error
  // responses or auth-gated specs where mockSession is in effect but the
  // BE rejects the fake bearer token (BalanceChip/auth-blocked/etc fire
  // header calls on every page). Allowlist by the page URL the noise
  // emits from. Every auth-gated route in the app needs to be here —
  // the header/shop-balance-chip widgets fire `/wallet/balance`,
  // `/auth/check/*`, `/notifications/*`, etc. on every page render
  // and the fake JWT from mockSession always 401s against the real BE.
  if (
    type === 'error' &&
    /Failed to load resource.*status of 4\d{2}/i.test(text) &&
    (/\/(?:wallet|payment|payments|gems|games|rooms|clans|friends|replay|auth|settings|chat|chats|leaderboards|stats|history|notifications|notes|referrals|rewards|tournaments|shop|profile|players|admin|community|developers|help|contact|support|blog|cookies|privacy|terms|legal|home)/.test(
      pageUrl,
    ) ||
      /^https?:\/\/[^/]+\/?$/.test(pageUrl) ||
      /^https?:\/\/[^/]+\/(?:en|es|fr|ru|by)\/?$/.test(pageUrl))
  ) {
    return true;
  }

  // Ignore BE socket.io websocket handshake failures. Many specs don't
  // mock the socket gateway and just navigate through pages that
  // initialize a socket.io client; the unauthenticated handshake then
  // logs identical noise across every browser ("Firefox can't establish
  // a connection…", "WebSocket connection to … failed: WebSocket is
  // closed before the connection is established", etc.). Firefox uses
  // a Unicode right-single-quote in "can't", so we match a stable
  // substring instead of the contraction.
  if (
    /(?:WebSocket connection to .* failed|establish a connection.*server.*ws:\/\/|WebSocket is closed before)/i.test(
      text,
    ) &&
    /socket\.io\//.test(text) &&
    /(?:localhost|127\.0\.0\.1):4000/.test(text)
  ) {
    return true;
  }

  // Ignore Next.js stack-frame CORS errors during aborts
  if (text.includes('__nextjs_original-stack-frames')) {
    return true;
  }

  // Suppress transient access control errors for endpoints we are mocking
  if (
    (text.includes('due to access control checks') ||
      text.includes('Fetch API cannot load')) &&
    (text.includes('localhost:4000') ||
      text.includes('localhost:4500') ||
      text.includes('localhost:3000') ||
      text.includes('127.0.0.1:4000') ||
      text.includes('127.0.0.1:4500') ||
      text.includes('127.0.0.1:3000') ||
      text.includes('localhost:3500') ||
      text.includes('127.0.0.1:3500'))
  ) {
    return true;
  }

  // Mobile Safari fires "due to access control checks" / "Fetch API
  // cannot load" when an in-flight Next.js RSC fetch is cancelled by a
  // subsequent navigation. The `?_rsc=` query is the unambiguous signal.
  if (
    (text.includes('due to access control checks') ||
      text.includes('Fetch API cannot load')) &&
    /[?&]_rsc=/.test(text)
  ) {
    return true;
  }
  return false;
}

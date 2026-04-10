import { Route } from '@playwright/test';

/**
 * Generates standard CORS headers for E2E route fulfillment.
 * This ensures that cross-origin requests from the web app (e.g., port 3000/3500)
 * to mocked API endpoints (e.g., port 4000/4500) are permitted by the browser.
 */
export function getCors(route: Route) {
  const reqHeaders = route.request().headers();

  // Use the Origin header from the request if present.
  // Fallback to Referer origin if Origin is missing (common in some fetch scenarios during reloads).
  // Finally default to the local web development URL.
  let origin = reqHeaders.origin;
  if (!origin && reqHeaders.referer) {
    try {
      const url = new URL(reqHeaders.referer);
      origin = url.origin;
    } catch {
      // Ignore invalid referer
    }
  }

  if (!origin) {
    // Determine default origin based on environment or standard local fallback.
    // We prioritize the configured WEB_PORT but ensure we handle potential 127.0.0.1 mismatches.
    const port = process.env.WEB_PORT || '3500';
    origin = `http://localhost:${port}`;
  }

  // When 'Access-Control-Allow-Credentials' is 'true', 'Access-Control-Allow-Headers' MUST NOT be '*'.
  // We list common headers used by the app, plus anything requested by the browser.
  const requestedHeaders = reqHeaders['access-control-request-headers'];
  const baseHeaders = 'Content-Type, Authorization, x-anonymous-id';
  const allowHeaders = requestedHeaders
    ? `${baseHeaders}, ${requestedHeaders}`
    : baseHeaders;

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods':
      'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD',
    'Access-Control-Allow-Headers': allowHeaders,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Private-Network': 'true',
    'Access-Control-Expose-Headers': '*',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

/**
 * A helper to fulfill a route with standard CORS headers and JSON body.
 */
export async function handleRoute(
  route: Route,
  bodyData: unknown,
  status = 200,
) {
  const method = route.request().method();

  if (method === 'OPTIONS') {
    await route.fulfill({
      status: 204,
      headers: getCors(route),
    });
    return;
  }

  await route.fulfill({
    status,
    contentType: 'application/json',
    headers: getCors(route),
    body: JSON.stringify(bodyData),
  });
}

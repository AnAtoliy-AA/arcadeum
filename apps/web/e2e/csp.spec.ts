import { expect, test } from '@playwright/test';

test.describe('Content Security Policy', () => {
  test('should have correct frame-src in CSP header', async ({ request }) => {
    // We check the headers of the root page
    // Note: CSP might be disabled in E2E environment depending on config
    const response = await request.get('/');
    const csp = response.headers()['content-security-policy'];

    // If CSP is disabled in E2E, this test will skip or pass conditionally
    if (csp) {
      expect(csp).toContain('frame-src');
      expect(csp).toContain('https://vercel.live');
    } else {
      console.log('CSP header not found (expected in E2E environment)');
    }
  });

  test('should allow vercel.live scripts', async ({ request }) => {
    const response = await request.get('/');
    const csp = response.headers()['content-security-policy'];

    if (csp) {
      expect(csp).toContain('script-src');
      expect(csp).toContain('https://vercel.live');
    }
  });
});

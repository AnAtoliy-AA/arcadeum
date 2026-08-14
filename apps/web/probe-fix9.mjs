import { chromium, devices } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ ...devices['iPhone 12'] });
await page.goto('http://127.0.0.1:3000/en', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
const out = await page.evaluate(() => {
  const container = document.querySelector('[data-testid="app-footer"] .max-w-\\[1400px\\]');
  const first = container?.children[0];
  const cs = first ? getComputedStyle(first) : null;
  return {
    footerGridDirection: cs?.flexDirection,
    brandColW: Math.round(first?.children[0]?.getBoundingClientRect().width || 0),
  };
});
console.log(JSON.stringify(out, null, 2));
await browser.close();

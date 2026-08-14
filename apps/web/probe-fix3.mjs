import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto('http://127.0.0.1:3000/en/games', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
await page.screenshot({ path: '/tmp/games-page.png', fullPage: true });
const out = await page.evaluate(() => {
  const footer = document.querySelector('[data-testid="app-footer"]');
  const r = footer?.getBoundingClientRect();
  return {
    footer: footer ? { y: Math.round(r.y), h: Math.round(r.height), bg: getComputedStyle(footer.querySelector('div')).backgroundColor } : null,
    chips: Array.from(document.querySelectorAll('[role="checkbox"]')).map(c => Math.round(c.getBoundingClientRect().width)),
  };
});
console.log(JSON.stringify(out, null, 2));
await browser.close();

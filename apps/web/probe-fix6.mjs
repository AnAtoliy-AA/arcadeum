import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto('http://127.0.0.1:3000/en', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
const out = await page.evaluate(() => {
  const container = document.querySelector('[data-testid="app-footer"] .max-w-\\[1400px\\]');
  const walk = (el, depth) => {
    if (depth > 3) return;
    for (const child of el.children) {
      const r = child.getBoundingClientRect();
      console.log(`${'  '.repeat(depth)}${child.tagName} ${child.className.slice(0,50)} w=${Math.round(r.width)} h=${Math.round(r.height)}`);
      walk(child, depth + 1);
    }
  };
  if (container) walk(container, 0);
  return 'done';
});
await browser.close();

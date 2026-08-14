import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto('http://127.0.0.1:3000/en', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
const out = await page.evaluate(() => {
  const results = [];
  const container = document.querySelector('[data-testid="app-footer"] .max-w-\\[1400px\\]');
  if (container) {
    for (const child of container.children) {
      const r = child.getBoundingClientRect();
      results.push({ cls: child.className.slice(0, 70), w: Math.round(r.width), h: Math.round(r.height) });
      for (const gc of child.children) {
        const gr = gc.getBoundingClientRect();
        results.push({ '  col': gc.className.slice(0, 50), w: Math.round(gr.width), h: Math.round(gr.height) });
      }
    }
  }
  return results;
});
console.log(JSON.stringify(out, null, 2));
await browser.close();

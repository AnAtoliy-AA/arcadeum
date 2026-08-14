import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto('http://127.0.0.1:3000/en', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
const out = await page.evaluate(() => {
  const res = {};
  const footer = document.querySelector('[data-testid="app-footer"]');
  if (footer) {
    const root = footer.querySelector('footer > div');
    const children = Array.from(root?.children || []).map((c, i) => {
      const r = c.getBoundingClientRect();
      const cs = getComputedStyle(c);
      return { i, tag: c.tagName, cls: c.className.slice(0, 60), display: cs.display, w: Math.round(r.width), h: Math.round(r.height), justify: cs.justifyContent, direction: cs.flexDirection };
    });
    res.footerChildren = children;
  }
  // brand column
  const brand = document.querySelector('[data-testid="app-footer"] .typography-gradient-primary');
  if (brand) {
    const r = brand.getBoundingClientRect();
    res.brand = { w: Math.round(r.width), h: Math.round(r.height), text: brand.textContent.slice(0, 20), bg: getComputedStyle(brand).backgroundImage.slice(0, 60) };
  }
  return res;
});
console.log(JSON.stringify(out, null, 2));
await browser.close();

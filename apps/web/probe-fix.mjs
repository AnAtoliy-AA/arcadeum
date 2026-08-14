import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto('http://127.0.0.1:3000/en/games', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
const out = await page.evaluate(() => {
  const res = {};
  // footer
  const footer = document.querySelector('[data-testid="app-footer"] footer, footer');
  if (footer) {
    const cs = getComputedStyle(footer);
    res.footer = { bg: cs.backgroundColor, backdrop: cs.backdropFilter.slice(0, 30), width: footer.getBoundingClientRect().width };
  }
  // filter chips
  const chips = document.querySelectorAll('[role="checkbox"]');
  res.chipCount = chips.length;
  res.chips = Array.from(chips).slice(0, 4).map((c) => {
    const r = c.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), display: getComputedStyle(c).display, justify: getComputedStyle(c).justifyContent };
  });
  const filters = document.querySelector('[data-testid="games-empty"], .rounded-\\[16px\\]');
  return res;
});
console.log(JSON.stringify(out, null, 2));
await browser.close();

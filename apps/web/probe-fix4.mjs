import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto('http://127.0.0.1:3000/en/games', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
const out = await page.evaluate(() => {
  const res = {};
  // footer structure: check columns layout
  const appFooter = document.querySelector('[data-testid="app-footer"]');
  const footerRoot = appFooter?.querySelector('footer > div');
  if (footerRoot) {
    const grid = footerRoot.children[1]; // container
    res.footer = {
      rootDisplay: getComputedStyle(footerRoot).display,
      rootPadding: getComputedStyle(footerRoot).padding,
      bg: getComputedStyle(footerRoot).backgroundColor,
      borderTop: getComputedStyle(footerRoot).borderTop,
    };
    // social row
    const social = document.querySelector('[data-testid="footer-social-instagram"]');
    if (social) {
      const r = social.getBoundingClientRect();
      res.socialIcon = { w: Math.round(r.width), h: Math.round(r.height) };
    }
  }
  // Filter chips container widths
  const chipGroups = document.querySelectorAll('[role="checkbox"]');
  res.chips = Array.from(chipGroups).map(c => ({ w: Math.round(c.getBoundingClientRect().width), text: c.textContent.trim().slice(0,15) }));
  return res;
});
console.log(JSON.stringify(out, null, 2));
await browser.close();

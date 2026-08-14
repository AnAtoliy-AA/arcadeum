import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://127.0.0.1:3000/en', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
const out = await page.evaluate(() => {
  const footer = document.querySelector('footer');
  const inner = footer.querySelector('div');
  const html = document.documentElement;
  return {
    glassBgVar: getComputedStyle(html).getPropertyValue('--glassBg').trim(),
    glassBgHover: getComputedStyle(html).getPropertyValue('--glassBgHover').trim(),
    footerInnerStyle: inner.getAttribute('style'),
    footerInnerBg: getComputedStyle(inner).backgroundColor,
    footerBg: getComputedStyle(footer).backgroundColor,
  };
});
console.log(JSON.stringify(out, null, 2));
await browser.close();

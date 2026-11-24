'use strict';

const fs = require('fs');
const path = require('path');
const { VIDEO } = require('./config');
const { getSafeZone } = require('./safezone');
const { buildCaptionStates } = require('./captions');
const {
  captionHtml,
  hookHtml,
  watermarkHtml,
  endCardHtml,
} = require('./overlay-html');

const PAD = 40; // room for shadows in clipped screenshots

/** Shrinks #box font until it fits (runs inside the page). */
function fitInPage({ zone, kind }) {
  const el = document.getElementById('box');
  if (!el) return null;
  let size = parseFloat(el.dataset.font || '0') || 0;
  const ok = () => {
    const r = el.getBoundingClientRect();
    return (
      el.scrollWidth <= el.clientWidth + 1 &&
      r.left >= zone.left &&
      r.right <= zone.right &&
      r.top >= zone.top &&
      r.bottom <= zone.bottom
    );
  };
  while (size > 40 && !ok()) {
    size -= 2;
    el.style.fontSize = `${size}px`;
  }
  const r = el.getBoundingClientRect();
  return {
    kind,
    x: r.left,
    y: r.top,
    width: r.width,
    height: r.height,
    fontSize: size,
  };
}

async function shoot(page, html, file, zone, kind) {
  await page.setContent(html, { waitUntil: 'load' });
  const rect = await page.evaluate(fitInPage, { zone, kind });
  const clip = {
    x: Math.max(0, Math.floor(rect.x - PAD)),
    y: Math.max(0, Math.floor(rect.y - PAD)),
    width: 0,
    height: 0,
  };
  clip.width = Math.min(VIDEO.width - clip.x, Math.ceil(rect.width + PAD * 2));
  clip.height = Math.min(
    VIDEO.height - clip.y,
    Math.ceil(rect.height + PAD * 2),
  );
  await page.screenshot({ path: file, clip, omitBackground: true });
  return { file, x: clip.x, y: clip.y, rect };
}

function readLogoDataUri(logoPath) {
  try {
    const buf = fs.readFileSync(logoPath);
    return `data:image/png;base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

/**
 * Render every overlay PNG. Returns
 * { hook, watermark, captions:[{file,x,y,start,end}], endCard, rects }
 * where rects are the measured text boxes (for the safe-zone QA check).
 *
 * input: { outDir, hookText, hookEndSec, captionLines (timeline, sec),
 *          cta:{text}, siteName, logoPath }
 */
async function renderOverlays(input) {
  const { chromium } = require('playwright');
  const zone = getSafeZone();
  const maxWidth = zone.right - zone.left;
  const dir = input.outDir;
  fs.mkdirSync(dir, { recursive: true });
  const rects = [];
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: VIDEO.width, height: VIDEO.height },
    });
    const hook = await shoot(
      page,
      hookHtml(input.hookText, { topY: zone.top + 110, maxWidth }),
      path.join(dir, 'hook.png'),
      zone,
      'hook',
    );
    rects.push({ kind: 'hook', ...hook.rect });
    const watermark = await shoot(
      page,
      watermarkHtml(input.siteName, { left: zone.left, topY: zone.top + 14 }),
      path.join(dir, 'watermark.png'),
      zone,
      'watermark',
    );
    rects.push({ kind: 'watermark', ...watermark.rect });

    const captions = [];
    const bottomY = zone.bottom - 70;
    const states = buildCaptionStates(input.captionLines);
    const seenLayout = new Map();
    for (let i = 0; i < states.length; i++) {
      const s = states[i];
      const shot = await shoot(
        page,
        captionHtml(s.words, s.activeIndex, { bottomY, maxWidth }),
        path.join(dir, `cap-${String(i).padStart(3, '0')}.png`),
        zone,
        'caption',
      );
      if (!seenLayout.has(s.lineIndex)) {
        seenLayout.set(s.lineIndex, true);
        rects.push({ kind: 'caption', ...shot.rect });
      }
      captions.push({
        file: shot.file,
        x: shot.x,
        y: shot.y,
        start: s.start,
        end: s.end,
      });
    }

    await page.setContent(
      endCardHtml({
        cta: input.cta.text,
        site: input.siteName,
        logoDataUri: readLogoDataUri(input.logoPath),
        zoneTop: zone.top,
        zoneBottom: zone.bottom,
        zoneLeft: zone.left,
        zoneRight: zone.right,
      }),
      { waitUntil: 'load' },
    );
    const endRects = await page.evaluate(() =>
      [...document.querySelectorAll('[data-kind]')].map((e) => {
        const r = e.getBoundingClientRect();
        return {
          kind: `endcard-${e.dataset.kind}`,
          x: r.left,
          y: r.top,
          width: r.width,
          height: r.height,
        };
      }),
    );
    rects.push(...endRects);
    const endCardFile = path.join(dir, 'endcard.png');
    await page.screenshot({ path: endCardFile });
    return {
      hook: { ...hook, start: 0, end: input.hookEndSec },
      watermark,
      captions,
      endCard: { file: endCardFile },
      rects,
    };
  } finally {
    await browser.close();
  }
}

module.exports = { renderOverlays, PAD };

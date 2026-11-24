'use strict';

/** Pure HTML builders for the burned-in overlays (rendered by Chromium). */

const FONT =
  "'Inter','Segoe UI',Roboto,'Helvetica Neue',Arial,'DejaVu Sans',sans-serif";

const esc = (s) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
  );

function page(body, css = '') {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;padding:0;background:transparent;}
body{width:1080px;height:1920px;position:relative;overflow:hidden;font-family:${FONT};}
#box{position:absolute;box-sizing:border-box;text-align:center;font-weight:900;}
${css}
</style></head><body>${body}</body></html>`;
}

function captionHtml(words, activeIndex, { bottomY, maxWidth, fontSize = 78 }) {
  const spans = words
    .map(
      (w, i) =>
        `<span class="${i === activeIndex ? 'on' : ''}">${esc(w)}</span>`,
    )
    .join(' ');
  return page(
    `<div id="box" data-kind="caption" data-max-width="${maxWidth}" data-font="${fontSize}">${spans}</div>`,
    `#box{left:50%;transform:translateX(-50%);bottom:${1920 - bottomY}px;max-width:${maxWidth}px;
      font-size:${fontSize}px;line-height:1.12;color:#fff;padding:18px 28px;border-radius:28px;
      background:rgba(8,10,20,.62);text-transform:uppercase;letter-spacing:.5px;
      -webkit-text-stroke:0;text-shadow:0 3px 0 #000,0 0 14px rgba(0,0,0,.9);}
     #box span{display:inline-block;}
     #box span.on{color:#ffe600;}`,
  );
}

function hookHtml(text, { topY, maxWidth, fontSize = 96 }) {
  return page(
    `<div id="box" data-kind="hook" data-max-width="${maxWidth}" data-font="${fontSize}">${esc(text)}</div>`,
    `#box{left:50%;transform:translateX(-50%);top:${topY}px;max-width:${maxWidth}px;
      font-size:${fontSize}px;line-height:1.08;color:#0b0b10;background:#ffe600;padding:22px 34px;
      border-radius:30px;text-transform:uppercase;box-shadow:0 10px 0 #000,0 0 40px rgba(0,0,0,.6);
      border:6px solid #000;}`,
  );
}

function watermarkHtml(text, { left, topY }) {
  return page(
    `<div id="box" data-kind="watermark">${esc(text)}</div>`,
    `#box{left:${left}px;top:${topY}px;font-size:40px;color:#fff;background:rgba(8,10,20,.72);
      padding:8px 22px;border-radius:9999px;border:2px solid rgba(255,255,255,.55);letter-spacing:.5px;
      text-align:left;}`,
  );
}

/** Full-frame end card; `logoDataUri` optional. Text blocks are #cta/#url. */
function endCardHtml({
  cta,
  site,
  logoDataUri,
  zoneTop,
  zoneBottom,
  zoneLeft,
  zoneRight,
}) {
  const logo = logoDataUri
    ? `<img src="${logoDataUri}" style="width:420px;display:block;margin:0 auto 40px"/>`
    : '';
  return `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;background:linear-gradient(160deg,#10142a,#1d0f3a 60%,#0b0f1a);}
body{width:1080px;height:1920px;position:relative;font-family:${FONT};overflow:hidden;}
#wrap{position:absolute;left:${zoneLeft}px;right:${1080 - zoneRight}px;top:${zoneTop}px;bottom:${1920 - zoneBottom}px;
 display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;}
#cta{font-size:84px;font-weight:900;color:#fff;line-height:1.1;text-transform:uppercase;max-width:100%;
 text-shadow:0 4px 0 #000;}
#url{margin-top:36px;font-size:72px;font-weight:900;color:#0b0b10;background:#ffe600;padding:14px 40px;border-radius:9999px;}
#wm{position:absolute;left:${zoneLeft}px;top:${zoneTop + 10}px;font-size:40px;font-weight:900;color:#fff;
 background:rgba(8,10,20,.72);padding:8px 22px;border-radius:9999px;border:2px solid rgba(255,255,255,.55);}
</style></head><body>
<div id="wrap">${logo}<div id="cta" data-kind="cta">${esc(cta)}</div><div id="url" data-kind="url">${esc(site)}</div></div>
<div id="wm" data-kind="watermark">${esc(site)}</div>
</body></html>`;
}

module.exports = { captionHtml, hookHtml, watermarkHtml, endCardHtml, esc };

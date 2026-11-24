'use strict';

const { cleanScript } = require('./captions');
const { SITE } = require('./config');

const LIMITS = {
  tiktok: { title: 90, caption: 150, hashtags: 4 },
  instagram: { title: 0, caption: 220, hashtags: 5 },
  youtube: { title: 100, caption: 500, hashtags: 3 },
};

function parseTags(tags) {
  const list = Array.isArray(tags) ? tags : String(tags || '').split(/\s+/);
  const seen = new Set();
  return list
    .map((t) => t.trim())
    .filter((t) => /^#\w+$/.test(t))
    .filter((t) => {
      const k = t.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
}

function truncate(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[,;:\s]+$/, '')}…`;
}

function pickTags(tags, required, max) {
  const out = [...required];
  for (const t of tags) {
    if (out.length >= max) break;
    if (!out.some((r) => r.toLowerCase() === t.toLowerCase())) out.push(t);
  }
  return out.slice(0, max);
}

/**
 * Per-platform metadata variants. Pure.
 * - TikTok: short caption, 4 tags, title is the hook-first line.
 * - Reels: short caption, 5 tags, CTA to the link in bio.
 * - YouTube Shorts: hook-first title with #Shorts (<=100 chars), 3 tags
 *   (the first three tags show above the title).
 */
function buildPlatformMetadata({ caption, hook, tags, ctaVariant }) {
  const body = cleanScript(caption);
  const tagList = parseTags(tags);
  const hookLine = cleanScript(hook || body.split(/[.!?]/)[0]);
  const cta = ctaVariant && ctaVariant.text ? ctaVariant.text : 'Play free';

  const tt = pickTags(tagList, ['#fyp'], LIMITS.tiktok.hashtags);
  const ig = pickTags(tagList, ['#reels'], LIMITS.instagram.hashtags);
  const yt = pickTags(tagList, ['#shorts'], LIMITS.youtube.hashtags);

  const tiktokCaption = truncate(
    `${hookLine}. ${cta} at ${SITE.name}`,
    LIMITS.tiktok.caption - tt.join(' ').length - 2,
  );
  const igCaption = truncate(
    `${hookLine}. ${cta}: link in bio (${SITE.name})`,
    LIMITS.instagram.caption - ig.join(' ').length - 2,
  );
  const ytTitleTags = '#Shorts';
  const ytTitle = `${truncate(hookLine, LIMITS.youtube.title - ytTitleTags.length - 1)} ${ytTitleTags}`;
  const ytDescription = truncate(
    `${body}\n\n${cta}: ${SITE.url}`,
    LIMITS.youtube.caption,
  );

  return {
    tiktok: {
      title: truncate(hookLine, LIMITS.tiktok.title),
      content: `${tiktokCaption}\n\n${tt.join(' ')}`,
      hashtags: tt,
    },
    instagram: {
      title: '',
      content: `${igCaption}\n\n${ig.join(' ')}`,
      hashtags: ig,
    },
    youtube: {
      title: ytTitle,
      content: `${ytDescription}\n\n${yt.join(' ')}`,
      hashtags: yt,
    },
  };
}

module.exports = { buildPlatformMetadata, parseTags, truncate, LIMITS };

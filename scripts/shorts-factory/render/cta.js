'use strict';

const { CTA_VARIANTS } = require('./config');

/**
 * Choose the end-card CTA variant for A/B testing.
 * Forced via SHORTS_CTA_VARIANT=<id>; otherwise rotates by day number so
 * consecutive days alternate, optionally overridden by `seed` for tests.
 * Custom text can be supplied with SHORTS_CTA_TEXT (recorded as variant "custom").
 */
function pickCtaVariant({
  env = process.env,
  now = new Date(),
  variants = CTA_VARIANTS,
} = {}) {
  const custom = (env.SHORTS_CTA_TEXT || '').trim();
  if (custom) return { id: 'custom', text: custom.slice(0, 40) };
  const forced = (env.SHORTS_CTA_VARIANT || '').trim().toUpperCase();
  const match = variants.find((v) => v.id === forced);
  if (match) return { ...match };
  const day = Math.floor(now.getTime() / 86400000);
  return { ...variants[day % variants.length] };
}

module.exports = { pickCtaVariant };

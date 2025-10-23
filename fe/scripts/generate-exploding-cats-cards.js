#!/usr/bin/env node
/* eslint-env node */
/* global __dirname */
/**
 * Simple SVG card generator for "Exploding Cats" themed cards.
 * Produces stylised cat silhouettes with radial "explosion" effects.
 */

const { mkdirSync, writeFileSync } = require('fs');
const { join } = require('path');

const CARD_WIDTH = 750;
const CARD_HEIGHT = 1050;
const OUTPUT_DIR = join(__dirname, '..', 'assets', 'cards');

const CARD_DEFINITIONS = [
  {
    name: 'Exploding Cat',
    palette: ['#1B1F3B', '#F25F5C', '#FFE066'],
  },
  {
    name: 'Defuse',
    palette: ['#0C4A6E', '#38BDF8', '#E0F2FE'],
  },
  {
    name: 'Attack',
    palette: ['#3F0E0E', '#FB8C00', '#FFE0B2'],
  },
  {
    name: 'Skip',
    palette: ['#052E4E', '#0EA5E9', '#BAE6FD'],
  },
  {
    name: 'Hairball Redirect',
    palette: ['#3F6212', '#A3E635', '#F7FEE7'],
  },
  {
    name: 'Temporal Laser Pointer',
    palette: ['#312E81', '#6366F1', '#C7D2FE'],
  },
  {
    name: 'Catnip Firewall',
    palette: ['#7F1D1D', '#FB7185', '#FBCFE8'],
  },
  {
    name: 'Tacocat',
    palette: ['#3A2E24', '#F97316', '#FED7AA'],
  },
  {
    name: 'Hairy Potato Cat',
    palette: ['#4A2C2A', '#FACC15', '#FEF3C7'],
  },
  {
    name: 'Rainbow Ralphing Cat',
    palette: ['#1F2937', '#EC4899', '#FBCFE8'],
  },
  {
    name: 'Cattermelon',
    palette: ['#14532D', '#22C55E', '#DCFCE7'],
  },
  {
    name: 'Bearded Cat',
    palette: ['#2C1A4A', '#A855F7', '#E9D5FF'],
  },
];

const VARIANTS_PER_CARD = 3;

mkdirSync(OUTPUT_DIR, { recursive: true });

function hashSeed(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) + 1;
}

function createRng(seed) {
  let state = seed;
  return () => {
    state = Math.sin(state) * 10000;
    return state - Math.floor(state);
  };
}

function svgHeader() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" role="img" aria-labelledby="title desc">
<title id="title">Exploding Cats card</title>
<desc id="desc">Stylised cartoon card illustration.</desc>`;
}

function svgFooter() {
  return '</svg>';
}

function renderBackground(rng, colors) {
  const [base, flare, glow] = colors;
  const rotation = (rng() * 360).toFixed(2);
  const gradientStops = Array.from({ length: 6 }, (_, idx) => {
    const offset = ((idx / 5) * 100).toFixed(2);
    const opacity = idx < 3 ? 0.9 - idx * 0.15 : 0.2 - (idx - 2) * 0.06;
    return `<stop offset="${offset}%" stop-color="${flare}" stop-opacity="${Math.max(opacity, 0.05).toFixed(2)}" />`;
  }).join('');

  return `
  <defs>
    <linearGradient id="bg-gradient" gradientTransform="rotate(${rotation})">
      <stop offset="0%" stop-color="${base}" />
      <stop offset="100%" stop-color="${glow}" />
    </linearGradient>
    <radialGradient id="flare-gradient" cx="50%" cy="45%" r="65%">
      ${gradientStops}
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg-gradient)" />
  <circle cx="${CARD_WIDTH / 2}" cy="${CARD_HEIGHT * 0.42}" r="${CARD_WIDTH * 0.46}" fill="url(#flare-gradient)" />
  `;
}

function renderCatSilhouette(rng, colors) {
  const [base, accent] = colors;
  const tilt = (rng() * 12 - 6).toFixed(2);
  const offsetX = (rng() * 60 - 30).toFixed(2);
  const offsetY = (rng() * 40 - 20).toFixed(2);
  const bodyHeight = CARD_HEIGHT * 0.42;
  const headRadius = CARD_WIDTH * 0.14;
  const eyeOffset = headRadius * 0.45;
  const eyeRadius = headRadius * 0.18;

  return `
  <g transform="translate(${CARD_WIDTH / 2 + Number(offsetX)}, ${CARD_HEIGHT * 0.45 + Number(offsetY)}) rotate(${tilt})">
    <ellipse cx="0" cy="${bodyHeight * 0.4}" rx="${headRadius * 1.15}" ry="${bodyHeight * 0.7}" fill="${base}" />
    <circle cx="0" cy="0" r="${headRadius}" fill="${base}" />
    <path d="M ${-headRadius * 0.6} ${-headRadius * 0.2} L ${-headRadius * 1.1} ${-headRadius * 1.3} L ${-headRadius * 0.2} ${-headRadius * 0.8} Z" fill="${base}" />
    <path d="M ${headRadius * 0.6} ${-headRadius * 0.2} L ${headRadius * 1.1} ${-headRadius * 1.3} L ${headRadius * 0.2} ${-headRadius * 0.8} Z" fill="${base}" />
    <circle cx="${-eyeOffset}" cy="${-headRadius * 0.1}" r="${eyeRadius}" fill="${accent}" />
    <circle cx="${eyeOffset}" cy="${-headRadius * 0.1}" r="${eyeRadius}" fill="${accent}" />
    <path d="M ${-eyeOffset * 0.6} ${headRadius * 0.3} Q 0 ${headRadius * rng() * 0.6} ${eyeOffset * 0.6} ${headRadius * 0.3}" stroke="${accent}" stroke-width="${headRadius * 0.08}" fill="none" stroke-linecap="round" />
    <path d="M ${headRadius * 0.7} ${bodyHeight * 0.6} Q ${headRadius * 1.3} ${bodyHeight * 0.3} ${headRadius * 1.6} ${bodyHeight * 0.8}" stroke="${base}" stroke-width="${headRadius * 0.25}" fill="none" stroke-linecap="round" />
    <circle cx="${headRadius * 1.6}" cy="${bodyHeight * 0.8}" r="${headRadius * 0.25}" fill="${accent}" />
  </g>
  `;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function buildCardSvg(card, index) {
  const seed = hashSeed(`${card.name}-${index}`);
  const rng = createRng(seed);
  const background = renderBackground(rng, card.palette);
  const cat = renderCatSilhouette(rng, [card.palette[0], card.palette[2]]);
  return `${svgHeader()}
${background}${cat}${svgFooter()}`;
}

function generateCards() {
  const files = [];

  CARD_DEFINITIONS.forEach((card) => {
    for (let variant = 1; variant <= VARIANTS_PER_CARD; variant += 1) {
      const svg = buildCardSvg(card, variant);
      const filename = `${slugify(card.name)}-${variant}.svg`;
      const outputPath = join(OUTPUT_DIR, filename);
      writeFileSync(outputPath, svg, 'utf8');
      files.push(outputPath);
    }
  });

  return files;
}

const generated = generateCards();
console.log(`Generated ${generated.length} card illustrations:`);
generated.forEach((file) => console.log(`- ${file}`));

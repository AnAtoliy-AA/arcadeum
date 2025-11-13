const path = require('path');

module.exports = {
  "apps/mobile/**/*.{ts,tsx,js,jsx}": (files) => {
    const relativeFiles = files
      .map((file) => path.relative('apps/mobile', file))
      .map((file) => `"${file}"`)
      .join(' ');
    if (!relativeFiles) {
      return [];
    }
    return [
      `cd apps/mobile && pnpm exec eslint --max-warnings=0 --fix ${relativeFiles}`,
      `cd apps/mobile && pnpm exec prettier --write ${relativeFiles}`,
    ];
  },
  "apps/mobile/**/*.{json,md,yml,yaml}": (files) => {
    const relativeFiles = files
      .map((file) => path.relative('apps/mobile', file))
      .map((file) => `"${file}"`)
      .join(' ');
    if (!relativeFiles) {
      return [];
    }
    return [`cd apps/mobile && pnpm exec prettier --write ${relativeFiles}`];
  },
  "apps/be/**/*.{ts,js}": (files) => {
    const relativeFiles = files
      .map((file) => path.relative('apps/be', file))
      .map((file) => `"${file}"`)
      .join(' ');
    if (!relativeFiles) {
      return [];
    }
    return [
      `cd apps/be && pnpm exec eslint --max-warnings=0 --fix ${relativeFiles}`,
      `cd apps/be && pnpm exec prettier --write ${relativeFiles}`,
    ];
  },
  "apps/be/**/*.{json,md,yml,yaml}": (files) => {
    const relativeFiles = files
      .map((file) => path.relative('apps/be', file))
      .map((file) => `"${file}"`)
      .join(' ');
    if (!relativeFiles) {
      return [];
    }
    return [`cd apps/be && pnpm exec prettier --write ${relativeFiles}`];
  },
};

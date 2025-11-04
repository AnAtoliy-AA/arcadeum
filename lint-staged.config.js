const path = require('path');

module.exports = {
  "fe/**/*.{ts,tsx,js,jsx}": (files) => {
    const relativeFiles = files
      .map((file) => path.relative('fe', file))
      .map((file) => `"${file}"`)
      .join(' ');
    if (!relativeFiles) {
      return [];
    }
    return [
      `cd fe && npx eslint --max-warnings=0 --fix ${relativeFiles}`,
      `cd fe && npx prettier --write ${relativeFiles}`,
    ];
  },
  "fe/**/*.{json,md,yml,yaml}": (files) => {
    const relativeFiles = files
      .map((file) => path.relative('fe', file))
      .map((file) => `"${file}"`)
      .join(' ');
    if (!relativeFiles) {
      return [];
    }
    return [`cd fe && npx prettier --write ${relativeFiles}`];
  },
  "be/**/*.{ts,js}": (files) => {
    const relativeFiles = files
      .map((file) => path.relative('be', file))
      .map((file) => `"${file}"`)
      .join(' ');
    if (!relativeFiles) {
      return [];
    }
    return [
      `cd be && npx eslint --max-warnings=0 --fix ${relativeFiles}`,
      `cd be && npx prettier --write ${relativeFiles}`,
    ];
  },
  "be/**/*.{json,md,yml,yaml}": (files) => {
    const relativeFiles = files
      .map((file) => path.relative('be', file))
      .map((file) => `"${file}"`)
      .join(' ');
    if (!relativeFiles) {
      return [];
    }
    return [`cd be && npx prettier --write ${relativeFiles}`];
  },
};

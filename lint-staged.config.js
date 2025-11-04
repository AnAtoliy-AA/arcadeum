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
  "be/**/*.{ts,js}": [
    "npm --prefix be exec -- eslint --max-warnings=0 --fix",
    "npm --prefix be exec -- prettier --write"
  ],
  "be/**/*.{json,md,yml,yaml}": [
    "npm --prefix be exec -- prettier --write"
  ]
};

const path = require('path');

const getRelativeFiles = (files, basePath) => {
  return files
    .map((file) => path.relative(basePath, file))
    .filter((file) => file.length > 0);
};

// Simple lint command that will properly fail on errors
const lintAndFormat = (app) => (files) => {
  const basePath = `apps/${app}`;
  const relativeFiles = getRelativeFiles(files, basePath);
  if (relativeFiles.length === 0) {
    return [];
  }
  const fileArgs = relativeFiles.map((f) => `"${f}"`).join(' ');
  return [
    `cd ${basePath} && pnpm exec eslint --max-warnings=0 --fix ${fileArgs}`,
    `pnpm exec prettier --write ${files.map((f) => `"${f}"`).join(' ')}`,
  ];
};

const formatOnly = (files) => {
  return [`pnpm exec prettier --write ${files.map((f) => `"${f}"`).join(' ')}`];
};

module.exports = {
  'apps/mobile/**/*.{ts,tsx,js,jsx}': lintAndFormat('mobile'),
  'apps/mobile/**/*.{json,md,yml,yaml}': formatOnly,
  'apps/be/**/*.{ts,js}': lintAndFormat('be'),
  'apps/be/**/*.{json,md,yml,yaml}': formatOnly,
  'apps/web/**/*.{ts,tsx,js,jsx}': lintAndFormat('web'),
  'apps/web/**/*.{json,md,yml,yaml,css}': formatOnly,
  '*.{js,json,md,yml,yaml}': formatOnly,
  'scripts/**/*.{js,ts}': formatOnly,
};

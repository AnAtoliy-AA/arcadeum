const path = require('path');

const getRelativeFiles = (files, basePath) => {
  return files
    .map((file) => path.relative(basePath, file))
    .map((file) => `"${file}"`)
    .join(' ');
};

const lintAndFormat = (app) => (files) => {
  const basePath = `apps/${app}`;
  const relativeFiles = getRelativeFiles(files, basePath);
  if (!relativeFiles) {
    return [];
  }
  return [
    `cd ${basePath} && pnpm exec eslint --max-warnings=0 --fix ${relativeFiles}`,
    `cd ${basePath} && pnpm exec prettier --write ${relativeFiles}`,
  ];
};

const formatOnly = (app) => (files) => {
  const basePath = `apps/${app}`;
  const relativeFiles = getRelativeFiles(files, basePath);
  if (!relativeFiles) {
    return [];
  }
  return [`cd ${basePath} && pnpm exec prettier --write ${relativeFiles}`];
};

module.exports = {
  'apps/mobile/**/*.{ts,tsx,js,jsx}': lintAndFormat('mobile'),
  'apps/mobile/**/*.{json,md,yml,yaml}': formatOnly('mobile'),
  'apps/be/**/*.{ts,js}': lintAndFormat('be'),
  'apps/be/**/*.{json,md,yml,yaml}': formatOnly('be'),
  'apps/web/**/*.{ts,tsx,js,jsx}': lintAndFormat('web'),
  'apps/web/**/*.{json,md,yml,yaml,css}': formatOnly('web'),
};

const fs = require('fs');
const path = require('path');

try {
  const nextConfigPath = path.resolve(
    __dirname,
    '../node_modules/next/config.js',
  );

  if (!fs.existsSync(nextConfigPath)) {
    console.log('patch-next-config: patching next/config.js...');
    const content =
      'module.exports = { setConfig: () => {}, default: () => ({}) };';
    fs.writeFileSync(nextConfigPath, content);
    console.log('patch-next-config: patched successfully.');
  } else {
    console.log('patch-next-config: next/config.js already exists.');
  }
} catch (e) {
  console.error('patch-next-config: failed to patch.', e);
  // Don't fail the build, just warn
}

const fs = require('fs');
const path = require('path');

const VARIANTS_DIR = path.join(
  __dirname,
  '../../apps/web/src/widgets/CriticalGame/ui/styles/variants',
);
const PUBLIC_SPRITES_DIR = path.join(
  __dirname,
  '../../apps/web/public/images/cards',
);

console.log('--- Critical Game Sprite Link Verification ---');

const allEntries = fs.readdirSync(VARIANTS_DIR);
const variantMap = new Map();

allEntries.forEach((entry) => {
  const fullPath = path.join(VARIANTS_DIR, entry);
  const stats = fs.statSync(fullPath);

  if (stats.isDirectory()) {
    const cardsPath = path.join(fullPath, 'cards.ts');
    if (fs.existsSync(cardsPath)) {
      variantMap.set(entry, cardsPath);
    }
  } else if (
    entry.endsWith('.ts') &&
    !['types.ts', 'base.ts', 'index.ts'].includes(entry) &&
    !entry.includes('.test.') &&
    !entry.includes('.spec.')
  ) {
    const name = entry.replace('.ts', '');
    if (!variantMap.has(name)) {
      variantMap.set(name, fullPath);
    }
  }
});

let errors = 0;
let warnings = 0;

variantMap.forEach((filePath, variantName) => {
  const content = fs.readFileSync(filePath, 'utf8');

  // 1. Check if getCardSpriteUrl is defined
  const spriteUrlMatch = content.match(
    /getCardSpriteUrl:\s*\(\)\s*(?::\s*\w+)?\s*=>\s*['"](.+?)['"]/,
  );

  if (!spriteUrlMatch) {
    console.error(
      `❌ [${variantName}] Missing getCardSpriteUrl or invalid format.`,
    );
    errors++;
    return;
  }

  const spritePath = spriteUrlMatch[1];
  const fullSpritePath = path.join(
    __dirname,
    '../../apps/web/public',
    spritePath,
  );

  // 2. Check if file exists in public dir
  if (!fs.existsSync(fullSpritePath)) {
    console.error(
      `❌ [${variantName}] Sprite sheet not found at: ${spritePath}`,
    );
    errors++;
    return;
  }

  // 3. Check file size (should be > 10KB to avoid "empty" sheets)
  const stats = fs.statSync(fullSpritePath);
  if (stats.size < 10000) {
    console.warn(
      `⚠️ [${variantName}] Sprite sheet seems too small (${(stats.size / 1024).toFixed(1)} KB). Possible empty sheet.`,
    );
    warnings++;
  } else {
    console.log(
      `✅ [${variantName}] Correctly linked to ${spritePath} (${(stats.size / 1024).toFixed(1)} KB)`,
    );
  }
});

console.log('\n--- Summary ---');
console.log(`Verified: ${variantMap.size} variants`);
console.log(`Errors:   ${errors}`);
console.log(`Warnings: ${warnings}`);

if (errors > 0) {
  process.exit(1);
}

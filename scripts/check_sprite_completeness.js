const path = require('path');
const { extractObjectFromSource } = require('./spritesheet/parse-constants');
const { checkVariantCompleteness } = require('./spritesheet/check-completeness');

const VARIANTS_PATH = path.resolve(
  __dirname,
  '../apps/web/src/widgets/CriticalGame/lib/constants/variants.ts',
);

const CARDS_PATH = path.resolve(
  __dirname,
  '../apps/web/src/widgets/CriticalGame/lib/constants/cards.ts',
);

function runAudit() {
  const gameVariants = extractObjectFromSource(VARIANTS_PATH, 'GAME_VARIANT') || {};
  const cardSpriteMap = extractObjectFromSource(CARDS_PATH, 'CARD_SPRITE_MAP') || {};

  const variants = Object.values(gameVariants);
  
  console.log('--- Critical Game Sprite Completeness Audit ---\n');
  
  let totalMissing = 0;
  const results = variants.map(variant => checkVariantCompleteness(variant, cardSpriteMap));

  // Sort by percentage descending
  results.sort((a, b) => {
    const percA = a.foundCount / a.totalExpected;
    const percB = b.foundCount / b.totalExpected;
    return percB - percA;
  });

  results.forEach((report) => {
    const percentage = ((report.foundCount / report.totalExpected) * 100).toFixed(1);
    const status = report.missingCount === 0 ? '✅ COMPLETE' : `❌ INCOMPLETE (${report.missingCount} missing)`;
    console.log(`${report.variant.padEnd(20)} | ${percentage.padStart(5)}% | ${status}`);
    
    if (report.missingCount > 0 && report.missingCount < 15) {
      const missingNames = report.missingList.map(m => m.name).join(', ');
      console.log(`   Missing: ${missingNames}`);
    } else if (report.missingCount >= 15) {
      console.log(`   Missing: ${report.missingCount} types (too many to list)`);
    }
  });

  totalMissing = results.reduce((acc, r) => acc + r.missingCount, 0);
  console.log(`\nTotal missing assets across all variants: ${totalMissing}`);
  
  if (totalMissing > 0) {
    process.exit(1);
  } else {
    console.log('\nAll thematic sprites are complete! 🎉');
    process.exit(0);
  }
}

runAudit();


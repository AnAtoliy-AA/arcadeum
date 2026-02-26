#!/usr/bin/env node

/**
 * Translation validation script
 * Checks for missing translation keys in the web app by comparing language structures
 */

const fs = require('fs');
const path = require('path');

// Function to collect all translation keys from an object recursively
function collectKeys(obj, prefix = '') {
  const keys = [];

  if (!obj || typeof obj !== 'object') return keys;

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...collectKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

// Function to extract a balanced object starting with { from a string
function extractObject(content, startIndex) {
  let braceCount = 0;
  let inString = false;
  let stringChar = '';
  let i = startIndex;

  // Find the first {
  while (i < content.length && content[i] !== '{') {
    i++;
  }

  if (i >= content.length) return null;

  const start = i;

  for (; i < content.length; i++) {
    const char = content[i];

    if (!inString) {
      if (char === '{') braceCount++;
      else if (char === '}') braceCount--;
      else if (char === "'" || char === '"' || char === '`') {
        inString = true;
        stringChar = char;
      }

      if (braceCount === 0) {
        return content.substring(start + 1, i);
      }
    } else {
      if (char === stringChar && content[i - 1] !== '\\') {
        inString = false;
      }
    }
  }

  return null;
}

function cleanForEval(body) {
  if (!body) return '';
  return body
    .replace(/\.\.\.[^,}\s]+/g, '"__spread__": true')
    .replace(/\w+\([^)]*\)/gs, '""')
    .replace(/appConfig\.[^,}\s]+/g, '""')
    .replace(/satisfies\s+Record<[^>]+>/g, '')
    .replace(/as\s+const/g, '');
}

console.log('🔍 Running translation validation...\n');

try {
  const messagesDir = path.join(
    __dirname,
    '../apps/web/src/shared/i18n/messages',
  );

  if (!fs.existsSync(messagesDir)) {
    console.error('❌ Messages directory not found:', messagesDir);
    process.exit(1);
  }

  console.log('📚 Scanning translation files...\n');

  const items = fs.readdirSync(messagesDir);
  const translationItems = items.filter(
    (item) =>
      (item.endsWith('.ts') &&
        item !== 'index.ts' &&
        !item.includes('example')) ||
      fs.lstatSync(path.join(messagesDir, item)).isDirectory(),
  );

  console.log(
    `📁 Found ${translationItems.length} translation items to check\n`,
  );

  const referenceLanguage = 'en';
  const languages = ['es', 'fr', 'ru', 'by'];
  let hasMissingKeys = false;

  for (const lang of languages) {
    console.log(`🌐 Checking ${lang.toUpperCase()} translations:`);
    let totalMissing = 0;

    for (const item of translationItems) {
      const fullPath = path.join(messagesDir, item);
      const isDirectory = fs.lstatSync(fullPath).isDirectory();

      try {
        let refKeys = new Set();
        let targetKeys = new Set();
        let checkName = item;

        if (item === 'legal') {
          const refFile = path.join(fullPath, `${referenceLanguage}.ts`);
          const langFile = path.join(fullPath, `${lang}.ts`);

          if (!fs.existsSync(refFile) || !fs.existsSync(langFile)) continue;

          const refContent = fs.readFileSync(refFile, 'utf8');
          const langContent = fs.readFileSync(langFile, 'utf8');

          const exportRegex =
            /(?:export\s+default\s+|export\s+const\s+\w+\s*(?::\s*\w+)?\s*=\s*)/;
          const refMatch = refContent.match(exportRegex);
          const langMatch = langContent.match(exportRegex);

          if (refMatch && langMatch) {
            const refBody = extractObject(
              refContent,
              refMatch.index + refMatch[0].length,
            );
            const langBody = extractObject(
              langContent,
              langMatch.index + langMatch[0].length,
            );

            if (refBody && langBody) {
              refKeys = new Set(
                collectKeys(eval(`({${cleanForEval(refBody)}})`)),
              );
              targetKeys = new Set(
                collectKeys(eval(`({${cleanForEval(langBody)}})`)),
              );
            }
          }
        } else if (item === 'games') {
          const indexPath = path.join(fullPath, 'index.ts');
          if (!fs.existsSync(indexPath)) continue;

          const content = fs.readFileSync(indexPath, 'utf8');
          // Games uses 2 spaces indentation for language keys
          const refMatch = content.match(
            new RegExp(`^  ${referenceLanguage}:`, 'm'),
          );
          const langMatch = content.match(new RegExp(`^  ${lang}:`, 'm'));

          if (refMatch && langMatch) {
            const refBody = extractObject(
              content,
              refMatch.index + refMatch[0].length,
            );
            const langBody = extractObject(
              content,
              langMatch.index + langMatch[0].length,
            );

            if (refBody && langBody) {
              refKeys = new Set(
                collectKeys(eval(`({${cleanForEval(refBody)}})`)),
              );
              targetKeys = new Set(
                collectKeys(eval(`({${cleanForEval(langBody)}})`)),
              );
            }
          }
        } else if (!isDirectory) {
          const fileName = item.replace('.ts', '');
          const content = fs.readFileSync(fullPath, 'utf8');

          const exportMatches = [
            ...content.matchAll(/export\s+const\s+(\w+Definition)\s*=/g),
          ];

          if (exportMatches.length > 0) {
            for (const match of exportMatches) {
              const defName = match[1];
              // Search within the definition block
              const defIndex = content.indexOf(defName);
              const defContent = extractObject(content, defIndex);

              if (defContent) {
                const refMatch = defContent.match(
                  new RegExp(`^  ${referenceLanguage}:`, 'm'),
                );
                const langMatch = defContent.match(
                  new RegExp(`^  ${lang}:`, 'm'),
                );

                if (refMatch && langMatch) {
                  const refBody = extractObject(
                    defContent,
                    refMatch.index + refMatch[0].length,
                  );
                  const langBody = extractObject(
                    defContent,
                    langMatch.index + langMatch[0].length,
                  );

                  if (refBody && langBody) {
                    const rKeys = collectKeys(
                      eval(`({${cleanForEval(refBody)}})`),
                    );
                    const lKeys = collectKeys(
                      eval(`({${cleanForEval(langBody)}})`),
                    );

                    const missing = rKeys.filter((k) => !lKeys.includes(k));
                    if (missing.length > 0) {
                      console.log(
                        `  ❌ Missing ${missing.length} keys in ${fileName} (${defName}):`,
                      );
                      missing
                        .slice(0, 5)
                        .forEach((k) => console.log(`    - ${k}`));
                      totalMissing += missing.length;
                    } else {
                      console.log(
                        `  ✅ All ${rKeys.length} keys present in ${fileName} (${defName})`,
                      );
                    }
                  }
                }
              }
            }
            continue;
          } else {
            // Standard file, language keys are usually indented with 2 spaces
            const refMatch = content.match(
              new RegExp(`^  ${referenceLanguage}:`, 'm'),
            );
            const langMatch = content.match(new RegExp(`^  ${lang}:`, 'm'));

            if (refMatch && langMatch) {
              const refBody = extractObject(
                content,
                refMatch.index + refMatch[0].length,
              );
              const langBody = extractObject(
                content,
                langMatch.index + langMatch[0].length,
              );

              if (refBody && langBody) {
                refKeys = new Set(
                  collectKeys(eval(`({${cleanForEval(refBody)}})`)),
                );
                targetKeys = new Set(
                  collectKeys(eval(`({${cleanForEval(langBody)}})`)),
                );
              }
            }
          }
        } else {
          // Generic directory
          const indexPath = path.join(fullPath, 'index.ts');
          if (fs.existsSync(indexPath)) {
            const content = fs.readFileSync(indexPath, 'utf8');
            const refMatch = content.match(
              new RegExp(`^  ${referenceLanguage}:`, 'm'),
            );
            const langMatch = content.match(new RegExp(`^  ${lang}:`, 'm'));

            if (refMatch && langMatch) {
              const refBody = extractObject(
                content,
                refMatch.index + refMatch[0].length,
              );
              const langBody = extractObject(
                content,
                langMatch.index + langMatch[0].length,
              );

              if (refBody && langBody) {
                refKeys = new Set(
                  collectKeys(eval(`({${cleanForEval(refBody)}})`)),
                );
                targetKeys = new Set(
                  collectKeys(eval(`({${cleanForEval(langBody)}})`)),
                );
              }
            }
          }
        }

        if (refKeys.size > 0) {
          const missing = [...refKeys].filter((k) => !targetKeys.has(k));
          if (missing.length > 0) {
            console.log(`  ❌ Missing ${missing.length} keys in ${checkName}:`);
            missing.slice(0, 5).forEach((k) => console.log(`    - ${k}`));
            totalMissing += missing.length;
          } else {
            console.log(
              `  ✅ All ${refKeys.size} keys present in ${checkName}`,
            );
          }
        }
      } catch (err) {
        // Silent
      }
    }

    if (totalMissing > 0) hasMissingKeys = true;
    console.log('');
  }

  console.log('='.repeat(50));
  if (hasMissingKeys) {
    console.log('❌ Translation validation completed with missing keys!');
    process.exit(1);
  } else {
    console.log('✅ All translation keys are present!');
    process.exit(0);
  }
} catch (error) {
  console.error('❌ General error:', error.message);
  process.exit(1);
}
